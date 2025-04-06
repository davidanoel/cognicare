"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientForm from "./ClientForm";
import ClientInsights from "./ClientInsights";

export default function ClientDetail({ clientId }) {
  const [client, setClient] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [treatmentReport, setTreatmentReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (clientId) {
      fetchClient();
      fetchTreatmentPlan();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch client");
      }

      const data = await response.json();
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

  const fetchTreatmentPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/reports/${clientId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setTreatmentReport(null);
          return;
        } else {
          const errorData = await response.json();
          console.error("Error fetching treatment plan:", errorData);
        }
      }

      const reports = await response.json();
      const treatment = reports.find((r) => r.type === "treatment");
      setTreatmentReport(treatment || null);
    } catch (err) {
      console.error("Error fetching treatment plan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
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
    <div>
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
            onClick={() => setActiveTab("treatment")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "treatment"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Treatment Plan
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
                          href={`/reports/${report._id}`}
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
                  onClick={() => router.push(`/clients/${clientId}/reports/new`)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Generate New Report
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
                onClick={() => router.push(`/clients/${clientId}/reports/new`)}
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
                          {report.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a
                            href={`/reports/${report._id}`}
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
                <p className="text-gray-500">No reports generated yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Generate a new report to document assessment findings or treatment progress.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "treatment" && (
          <div className="space-y-6">
            {!treatmentReport ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
                <strong className="font-bold">No Treatment Plan Available</strong>
                <p className="mt-2">
                  This client does not have a treatment plan yet. Create a new session to generate a
                  treatment plan.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Section */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Current Focus</h4>
                      <p className="text-gray-600">
                        {treatmentReport.content.currentFocus || "Not defined"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Primary Goals</h4>
                      {Array.isArray(treatmentReport.content.goals) ? (
                        <ul className="list-disc ml-4 text-gray-600">
                          {treatmentReport.content.goals.map((goal, i) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No goals defined</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Key Interventions
                      </h4>
                      <ul className="list-disc ml-4 text-gray-600">
                        {treatmentReport.content.interventions
                          ?.slice(0, 2)
                          .map((intervention, i) => (
                            <li key={i}>{intervention}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Next Steps</h4>
                      <ul className="list-disc ml-4 text-gray-600">
                        {treatmentReport.content.nextSteps?.slice(0, 2).map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Interventions */}
                {treatmentReport.content.interventions?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Interventions</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="list-disc ml-5 space-y-2">
                        {treatmentReport.content.interventions.map((intervention, index) => (
                          <li key={index} className="text-gray-700">
                            {intervention}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Treatment Goals */}
                {treatmentReport.content.goals && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Goals</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      {/* Short Term Goals */}
                      {treatmentReport.content.goals.shortTerm?.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-2">
                            Short Term Goals
                          </h4>
                          <ul className="list-disc ml-5 space-y-2">
                            {treatmentReport.content.goals.shortTerm.map((goal, index) => (
                              <li key={index} className="text-gray-700">
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Long Term Goals */}
                      {treatmentReport.content.goals.longTerm?.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-2">
                            Long Term Goals
                          </h4>
                          <ul className="list-disc ml-5 space-y-2">
                            {treatmentReport.content.goals.longTerm.map((goal, index) => (
                              <li key={index} className="text-gray-700">
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {treatmentReport.content.timeline && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="list-disc ml-5 space-y-2">
                        {Object.entries(treatmentReport.content.timeline).map(([key, value]) => (
                          <li key={key} className="text-gray-700">
                            {typeof value === "object" ? (
                              <span>
                                {value.milestone} ({value.timeframe})
                              </span>
                            ) : (
                              value
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Recommended Approaches */}
                {treatmentReport.content.recommendedApproaches?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Recommended Approaches
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="list-disc ml-5 space-y-2">
                        {treatmentReport.content.recommendedApproaches.map((approach, index) => (
                          <li key={index} className="text-gray-700">
                            {approach}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Success Metrics */}
                {treatmentReport.content.successMetrics?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Success Metrics</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="list-disc ml-5 space-y-2">
                        {treatmentReport.content.successMetrics.map((metric, index) => (
                          <li key={index} className="text-gray-700">
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Potential Barriers */}
                {treatmentReport.content.potentialBarriers?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Potential Barriers</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="list-disc ml-5 space-y-2">
                        {treatmentReport.content.potentialBarriers.map((barrier, index) => (
                          <li key={index} className="text-gray-700">
                            {barrier}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(treatmentReport.updatedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Clinical Insights</h2>
        <ClientInsights clientId={client._id} />
      </div>

      {/* Sessions Section */}
      <div className="mt-6">{/* ... existing sessions section ... */}</div>
    </div>
  );
}
