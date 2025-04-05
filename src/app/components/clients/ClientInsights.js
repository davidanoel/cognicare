import { useState, useEffect } from "react";

export default function ClientInsights({ clientId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/reports/${clientId}`);
        if (!response.ok) {
          if (response.status === 404) {
            // No reports yet
            setError("no_reports");
          } else {
            throw new Error("Failed to fetch insights");
          }
        }
        const data = await response.json();
        setInsights(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchInsights();
    }
  }, [clientId]);

  if (loading) return <div className="p-4">Loading insights...</div>;
  if (error === "no_reports") {
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-600">
          No AI insights available yet. They will appear here after the initial assessment.
        </p>
      </div>
    );
  }
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!insights) return null;

  const { assessment, diagnostic, treatment } = insights;

  return (
    <div className="space-y-6">
      {assessment && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Initial Assessment</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium mr-2">Risk Level:</span>
              <span className={getRiskLevelColor(assessment.content.riskLevel)}>
                {assessment.content.riskLevel}
              </span>
            </div>
            <div>
              <span className="font-medium">Primary Concerns:</span>
              <ul className="list-disc ml-5 mt-1">
                {assessment.content.primaryConcerns.map((concern, i) => (
                  <li key={i}>{concern}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {diagnostic && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Diagnostic Impression</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Primary Diagnosis:</span>
              <p className="mt-1">{diagnostic.content.primaryDiagnosis}</p>
            </div>
            {diagnostic.content.recommendations && (
              <div>
                <span className="font-medium">Recommendations:</span>
                <ul className="list-disc ml-5 mt-1">
                  {diagnostic.content.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {treatment && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Treatment Plan</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Goals:</span>
              <ul className="list-disc ml-5 mt-1">
                {treatment.content.goals.map((goal, i) => (
                  <li key={i}>{goal}</li>
                ))}
              </ul>
            </div>
            {treatment.content.interventions && (
              <div>
                <span className="font-medium">Interventions:</span>
                <ul className="list-disc ml-5 mt-1">
                  {treatment.content.interventions.map((intervention, i) => (
                    <li key={i}>{intervention}</li>
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
