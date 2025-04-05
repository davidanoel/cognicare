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
          throw new Error("Failed to fetch insights");
        }
        const data = await response.json();
        setInsights(data);
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchInsights();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading insights: {error}</div>;
  }

  if (!insights?.reports?.length) {
    return <div className="text-gray-500 italic">No AI insights available yet.</div>;
  }

  const latestAssessment = insights.reports.find((r) => r.type === "assessment");
  const latestDiagnostic = insights.reports.find((r) => r.type === "diagnostic");

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Insights</h3>

        {latestAssessment && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Assessment Summary
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Risk Level:</span>
                <span
                  className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${getRiskLevelColor(latestAssessment.metadata.riskLevel)}`}
                >
                  {latestAssessment.metadata.riskLevel}
                </span>
              </div>

              {latestAssessment.content.primaryConcerns && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Primary Concerns:</span>
                  <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                    {latestAssessment.content.primaryConcerns.map((concern, index) => (
                      <li key={index}>{concern}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {latestDiagnostic && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Diagnostic Impressions
            </h4>
            <div className="space-y-4">
              {latestDiagnostic.content.diagnoses && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Diagnoses:</span>
                  <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                    {latestDiagnostic.content.diagnoses.map((diagnosis, index) => (
                      <li key={index}>
                        {diagnosis.name} ({diagnosis.code})
                        {diagnosis.specifier && ` - ${diagnosis.specifier}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {latestDiagnostic.content.recommendations && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Recommendations:</span>
                  <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                    {latestDiagnostic.content.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {insights.summary && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Summary</h3>
          <div className="prose prose-sm max-w-none text-gray-600">
            {insights.summary.overview && <p>{insights.summary.overview}</p>}

            {insights.summary.milestones && insights.summary.milestones.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">Key Milestones</h4>
                <ul className="mt-1 list-disc list-inside">
                  {insights.summary.milestones.map((milestone, index) => (
                    <li key={index}>{milestone}</li>
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
    none: "bg-gray-100 text-gray-800",
    low: "bg-green-100 text-green-800",
    moderate: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    severe: "bg-red-100 text-red-800",
  };
  return colors[level?.toLowerCase()] || colors.none;
}
