"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function BillingInfo({ client, onUpdate, onDelete }) {
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const handleEditBilling = () => {
    setSelectedInvoice(null);
    setShowBillingModal(true);
  };

  const handleBillingUpdate = async (formData) => {
    try {
      // Prepare the update data for basic billing info
      const updateData = {
        paymentMethod: formData.paymentMethod,
        rate: formData.rate,
        notes: formData.notes,
        invoices: client?.billing?.invoices || [],
      };

      // Only process invoice data if an amount is provided
      if (formData.amount) {
        let invoiceData = {
          _id: formData.invoiceId || undefined,
          date: new Date().toISOString(),
          amount: formData.amount,
          status: "pending",
          notes: formData.invoiceNotes || "",
        };

        // Add document info if a file was uploaded
        if (formData.invoiceFile && formData.invoiceFile.size > 0) {
          console.log("Uploading file:", formData.invoiceFile);
          const uploadFormData = new FormData();
          uploadFormData.append("file", formData.invoiceFile);

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload invoice");
          }

          const uploadResult = await uploadResponse.json();
          console.log("Upload result:", uploadResult);
          invoiceData.document = uploadResult.path;
          invoiceData.documentKey = uploadResult.key;
        } else if (formData.invoiceId && selectedInvoice?.document) {
          // Keep existing document if editing and no new file uploaded
          invoiceData.document = selectedInvoice.document;
          invoiceData.documentKey = selectedInvoice.documentKey;
        }

        console.log("Invoice data before update:", invoiceData);

        // Update or add the invoice
        if (formData.invoiceId) {
          // Update existing invoice
          updateData.invoices = updateData.invoices.map((invoice) =>
            invoice._id === formData.invoiceId ? invoiceData : invoice
          );
        } else {
          // Add new invoice only if it doesn't already exist
          const existingInvoice = updateData.invoices.find(
            (inv) => inv.amount === formData.amount && inv.date === invoiceData.date
          );
          if (!existingInvoice) {
            updateData.invoices = [...updateData.invoices, invoiceData];
          }
        }
      }

      console.log("Update data:", updateData);

      // Update client billing information
      const response = await fetch(`/api/clients/${client._id}/billing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update billing information");
      }

      const updatedBilling = await response.json();
      console.log("Updated billing:", updatedBilling);
      onUpdate({
        ...client,
        billing: updatedBilling,
      });
      setSelectedInvoice(null);
      setShowBillingModal(false);
    } catch (error) {
      console.error("Error updating billing:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleViewInvoice = (invoice) => {
    if (invoice.document) {
      window.open(invoice.document, "_blank");
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${client._id}/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      // Update the client state by removing the deleted invoice
      onUpdate({
        ...client,
        billing: {
          ...client.billing,
          invoices: client.billing.invoices.filter((invoice) => invoice._id !== invoiceId),
        },
      });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      // Handle error (show toast, etc.)
    }
  };

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch(`/api/sessions?clientId=${client._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const sessions = await response.json();
      setSessions(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      alert("Failed to load sessions");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!client.billing?.rate) {
      alert("Please set a session rate first");
      return;
    }

    setIsGenerating(true);
    try {
      await fetchSessions();

      if (!sessions || sessions.length === 0) {
        alert("No sessions available to invoice");
        return;
      }

      setShowSessionModal(true);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to load sessions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSessionSelection = async () => {
    if (selectedSessions.length === 0) {
      alert("Please select at least one session");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/clients/${client._id}/invoices/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessions: selectedSessions,
          notes: "Automatically generated invoice",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const data = await response.json();

      // Update the client state with the new invoice
      onUpdate({
        ...client,
        billing: {
          ...client.billing,
          invoices: [...(client.billing?.invoices || []), data.invoice],
        },
      });

      // Open the generated invoice
      window.open(data.documentUrl, "_blank");
      setShowSessionModal(false);
      setSelectedSessions([]);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      const response = await fetch(`/api/clients/${client._id}/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "paid",
          paymentDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark invoice as paid");
      }

      const data = await response.json();
      if (data.success) {
        // Update the invoice in the state with the new document URL
        onUpdate({
          ...client,
          billing: {
            ...client.billing,
            invoices: client.billing.invoices.map((inv) =>
              inv._id === invoiceId
                ? {
                    ...inv,
                    status: "paid",
                    paymentDate: new Date().toISOString(),
                    document: data.invoice.document,
                    documentKey: data.invoice.documentKey,
                  }
                : inv
            ),
          },
        });
      }
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
    }
  };

  const renderInvoiceStatus = (invoice) => {
    if (invoice.status === "paid") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Billing Information</h3>
          <div>
            <button
              onClick={handleEditBilling}
              className="text-sm text-blue-600 hover:text-blue-800 mr-4"
            >
              {client?.billing ? "Edit Billing" : "Add Billing Information"}
            </button>
            {client?.billing && (
              <>
                <button
                  onClick={handleGenerateInvoice}
                  disabled={isGenerating}
                  className="text-sm text-green-600 hover:text-green-800 mr-4"
                >
                  {isGenerating ? "Generating..." : "Generate Invoice"}
                </button>
                <button onClick={onDelete} className="text-sm text-red-600 hover:text-red-800">
                  Delete Billing
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {client?.billing ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {client.billing.paymentMethod === "self-pay" && "Self Pay"}
                  {client.billing.paymentMethod === "insurance" && "Insurance"}
                  {client.billing.paymentMethod === "sliding-scale" && "Sliding Scale"}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Session Rate</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {client.billing.rate ? `$${client.billing.rate}` : "Not set"}
                </dd>
              </div>

              {client.billing.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">{client.billing.notes}</dd>
                </div>
              )}

              {/* Only show invoices section if there are valid invoices */}
              {Array.isArray(client?.billing?.invoices) &&
                client.billing.invoices.length > 0 &&
                client.billing.invoices.some((inv) => inv.amount) && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Recent Invoices</dt>
                    <dd className="mt-1">
                      <div className="space-y-4">
                        {client.billing.invoices.map((invoice) => (
                          <div key={invoice._id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  Invoice #
                                  {invoice.invoiceNumber || invoice._id.toString().slice(-6)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Date: {new Date(invoice.date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">Amount: ${invoice.amount}</p>
                                <p className="text-sm">Status: {renderInvoiceStatus(invoice)}</p>
                              </div>
                              <div className="flex space-x-2">
                                {invoice.status !== "paid" && (
                                  <button
                                    onClick={() => handleMarkAsPaid(invoice._id)}
                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                                <a
                                  href={invoice.document}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  View PDF
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
            </dl>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-500">No billing information has been added yet.</p>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Billing Information</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleBillingUpdate({
                  paymentMethod: formData.get("paymentMethod"),
                  rate: formData.get("rate"),
                  notes: formData.get("notes"),
                  invoiceFile: formData.get("invoiceFile"),
                  amount: formData.get("amount"),
                  invoiceNotes: formData.get("invoiceNotes"),
                  invoiceId: formData.get("invoiceId"),
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select
                    name="paymentMethod"
                    defaultValue={client.billing?.paymentMethod}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="self-pay">Self Pay</option>
                    <option value="insurance">Insurance</option>
                    <option value="sliding-scale">Sliding Scale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Session Rate</label>
                  <input
                    type="number"
                    name="rate"
                    defaultValue={client.billing?.rate}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Billing Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={client.billing?.notes}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-2">
                    {selectedInvoice ? "Edit Invoice" : "Add Invoice"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Invoice Document {selectedInvoice?.document && "(Replace Current)"}
                      </label>
                      <input
                        type="file"
                        name="invoiceFile"
                        accept=".pdf"
                        className="mt-1 block w-full"
                      />
                      {selectedInvoice?.document && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current document:
                          <a
                            href={selectedInvoice.document}
                            target="_blank"
                            className="text-blue-500 ml-1"
                          >
                            View
                          </a>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input
                        type="number"
                        name="amount"
                        defaultValue={selectedInvoice?.amount || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Invoice Notes
                      </label>
                      <textarea
                        name="invoiceNotes"
                        defaultValue={selectedInvoice?.notes || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <input type="hidden" name="invoiceId" value={selectedInvoice?._id || ""} />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowBillingModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Selection Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Select Sessions for Invoice</h2>
            {isLoadingSessions ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Loading sessions...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSessions.some((s) => s._id === session._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSessions([...selectedSessions, session]);
                        } else {
                          setSelectedSessions(
                            selectedSessions.filter((s) => s._id !== session._id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {new Date(session.date).toLocaleDateString()} - {session.duration || "60"}{" "}
                        minutes
                      </p>
                      {session.notes && (
                        <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${client.billing.rate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Total: ${selectedSessions.length * client.billing.rate}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowSessionModal(false);
                    setSelectedSessions([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSessionSelection}
                  disabled={isGenerating || selectedSessions.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
