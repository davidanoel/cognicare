import { useState, useEffect } from "react";

export default function SessionDocumentation({ sessionId, clientId }) {
  const [documentation, setDocumentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        const response = await fetch(`/api/reports/${clientId}/sessions/${sessionId}`);
        if (!response.ok) throw new Error("Failed to fetch documentation");
        const data = await response.json();
        setDocumentation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && clientId) {
      fetchDocumentation();
    }
  }, [sessionId, clientId]);

  if (loading) return <div className="p-4">Loading documentation...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!documentation) return null;

  const { content } = documentation;

  return (
    <div className="space-y-6">
      {/* SOAP Notes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Session Documentation</h3>

        <div className="space-y-4">
          {content.soap && (
            <>
              <div>
                <h4 className="font-medium text-gray-700">Subjective</h4>
                <p className="mt-1 text-gray-600">{content.soap.subjective}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Objective</h4>
                <p className="mt-1 text-gray-600">{content.soap.objective}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Assessment</h4>
                <p className="mt-1 text-gray-600">{content.soap.assessment}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Plan</h4>
                <p className="mt-1 text-gray-600">{content.soap.plan}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress Notes */}
      {content.progressNotes && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Progress Notes</h3>
          <p className="text-gray-600">{content.progressNotes}</p>
        </div>
      )}

      {/* Treatment Plan Updates */}
      {content.treatmentPlanUpdates && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Treatment Plan Updates</h3>
          <ul className="list-disc ml-5 space-y-1">
            {content.treatmentPlanUpdates.map((update, i) => (
              <li key={i} className="text-gray-600">
                {update}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Assessment */}
      {content.riskAssessment && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Risk Assessment Update</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium mr-2">Current Risk Level:</span>
              <span className={getRiskLevelColor(content.riskAssessment.level)}>
                {content.riskAssessment.level}
              </span>
            </div>
            {content.riskAssessment.concerns && (
              <div>
                <span className="font-medium">Concerns:</span>
                <ul className="list-disc ml-5 mt-1">
                  {content.riskAssessment.concerns.map((concern, i) => (
                    <li key={i} className="text-gray-600">
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Session */}
      {content.nextSession && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Next Session Plan</h3>
          <div className="space-y-2">
            <p className="text-gray-600">{content.nextSession.plan}</p>
            {content.nextSession.goals && (
              <div>
                <span className="font-medium">Focus Areas:</span>
                <ul className="list-disc ml-5 mt-1">
                  {content.nextSession.goals.map((goal, i) => (
                    <li key={i} className="text-gray-600">
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getRiskLevelColor(level) {
  const colors = {
    none: "text-green-600",
    low: "text-blue-600",
    moderate: "text-yellow-600",
    high: "text-orange-600",
    severe: "text-red-600",
  };
  return colors[level?.toLowerCase()] || "text-gray-600";
}
