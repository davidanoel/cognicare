import { useState, useEffect } from "react";

export default function ClientInsights({ clientId }) {
  const [assessmentReport, setAssessmentReport] = useState(null);
  const [diagnosticReport, setDiagnosticReport] = useState(null);
  const [treatmentReport, setTreatmentReport] = useState(null);
  const [progressReport, setProgressReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      setAssessmentReport(null);
      setDiagnosticReport(null);
      setTreatmentReport(null);
      setProgressReport(null);

      try {
        const response = await fetch(`/api/clients/${clientId}/ai-reports`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("no_reports");
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch insights");
          }
          return;
        }

        const data = await response.json();
        console.log("AI reports response:", data);

        const reports = data.reports || [];

        // Find the most recent report of each type
        const assessment = reports
          .filter((r) => r.type === "assessment")
          .sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp))[0];
        const diagnostic = reports
          .filter((r) => r.type === "diagnostic")
          .sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp))[0];
        const treatment = reports
          .filter((r) => r.type === "treatment")
          .sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp))[0];
        const progress = reports
          .filter((r) => r.type === "progress")
          .sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp))[0];

        setAssessmentReport(assessment);
        setDiagnosticReport(diagnostic);
        setTreatmentReport(treatment);
        setProgressReport(progress);

        if (!assessment && !diagnostic && !treatment && !progress) {
          setError("no_reports");
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

  if (loading) {
    return (
      <div className="p-4 text-gray-600 flex items-center gap-2">
        <span className="animate-spin">⏳</span> Loading insights...
      </div>
    );
  }

  if (
    error === "no_reports" ||
    (!assessmentReport && !diagnosticReport && !treatmentReport && !progressReport)
  ) {
    return (
      <div className="bg-blue-100 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌙</span>
          <div>
            <h3 className="font-medium text-blue-700">No insights yet!</h3>
            <p className="text-blue-700 text-sm mt-1">
              To get started, go to the <strong>AI Assistant</strong> tab and click{" "}
              <strong>Run Initial Assessment</strong>. This will analyze the client information and
              generate AI insights.
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              const currentUrl = window.location.pathname;
              window.location.href = `${currentUrl}?tab=ai-assistant`;
            }}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Go to AI Assistant
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 flex items-center gap-2">
        <span className="text-xl">⚠️</span> Error fetching insights: {error}
      </div>
    );
  }

  const assessmentContent = assessmentReport?.content;
  const diagnosticContent = diagnosticReport?.content;
  const treatmentContent = treatmentReport?.content;
  const progressContent = progressReport?.content;

  const renderAssessmentDetails = (assessment) => {
    if (!assessment) return null;

    return (
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
          <p className="text-gray-700">{assessment.summary}</p>
        </div>

        {/* Risk Level Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  assessment.riskLevel === "low"
                    ? "bg-green-100 text-green-800"
                    : assessment.riskLevel === "moderate"
                    ? "bg-yellow-100 text-yellow-800"
                    : assessment.riskLevel === "high"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)} Risk
              </div>
            </div>

            {assessment.riskFactors && assessment.riskFactors.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Identified Risk Factors</h4>
                <ul className="space-y-2 text-gray-700">
                  {assessment.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Primary Concerns Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Primary Concerns</h4>
          <ul className="space-y-2 text-gray-700">
            {assessment.primaryConcerns?.map((concern, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Assessment Tools Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Recommended Assessment Tools</h4>
          <ul className="space-y-2 text-gray-700">
            {assessment.recommendedAssessmentTools?.map((tool, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{tool}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clinical Observations Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Clinical Observations</h4>
          <p className="text-gray-700 leading-relaxed">{assessment.initialClinicalObservations}</p>
        </div>

        {/* Suggested Next Steps Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Suggested Next Steps</h4>
          <ul className="space-y-2 text-gray-700">
            {assessment.suggestedNextSteps?.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas Requiring Immediate Attention Section */}
        {assessment.areasRequiringImmediateAttention?.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h4 className="text-lg font-medium text-red-900 mb-3">
              Areas Requiring Immediate Attention
            </h4>
            <ul className="space-y-2 text-red-700">
              {assessment.areasRequiringImmediateAttention.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200">
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
          onClick={() => setActiveTab("assessments")}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "assessments"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Assessments
        </button>
        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "diagnostics"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Diagnostics
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="bg-gradient-to-r from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100">
          {/* Current Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-xl">🌡️</span> How They&apos;re Doing
            </h3>
            <div className="space-y-2 text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm">
              {assessmentContent?.primaryConcerns && (
                <p>
                  <span className="font-medium text-blue-600">Main Challenge: </span>
                  {assessmentContent.primaryConcerns.join(", ")}
                </p>
              )}
              {progressContent?.progressSummary && (
                <p>
                  <span className="font-medium text-blue-600">Latest Win: </span>
                  {progressContent.progressSummary}
                </p>
              )}
              {assessmentContent?.riskLevel && (
                <p>
                  <span className="font-medium text-blue-600">Risk Check: </span>
                  <span className={getRiskLevelColor(assessmentContent.riskLevel)}>
                    {assessmentContent.riskLevel}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Diagnosis */}
          {diagnosticContent && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🔍</span> What&apos;s the Diagnosis?
              </h3>
              <div className="space-y-2 text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm">
                {diagnosticContent.primaryDiagnosis && (
                  <p>
                    <span className="font-medium text-blue-600">Main Condition: </span>
                    {diagnosticContent.primaryDiagnosis.name} (
                    {diagnosticContent.primaryDiagnosis.code})
                  </p>
                )}
                {diagnosticContent.differentialDiagnoses?.length > 0 && (
                  <p>
                    <span className="font-medium text-blue-600">Possibilities: </span>
                    {diagnosticContent.differentialDiagnoses.join(", ")}
                  </p>
                )}
                {diagnosticContent.comorbidityAssessment && (
                  <div className="mt-3">
                    <h4 className="font-medium text-blue-600 mb-1">Comorbidity Assessment:</h4>
                    <div className="pl-4 border-l-2 border-blue-100">
                      <p className="mb-2">
                        <span className="font-medium">Status: </span>
                        {diagnosticContent.comorbidityAssessment.present
                          ? "Present"
                          : "Not Present"}
                      </p>
                      {diagnosticContent.comorbidityAssessment.present && (
                        <>
                          <div className="mb-2">
                            <span className="font-medium">Conditions: </span>
                            <ul className="list-disc list-inside mt-1">
                              {diagnosticContent.comorbidityAssessment.conditions.map(
                                (condition, index) => (
                                  <li key={index} className="text-sm">
                                    {condition.name} ({condition.code})
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <p className="mb-2">
                            <span className="font-medium">Overall Impact: </span>
                            {diagnosticContent.comorbidityAssessment.overallImpact}
                          </p>
                          <p>
                            <span className="font-medium">Management Strategy: </span>
                            {diagnosticContent.comorbidityAssessment.managementStrategy}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Treatment Focus */}
          {treatmentContent && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🛠️</span> Game Plan
              </h3>
              <div className="space-y-2 text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm">
                {treatmentContent.goals?.shortTerm?.length > 0 && (
                  <p>
                    <span className="font-medium text-blue-600">Quick Goals: </span>
                    {treatmentContent.goals.shortTerm.join("; ")}
                  </p>
                )}
                {treatmentContent.interventions?.length > 0 && (
                  <p>
                    <span className="font-medium text-blue-600">Key Moves: </span>
                    {treatmentContent.interventions.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress Highlights */}
          {progressContent && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">📈</span> Progress Vibes
              </h3>
              <div className="space-y-2 text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm">
                {progressContent.goalAchievementStatus?.length > 0 && (
                  <div>
                    {progressContent.goalAchievementStatus.map((goal, i) => (
                      <div key={i} className="mb-2 last:mb-0">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-blue-600">{goal.goal}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              goal.status === "Achieved"
                                ? "bg-green-100 text-green-800"
                                : goal.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : goal.status === "Partially Achieved"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {goal.status}
                          </span>
                          {goal.notes && (
                            <p className="text-xs text-gray-500 italic">{goal.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {progressContent.treatmentEffectiveness && (
                  <p>
                    <span className="font-medium text-blue-600">How It&apos;s Working: </span>
                    {progressContent.treatmentEffectiveness}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Immediate Priorities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-xl">🚀</span> Next Up
            </h3>
            <ul className="list-none ml-0 text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm space-y-2">
              {assessmentContent?.suggestedNextSteps?.length > 0 ? (
                assessmentContent.suggestedNextSteps.map((step, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-blue-500">➡️</span> {step}
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">➡️</span> All good for now!
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "assessments" && assessmentContent && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Assessment Report</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(assessmentReport?.metadata?.timestamp)}
              </p>
            </div>
          </div>

          <div className="space-y-8">{renderAssessmentDetails(assessmentContent)}</div>
        </div>
      )}

      {activeTab === "diagnostics" && diagnosticContent && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Diagnostic Report</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(diagnosticReport?.metadata?.timestamp)}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Summary Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnostic Summary</h3>
              <p className="text-gray-700">{diagnosticContent.diagnosticSummary}</p>
            </div>

            {/* Primary Diagnosis Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Diagnosis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">
                      {diagnosticContent.primaryDiagnosis.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Code: {diagnosticContent.primaryDiagnosis.code}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      diagnosticContent.primaryDiagnosis.confidence === "high"
                        ? "bg-green-100 text-green-800"
                        : diagnosticContent.primaryDiagnosis.confidence === "moderate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {diagnosticContent.primaryDiagnosis.confidence.charAt(0).toUpperCase() +
                      diagnosticContent.primaryDiagnosis.confidence.slice(1)}{" "}
                    Confidence
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnostic Criteria</h4>
                  <ul className="space-y-2 text-gray-700">
                    {diagnosticContent.primaryDiagnosis.criteria.map((criterion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Clinical Rationale</h4>
                  <p className="text-gray-700">{diagnosticContent.primaryDiagnosis.rationale}</p>
                </div>
              </div>
            </div>

            {/* Risk Factors Section */}
            {diagnosticContent.riskFactors && diagnosticContent.riskFactors.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
                <ul className="space-y-2 text-gray-700">
                  {diagnosticContent.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rule Out Conditions Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rule Out Conditions</h3>
              <ul className="space-y-2 text-gray-700">
                {diagnosticContent.ruleOutConditions.map((condition, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Severity Indicators Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Indicators</h3>
              <ul className="space-y-2 text-gray-700">
                {diagnosticContent.severityIndicators.map((indicator, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatment Implications Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Implications</h3>
              <ul className="space-y-2 text-gray-700">
                {diagnosticContent.treatmentImplications.map((implication, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{implication}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clinical Justification Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Justification</h3>
              <p className="text-gray-700">{diagnosticContent.clinicalJustification}</p>
            </div>
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

function getProgressStatusColor(status) {
  const colors = {
    completed: "text-green-600",
    "in progress": "text-blue-600",
    "not started": "text-gray-600",
    delayed: "text-yellow-600",
    "needs revision": "text-orange-600",
  };
  return colors[status?.toLowerCase()] || "text-gray-600";
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}
