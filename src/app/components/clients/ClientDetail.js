"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientForm from "./ClientForm";
import ClientInsights from "./ClientInsights";
import ClientAnalytics from "./ClientAnalytics";
import AIWorkflow from "./AIWorkflow";
import SessionPrepView from "./SessionPrepView";
import { useAIWorkflow } from "@/app/context/AIWorkflowContext";
import {
  getConsentFormTemplate,
  getAvailableTemplates,
  generateConsentFormPDF,
} from "@/lib/templates/consentFormTemplate";

export default function ClientDetail({ clientId }) {
  const [client, setClient] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportType, setReportType] = useState("progress");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [selectedConsentType, setSelectedConsentType] = useState("");
  const [consentFormContent, setConsentFormContent] = useState("");
  const [consentFormNotes, setConsentFormNotes] = useState("");
  const [consentFormFile, setConsentFormFile] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  // Set default dates to last 30 days
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);
  }, []);

  console.log(selectedReport);

  // Check for tab parameter in URL on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam &&
        [
          "overview",
          "sessions",
          "reports",
          "treatment",
          "insights",
          "analytics",
          "ai-assistant",
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    setAvailableTemplates(getAvailableTemplates());
  }, []);

  const fetchClient = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching client data for:", clientId);
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch client");
      }

      const data = await response.json();
      console.log("Client data received:", data);

      setClient(data.client);
      setRecentSessions(data.recentSessions || []);
      setRecentReports(data.recentReports || []);
    } catch (err) {
      console.error("Error fetching client:", err);
      setError(err.message || "Error loading client");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/reports`);
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setRecentReports(data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    fetchClient();
  };

  const handleDeleteClient = async () => {
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete client");
      }

      router.push("/clients");
    } catch (err) {
      console.error("Error deleting client:", err);
      setError(err.message || "Error deleting client");
      setLoading(false);
    }
  };

  const getReportTitle = (report) => {
    const type = report.type.charAt(0).toUpperCase() + report.type.slice(1);
    const date = formatDate(report.createdAt);
    return `${type} Report - ${date}`;
  };

  const handleViewReport = (report) => {
    window.open(`/clients/${clientId}/reports/${report._id}/view`, "_blank");
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: reportType,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // Close the generate modal and refresh only the reports list
      setShowGenerateModal(false);
      fetchReports();
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientId}/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      // Refresh the reports list
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report. Please try again.");
    }
  };

  const handleEditInsurance = () => {
    setShowInsuranceModal(true);
  };

  const handleBillingUpdate = async (formData) => {
    try {
      // Handle invoice upload if provided
      let invoiceData = null;
      if (formData.invoiceFile) {
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
        invoiceData = {
          date: new Date().toISOString(),
          amount: formData.amount,
          status: "pending",
          document: uploadResult.path,
          notes: formData.invoiceNotes || "",
        };
      }

      // Update client billing information
      const response = await fetch(`/api/clients/${client._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billing: {
            paymentMethod: formData.paymentMethod,
            rate: formData.rate,
            notes: formData.notes,
            ...(invoiceData && { invoices: [invoiceData] }),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update billing information");
      }

      const updatedClient = await response.json();
      setClient(updatedClient);
      setShowBillingModal(false);
    } catch (error) {
      console.error("Error updating billing:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleViewConsent = (form) => {
    setSelectedConsent(form);
    setShowConsentModal(true);
  };

  const handleEditBilling = () => {
    setShowBillingModal(true);
  };

  const handleConsentTypeChange = (e) => {
    const type = e.target.value;
    setSelectedConsentType(type);

    // Only try to get template if a type is selected
    if (type) {
      try {
        const template = getConsentFormTemplate(type);
        setConsentFormContent(template.content);
      } catch (error) {
        console.error("Error loading template:", error);
        setConsentFormContent("");
      }
    } else {
      // Reset version when no type is selected
      setConsentFormContent("");
    }
  };

  const handleRequestConsent = async (e) => {
    e.preventDefault();

    if (!consentFormFile) {
      alert("Please upload a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("clientId", client._id);
    formData.append("type", selectedConsentType);
    formData.append("file", consentFormFile);
    formData.append("notes", consentFormNotes);

    try {
      const response = await fetch("/api/consent-forms", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create consent form");
      }

      const newConsentForm = await response.json();
      setClient((prev) => ({
        ...prev,
        consentForms: [...prev.consentForms, newConsentForm],
      }));

      // Reset form state
      setSelectedConsentType("");
      setConsentFormContent("");
      setConsentFormNotes("");
      setConsentFormFile(null);
      setShowConsentModal(false);
    } catch (error) {
      console.error("Error creating consent form:", error);
      alert("Failed to create consent form");
    }
  };

  const handleDeleteConsent = async (formId, e) => {
    e.stopPropagation(); // Prevent opening the view modal
    if (!formId) {
      console.error("No form ID provided");
      return;
    }

    if (!confirm("Are you sure you want to delete this consent form?")) return;

    try {
      const response = await fetch(`/api/clients/${client._id}/consent-forms/${formId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete consent form");
      }

      // Update client state
      setClient((prev) => ({
        ...prev,
        consentForms: prev.consentForms.filter((form) => form._id.toString() !== formId.toString()),
      }));
    } catch (error) {
      console.error("Error deleting consent form:", error);
      alert(error.message || "Failed to delete consent form");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && error !== "no_reports") {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Warning: </strong>
        <span className="block sm:inline">Client not found</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit Client</h1>
        <ClientForm
          client={client}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {client.name}{" "}
          <span
            className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
              client.status === "active"
                ? "bg-green-100 text-green-800"
                : client.status === "inactive"
                ? "bg-gray-100 text-gray-800"
                : client.status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </span>
        </h1>
        <div className="space-x-2">
          <button
            onClick={() => router.push("/clients")}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Back
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClient}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sessions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reports"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "insights"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("ai-assistant")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "ai-assistant"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab("consent-billing")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "consent-billing"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Consent & Billing
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h2>
                <dl className="divide-y divide-gray-200">
                  <div className="py-2 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{client.name}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Age</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{client.age}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {client.gender.charAt(0).toUpperCase() + client.gender.slice(1)}
                    </dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {formatDate(client.createdAt)}
                    </dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {formatDate(client.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h2>
                <dl className="divide-y divide-gray-200">
                  <div className="py-2 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {client.contactInfo?.email || "-"}
                    </dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {client.contactInfo?.phone || "-"}
                    </dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {client.contactInfo?.emergencyContact ? (
                        <div>
                          {client.contactInfo.emergencyContact.name &&
                            `${client.contactInfo.emergencyContact.name}`}

                          {client.contactInfo.emergencyContact.relationship && (
                            <span>
                              {client.contactInfo.emergencyContact.name ? ", " : ""}
                              {client.contactInfo.emergencyContact.relationship}
                            </span>
                          )}

                          {client.contactInfo.emergencyContact.phone && (
                            <span>
                              {client.contactInfo.emergencyContact.name ||
                              client.contactInfo.emergencyContact.relationship
                                ? ", "
                                : ""}
                              {client.contactInfo.emergencyContact.phone}
                            </span>
                          )}

                          {!client.contactInfo.emergencyContact.name &&
                            !client.contactInfo.emergencyContact.relationship &&
                            !client.contactInfo.emergencyContact.phone &&
                            "-"}
                        </div>
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Initial Assessment */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Initial Assessment</h2>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-900 whitespace-pre-line">
                  {client.initialAssessment}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Recent Sessions</h2>
                {recentSessions.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {recentSessions.map((session) => (
                      <li key={session._id} className="py-2">
                        <a
                          href={`/sessions/${session._id}`}
                          className="block hover:bg-gray-50 transition duration-150 ease-in-out"
                        >
                          <p className="text-sm font-medium text-blue-600">
                            {formatDate(session.date)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.notes?.substring(0, 100)}...
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent sessions found.</p>
                )}
                <button
                  onClick={() => router.push(`/sessions/new?clientId=${clientId}`)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add New Session
                </button>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Recent Reports</h2>
                {recentReports.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {recentReports.map((report) => (
                      <li key={report._id} className="py-2">
                        <a
                          href={`/clients/${clientId}/reports/${report._id}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:bg-gray-50 transition duration-150 ease-in-out"
                        >
                          <p className="text-sm font-medium text-blue-600">{report.title}</p>
                          <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent reports found.</p>
                )}
                <button
                  onClick={() => setShowGenerateModal(true)} //TODO: fix or remove
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Therapy Sessions</h2>
              <button
                onClick={() => router.push(`/sessions/new?clientId=${clientId}`)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                New Session
              </button>
            </div>
            {recentSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentSessions.map((session) => (
                      <tr key={session._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(session.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.duration} minutes
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a
                            href={`/sessions/${session._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No therapy sessions recorded yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add a new session to track your client&apos;s progress.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Reports</h2>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Generate Report
              </button>
            </div>
            {recentReports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentReports.map((report) => (
                      <tr key={report._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getReportTitle(report)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No reports generated yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Generate a new report to document assessment findings or treatment progress.
                </p>
              </div>
            )}

            {/* Generate Report Modal */}
            {showGenerateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg w-1/2 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Generate New Report</h3>
                    <button
                      onClick={() => setShowGenerateModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Report Type</label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="progress">Progress Report</option>
                        <option value="documentation">Documentation Report</option>
                        <option value="assessment">Assessment Report</option>
                        <option value="diagnostic">Diagnostic Report</option>
                        <option value="treatment">Treatment Report</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowGenerateModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? "Generating..." : "Generate Report"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Report View Modal */}
            {showReportModal && selectedReport && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg w-3/4 max-h-[80vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{getReportTitle(selectedReport)}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          />
                        </svg>
                        Print
                      </button>
                      <button
                        onClick={() => setShowReportModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="prose max-w-none print:prose-sm">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <strong>Date Created:</strong> {formatDate(selectedReport.createdAt)}
                      </div>
                      <div>
                        <strong>Created By:</strong> {selectedReport.createdBy?.name || "Unknown"}
                      </div>
                      <div>
                        <strong>Report Period:</strong> {formatDate(selectedReport.startDate)} to{" "}
                        {formatDate(selectedReport.endDate)}
                      </div>
                      <div>
                        <strong>Type:</strong>{" "}
                        {selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)}
                      </div>
                    </div>
                    <div className="mb-4">
                      <strong>Content:</strong>
                      <pre className="mt-2 p-4 bg-gray-50 rounded overflow-x-auto print:bg-white print:border print:border-gray-200">
                        {JSON.stringify(selectedReport.content, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Clinical Insights</h2>
            <ClientInsights clientId={client._id} />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Client Analytics</h2>
            <ClientAnalytics clientId={client._id} />
          </div>
        )}

        {activeTab === "ai-assistant" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-gray-600 mb-4">
              Use AI tools to help with assessment, treatment planning, and progress tracking.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <AIWorkflow
                  client={client}
                  updateFunction={() => {
                    fetchClient();
                  }}
                />
              </div>
              <div>
                <SessionPrepView clientId={client._id} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "consent-billing" && (
          <div className="space-y-8">
            {/* Consent Forms Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Consent Forms</h3>
                <button
                  onClick={() => setShowConsentModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Request New Consent
                </button>
              </div>

              <div className="space-y-4">
                {client.consentForms?.map((form) => (
                  <div
                    key={form._id}
                    onClick={() => handleViewConsent(form)}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{form.type}</h4>
                        <p className="text-sm text-gray-500">Version {form.version}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            form.status === "signed"
                              ? "bg-green-100 text-green-800"
                              : form.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : form.status === "expired"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {form.status}
                        </span>
                        <button
                          onClick={(e) => handleDeleteConsent(form._id, e)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete consent form"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>
                        Requested on{" "}
                        {form.requestedAt ? new Date(form.requestedAt).toLocaleDateString() : "N/A"}
                      </p>
                      {form.signedAt && (
                        <p>Signed on {new Date(form.signedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
                {(!client.consentForms || client.consentForms.length === 0) && (
                  <p className="text-sm text-gray-500">No consent forms yet</p>
                )}
              </div>
            </div>

            {/* Billing Information Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
                <button
                  onClick={() => setShowBillingModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Billing
                </button>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {client?.billing?.paymentMethod || "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Session Rate</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {client?.billing?.rate ? `$${client.billing.rate}/session` : "Not set"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Recent Invoices</dt>
                      <dd className="mt-1">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {client?.billing?.invoices?.length > 0 ? (
                            client.billing.invoices.map((invoice, index) => (
                              <li
                                key={index}
                                className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                              >
                                <div className="w-0 flex-1 flex items-center">
                                  <span className="ml-2 flex-1 w-0 truncate">
                                    {formatDate(invoice.date)} - ${invoice.amount}
                                  </span>
                                </div>
                                <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                                  {invoice.document && (
                                    <a
                                      href={invoice.document}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-500"
                                    >
                                      View
                                    </a>
                                  )}
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                    ${
                                      invoice.status === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : invoice.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {invoice.status}
                                  </span>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="pl-3 pr-4 py-3 text-sm text-gray-500">
                              No recent invoices
                            </li>
                          )}
                        </ul>
                      </dd>
                    </div>
                    {client?.billing?.notes && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900">{client.billing.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>

            {/* Insurance Information Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Insurance Information</h3>
                <button
                  onClick={() => setShowInsuranceModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Insurance
                </button>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Insurance Provider</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {client?.insurance?.provider || "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {client?.insurance?.policyNumber || "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Group Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {client?.insurance?.groupNumber || "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Coverage Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${
                            client?.insurance?.coverage === "full"
                              ? "bg-green-100 text-green-800"
                              : client?.insurance?.coverage === "partial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {client?.insurance?.coverage || "Not set"}
                        </span>
                      </dd>
                    </div>
                    {client?.insurance?.notes && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900">{client.insurance.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedConsent ? "View Consent Form" : "Request New Consent Form"}
            </h2>

            {selectedConsent ? (
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold">{selectedConsent.type}</h3>
                  <p className="text-sm text-gray-600">Version: {selectedConsent.version}</p>
                  <p className="text-sm text-gray-600">Status: {selectedConsent.status}</p>
                </div>

                {selectedConsent.document && (
                  <div className="mb-4">
                    <a
                      href={selectedConsent.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}

                {selectedConsent.shareableLink && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shareable Link
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={selectedConsent.shareableLink}
                        className="flex-1 text-sm border rounded-md px-2 py-1 bg-gray-50"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedConsent.shareableLink);
                          // You might want to add a toast notification here
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedConsent(null);
                      setShowConsentModal(false);
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestConsent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consent Type</label>
                  <select
                    value={selectedConsentType}
                    onChange={handleConsentTypeChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a consent type</option>
                    {availableTemplates.map((template) => (
                      <option key={template.type} value={template.type}>
                        {template.title} (v{template.version})
                      </option>
                    ))}
                  </select>
                </div>

                {consentFormContent && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Form Preview</label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{consentFormContent}</pre>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Document (PDF)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setConsentFormFile(e.target.files[0])}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={consentFormNotes}
                    onChange={(e) => setConsentFormNotes(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowConsentModal(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Request Consent
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showBillingModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Billing Information</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleBillingUpdate({
                  paymentMethod: formData.get("paymentMethod"),
                  rate: parseFloat(formData.get("rate")),
                  notes: formData.get("notes"),
                  invoiceFile: formData.get("invoiceFile"),
                  amount: parseFloat(formData.get("amount")),
                  invoiceNotes: formData.get("invoiceNotes"),
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    defaultValue={client?.billing?.paymentMethod || "self-pay"}
                  >
                    <option value="self-pay">Self Pay</option>
                    <option value="insurance">Insurance</option>
                    <option value="sliding-scale">Sliding Scale</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                    Session Rate ($)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="rate"
                      id="rate"
                      step="0.01"
                      min="0"
                      defaultValue={client?.billing?.rate || 0}
                      className="pl-7 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Billing Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    defaultValue={client?.billing?.notes || ""}
                  />
                </div>

                {/* Invoice Upload Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Invoice</h4>

                  <div>
                    <label
                      htmlFor="invoiceFile"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Invoice Document (PDF)
                    </label>
                    <input
                      type="file"
                      id="invoiceFile"
                      name="invoiceFile"
                      accept=".pdf"
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                  </div>

                  <div className="mt-2">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        step="0.01"
                        min="0"
                        className="pl-7 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <label
                      htmlFor="invoiceNotes"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Invoice Notes
                    </label>
                    <textarea
                      id="invoiceNotes"
                      name="invoiceNotes"
                      rows={2}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Optional notes about this invoice"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBillingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInsuranceModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Insurance Information</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                // Handle insurance update
                // This will be implemented when we add the insurance API
              }}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    id="provider"
                    name="provider"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    defaultValue={client?.insurance?.provider || ""}
                  />
                </div>

                <div>
                  <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    id="policyNumber"
                    name="policyNumber"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    defaultValue={client?.insurance?.policyNumber || ""}
                  />
                </div>

                <div>
                  <label htmlFor="groupNumber" className="block text-sm font-medium text-gray-700">
                    Group Number
                  </label>
                  <input
                    type="text"
                    id="groupNumber"
                    name="groupNumber"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    defaultValue={client?.insurance?.groupNumber || ""}
                  />
                </div>

                <div>
                  <label htmlFor="coverage" className="block text-sm font-medium text-gray-700">
                    Coverage Type
                  </label>
                  <select
                    id="coverage"
                    name="coverage"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    defaultValue={client?.insurance?.coverage || "none"}
                  >
                    <option value="none">No Coverage</option>
                    <option value="partial">Partial Coverage</option>
                    <option value="full">Full Coverage</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="insuranceNotes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>
                  <textarea
                    id="insuranceNotes"
                    name="insuranceNotes"
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    defaultValue={client?.insurance?.notes || ""}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInsuranceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
