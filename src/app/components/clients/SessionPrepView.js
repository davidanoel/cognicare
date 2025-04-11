"use client";

import { useState, useEffect } from "react";

export default function SessionPrepView({ clientId, sessionId }) {
  const [sessionPrep, setSessionPrep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionPrep = async () => {
      if (!clientId) return;

      setLoading(true);
      setError(null);

      try {
        // First try to get session-specific AI treatment report
        let url = sessionId
          ? `/api/clients/${clientId}/ai-reports?type=treatment&sessionId=${sessionId}&limit=1`
          : `/api/clients/${clientId}/ai-reports?type=treatment&limit=1`;

        let response = await fetch(url);
        let data;

        if (response.ok) {
          data = await response.json();
        }

        // If no session-specific report found and we were looking for one,
        // fall back to the most recent AI treatment report for this client
        if ((!data || !data.reports || data.reports.length === 0) && sessionId) {
          const fallbackUrl = `/api/clients/${clientId}/ai-reports?type=treatment&limit=1`;
          const fallbackResponse = await fetch(fallbackUrl);

          if (fallbackResponse.ok) {
            data = await fallbackResponse.json();
          }
        }

        if (data && data.reports && data.reports.length > 0) {
          setSessionPrep(data.reports[0]);
        } else {
          setSessionPrep(null);
        }
      } catch (err) {
        console.error("Error fetching session prep:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionPrep();
  }, [clientId, sessionId]);

  if (loading) {
    return (
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Session Preparation</h3>
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Loading session guidance...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Session Preparation</h3>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!sessionPrep) {
    return (
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Session Preparation</h3>
        <p className="text-gray-600">
          No session preparation data available. Use the AI Assistant to generate guidance for your
          next session.
        </p>
      </div>
    );
  }

  const content = sessionPrep.content || {};

  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Session Preparation</h3>

      <div className="space-y-4">
        {/* Summary */}
        {content.summary && (
          <div className="bg-white p-3 rounded shadow-sm">
            <h4 className="font-medium text-blue-700 mb-2">Treatment Summary</h4>
            <p className="text-sm text-gray-700">{content.summary}</p>
          </div>
        )}

        {/* Goals */}
        {content.goals &&
          (content.goals.shortTerm?.length > 0 || content.goals.longTerm?.length > 0) && (
            <div className="bg-white p-3 rounded shadow-sm">
              <h4 className="font-medium text-blue-700 mb-2">Treatment Goals</h4>
              {content.goals.shortTerm?.length > 0 && (
                <>
                  <h5 className="font-medium text-gray-700 text-sm mt-2">Short-term:</h5>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {content.goals.shortTerm.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </>
              )}
              {content.goals.longTerm?.length > 0 && (
                <>
                  <h5 className="font-medium text-gray-700 text-sm mt-2">Long-term:</h5>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {content.goals.longTerm.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

        {/* Interventions */}
        {content.interventions && content.interventions.length > 0 && (
          <div className="bg-white p-3 rounded shadow-sm">
            <h4 className="font-medium text-blue-700 mb-2">Suggested Interventions</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {content.interventions.map((intervention, index) => (
                <li key={index}>{intervention}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Measurable Outcomes */}
        {content.measurableOutcomes && content.measurableOutcomes.length > 0 && (
          <div className="bg-white p-3 rounded shadow-sm">
            <h4 className="font-medium text-blue-700 mb-2">Measurable Outcomes</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {content.measurableOutcomes.map((outcome, index) => (
                <li key={index}>{outcome}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Potential Barriers */}
        {content.potentialBarriers && content.potentialBarriers.length > 0 && (
          <div className="bg-white p-3 rounded shadow-sm">
            <h4 className="font-medium text-blue-700 mb-2">Risk Factors and Barriers</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {content.potentialBarriers.map((barrier, index) => (
                <li key={index}>{barrier}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Approaches */}
        {content.recommendedApproaches && content.recommendedApproaches.length > 0 && (
          <div className="bg-white p-3 rounded shadow-sm">
            <h4 className="font-medium text-blue-700 mb-2">Recommended Approaches</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {content.recommendedApproaches.map((approach, index) => (
                <li key={index}>{approach}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Generated: {new Date(sessionPrep.metadata?.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
