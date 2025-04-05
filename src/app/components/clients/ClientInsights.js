import { useState, useEffect } from "react";

export default function ClientInsights({ clientId }) {
  const [assessmentReport, setAssessmentReport] = useState(null);
  const [diagnosticReport, setDiagnosticReport] = useState(null);
  const [treatmentReport, setTreatmentReport] = useState(null);
  const [documentationReport, setDocumentationReport] = useState(null);
  const [progressReport, setProgressReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      setAssessmentReport(null);
      setDiagnosticReport(null);
      setTreatmentReport(null);
      setDocumentationReport(null);
      setProgressReport(null);
      try {
        const response = await fetch(`/api/reports/${clientId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("no_reports");
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch insights");
          }
          // Don't proceed if response is not ok
          return;
        }

        const reports = await response.json();

        // Find the relevant reports from the array
        const assessment = reports.find(
          (r) => r.type === "assessment" && r.source === "initial-assessment"
        );
        const diagnostic = reports.find((r) => r.type === "diagnostic"); // Assuming only one diagnostic for now
        const treatment = reports.find((r) => r.type === "treatment"); // Assuming one treatment plan
        const documentation = reports.find((r) => r.type === "documentation");
        const progress = reports.find((r) => r.type === "progress");

        setAssessmentReport(assessment);
        setDiagnosticReport(diagnostic);
        setTreatmentReport(treatment);
        setDocumentationReport(documentation);
        setProgressReport(progress);

        if (!assessment && !diagnostic && !treatment && !documentation && !progress) {
          setError("no_reports"); // If reports array is empty or doesn't contain relevant types
        }
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

  if (
    error === "no_reports" ||
    (!assessmentReport &&
      !diagnosticReport &&
      !treatmentReport &&
      !documentationReport &&
      !progressReport)
  ) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-600">
          No AI insights available yet. They will appear here after assessments or reports are
          generated.
        </p>
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-500">Error fetching insights: {error}</div>;

  // Note: Check if report content exists before accessing nested properties
  const assessmentContent = assessmentReport?.content;
  const diagnosticContent = diagnosticReport?.content;
  const treatmentContent = treatmentReport?.content;
  const documentationContent = documentationReport?.content;
  const progressContent = progressReport?.content;

  return (
    <div className="space-y-6">
      {assessmentContent && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Initial Assessment Summary</h3>
          <div className="space-y-4">
            {assessmentContent.riskLevel && (
              <div className="flex items-center">
                <span className="font-medium mr-2">Risk Level:</span>
                <span className={getRiskLevelColor(assessmentContent.riskLevel)}>
                  {assessmentContent.riskLevel}
                </span>
              </div>
            )}
            {assessmentContent.primaryConcerns && assessmentContent.primaryConcerns.length > 0 && (
              <div>
                <span className="font-medium">Primary Concerns:</span>
                <ul className="list-disc ml-5 mt-1">
                  {assessmentContent.primaryConcerns.map((concern, i) => (
                    <li key={i}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}
            {assessmentContent.recommendedAssessmentTools &&
              assessmentContent.recommendedAssessmentTools.length > 0 && (
                <div>
                  <span className="font-medium">Recommended Assessment Tools:</span>
                  <ul className="list-disc ml-5 mt-1">
                    {assessmentContent.recommendedAssessmentTools.map((tool, i) => (
                      <li key={i}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}
            {assessmentContent.initialClinicalObservations && (
              <div>
                <span className="font-medium">Clinical Observations:</span>
                <p className="mt-1 text-gray-700">
                  {assessmentContent.initialClinicalObservations}
                </p>
              </div>
            )}
            {assessmentContent.suggestedNextSteps &&
              assessmentContent.suggestedNextSteps.length > 0 && (
                <div>
                  <span className="font-medium">Suggested Next Steps:</span>
                  <ul className="list-disc ml-5 mt-1">
                    {assessmentContent.suggestedNextSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            {assessmentContent.areasRequiringImmediateAttention &&
              assessmentContent.areasRequiringImmediateAttention.length > 0 && (
                <div>
                  <span className="font-medium">Areas Requiring Immediate Attention:</span>
                  <ul className="list-disc ml-5 mt-1 text-red-600">
                    {assessmentContent.areasRequiringImmediateAttention.map((area, i) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}

      {diagnosticContent && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Diagnostic Impression</h3>
          <div className="space-y-2">
            {diagnosticContent.primaryDiagnosis && (
              <div>
                <span className="font-medium">Primary Diagnosis:</span>
                <div className="mt-1">
                  <p className="font-medium">{diagnosticContent.primaryDiagnosis.name}</p>
                  <p className="text-sm text-gray-600">
                    Code: {diagnosticContent.primaryDiagnosis.code}
                  </p>
                  {diagnosticContent.primaryDiagnosis.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {diagnosticContent.primaryDiagnosis.description}
                    </p>
                  )}
                </div>
              </div>
            )}
            {diagnosticContent.differentialDiagnoses &&
              diagnosticContent.differentialDiagnoses.length > 0 && (
                <div>
                  <span className="font-medium">Differential Diagnoses:</span>
                  <ul className="list-disc ml-5 mt-1">
                    {diagnosticContent.differentialDiagnoses.map((diagnosis, i) => (
                      <li key={i}>{diagnosis}</li>
                    ))}
                  </ul>
                </div>
              )}
            {diagnosticContent.severityIndicators &&
              diagnosticContent.severityIndicators.length > 0 && (
                <div>
                  <span className="font-medium">Severity Indicators:</span>
                  <ul className="list-disc ml-5 mt-1">
                    {diagnosticContent.severityIndicators.map((indicator, i) => (
                      <li key={i}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
            {diagnosticContent.clinicalJustification && (
              <div>
                <span className="font-medium">Clinical Justification:</span>
                <p className="mt-1 text-gray-700">{diagnosticContent.clinicalJustification}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {treatmentContent && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Treatment Plan Suggestions</h3>
          <div className="space-y-2">
            {treatmentContent.goals && treatmentContent.goals.length > 0 && (
              <div>
                <span className="font-medium">Goals:</span>
                <ul className="list-disc ml-5 mt-1">
                  {treatmentContent.goals.map((goal, i) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
            {treatmentContent.interventions && treatmentContent.interventions.length > 0 && (
              <div>
                <span className="font-medium">Interventions:</span>
                <ul className="list-disc ml-5 mt-1">
                  {treatmentContent.interventions.map((intervention, i) => (
                    <li key={i}>{intervention}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {documentationContent && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Session Documentation</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {typeof documentationContent === "string"
              ? documentationContent
              : JSON.stringify(documentationContent, null, 2)}
          </pre>
        </div>
      )}

      {progressContent && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Progress Notes</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {typeof progressContent === "string"
              ? progressContent
              : JSON.stringify(progressContent, null, 2)}
          </pre>
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
