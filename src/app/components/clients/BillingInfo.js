"use client";

import { useState } from "react";

export default function BillingInfo({ client, onUpdate, onDelete }) {
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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
              <button onClick={onDelete} className="text-sm text-red-600 hover:text-red-800">
                Delete Billing Information
              </button>
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
                      <div className="space-y-2">
                        {client.billing.invoices.map(
                          (invoice) =>
                            invoice.amount && (
                              <div
                                key={invoice._id}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div>
                                  <p className="text-sm font-medium">${invoice.amount}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(invoice.date).toLocaleDateString()}
                                  </p>
                                  {invoice.notes && (
                                    <p className="text-xs text-gray-500">{invoice.notes}</p>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  {invoice.document && (
                                    <button
                                      onClick={() => handleViewInvoice(invoice)}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      View
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedInvoice(invoice);
                                      setShowBillingModal(true);
                                    }}
                                    className="text-xs text-gray-600 hover:text-gray-800"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInvoice(invoice._id)}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )
                        )}
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
    </div>
  );
}
