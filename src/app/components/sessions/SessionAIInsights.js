import { useState, useEffect } from "react";

export default function SessionAIInsights({ session }) {
  const [assessmentReport, setAssessmentReport] = useState(null);
  const [diagnosticReport, setDiagnosticReport] = useState(null);
  const [documentationReport, setDocumentationReport] = useState(null);
  const [progressReport, setProgressReport] = useState(null);
  const [treatmentReport, setTreatmentReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("progress");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      setAssessmentReport(null);
      setDiagnosticReport(null);
      setDocumentationReport(null);
      setProgressReport(null);
      setTreatmentReport(null);
      try {
        const response = await fetch(
          `/api/clients/${session.clientId._id}/sessions/${session._id}/reports`
        );
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
        const assessment = reports.find((r) => r.type === "assessment");
        const diagnostic = reports.find((r) => r.type === "diagnostic");
        const treatment = reports.find((r) => r.type === "treatment");
        const documentation = reports.find((r) => r.type === "documentation");
        const progress = reports.find((r) => r.type === "progress");

        // Set the reports in state
        setAssessmentReport(assessment?.content);
        setDiagnosticReport(diagnostic?.content);
        setDocumentationReport(documentation?.content);
        setProgressReport(progress?.content);
        setTreatmentReport(treatment?.content);

        if (!assessment && !diagnostic && !treatment && !documentation && !progress) {
          setError("no_reports");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session?.clientId?._id && session?._id) {
      fetchReport();
    }
  }, [session]);

  if (loading) return <div className="p-4">Loading insights...</div>;

  if (
    error === "no_reports" ||
    (!assessmentReport &&
      !diagnosticReport &&
      !documentationReport &&
      !progressReport &&
      !treatmentReport)
  ) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-600">
          No AI insights available yet. They will appear here after session is completed.
        </p>
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-500">Error fetching insights: {error}</div>;

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("assessment")}
            className={`flex flex-col items-center p-4 border-b-2 font-medium text-sm ${
              activeTab === "assessment"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="text-xl mb-1">📊</span>
            <span>Assessment</span>
          </button>
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`flex flex-col items-center p-4 border-b-2 font-medium text-sm ${
              activeTab === "diagnostic"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="text-xl mb-1">🔍</span>
            <span>Diagnostic</span>
          </button>
          <button
            onClick={() => setActiveTab("treatment")}
            className={`flex flex-col items-center p-4 border-b-2 font-medium text-sm ${
              activeTab === "treatment"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="text-xl mb-1">💡</span>
            <span>Treatment</span>
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex flex-col items-center p-4 border-b-2 font-medium text-sm ${
              activeTab === "progress"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="text-xl mb-1">📈</span>
            <span>Progress</span>
          </button>
          <button
            onClick={() => setActiveTab("documentation")}
            className={`flex flex-col items-center p-4 border-b-2 font-medium text-sm ${
              activeTab === "documentation"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="text-xl mb-1">📝</span>
            <span>Documentation</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {/* Documentation Tab */}
        <div
          className={`${
            activeTab === "documentation" ? "block" : "hidden"
          } bg-white rounded-lg shadow`}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="text-lg font-semibold">Documentation</h3>
                <p className="text-sm text-gray-500">
                  Clinical notes, progress reports, and compliance documentation
                </p>
              </div>
            </div>

            {documentationReport && (
              <div className="space-y-6">
                {/* Summary Section */}
                {documentationReport.summary && (
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Summary</h4>
                    <p className="text-gray-600">{documentationReport.summary}</p>
                  </div>
                )}

                {/* SOAP Notes Section */}
                {documentationReport.soap && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">SOAP Notes</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-700">Subjective</h5>
                        <p className="mt-1 text-gray-600 pl-4">
                          {documentationReport.soap.subjective}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700">Objective</h5>
                        <p className="mt-1 text-gray-600 pl-4">
                          {documentationReport.soap.objective}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700">Assessment</h5>
                        <p className="mt-1 text-gray-600 pl-4">
                          {documentationReport.soap.assessment}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700">Plan</h5>
                        <p className="mt-1 text-gray-600 pl-4">{documentationReport.soap.plan}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinical Documentation Section */}
                {documentationReport.clinicalDocumentation && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">
                      Clinical Documentation
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-700">Initial Observations</h5>
                        <p className="mt-1 text-gray-600 pl-4">
                          {documentationReport.clinicalDocumentation.initialObservations}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700">Risk Assessment</h5>
                        <p className="mt-1 text-gray-600 pl-4">
                          {documentationReport.clinicalDocumentation.riskAssessmentSummary}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700">Diagnostic Considerations</h5>
                        <p className="mt-1 text-gray-600 pl-4">
                          {documentationReport.clinicalDocumentation.diagnosticConsiderations}
                        </p>
                      </div>
                      {documentationReport.clinicalDocumentation.treatmentGoalsAndInterventions
                        ?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">
                            Treatment Goals & Interventions
                          </h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.clinicalDocumentation.treatmentGoalsAndInterventions.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {documentationReport.clinicalDocumentation.progressIndicators?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">Progress Indicators</h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.clinicalDocumentation.progressIndicators.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h5 className="font-medium text-gray-700">Treatment Effectiveness</h5>
                        <p className="mt-1 text-gray-600 pl-4">
                          {documentationReport.clinicalDocumentation.treatmentEffectivenessAnalysis}
                        </p>
                      </div>
                      {documentationReport.clinicalDocumentation.followUpRecommendations?.length >
                        0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">Follow-up Recommendations</h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.clinicalDocumentation.followUpRecommendations.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Components Section */}
                {documentationReport.additionalComponents && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">
                      Additional Information
                    </h4>
                    <div className="space-y-4">
                      {documentationReport.additionalComponents.areasRequiringImmediateAttention
                        ?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-red-600">
                            Areas Requiring Immediate Attention
                          </h5>
                          <ul className="list-disc ml-8 mt-1 text-red-600">
                            {documentationReport.additionalComponents.areasRequiringImmediateAttention.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {documentationReport.additionalComponents.recommendedAssessmentTools?.length >
                        0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">
                            Recommended Assessment Tools
                          </h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.additionalComponents.recommendedAssessmentTools.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {documentationReport.additionalComponents.specificInterventions?.length >
                        0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">Specific Interventions</h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.additionalComponents.specificInterventions.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {documentationReport.additionalComponents.progressMetrics?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">Progress Metrics</h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.additionalComponents.progressMetrics.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {documentationReport.additionalComponents.nextSessionFocus && (
                        <div>
                          <h5 className="font-medium text-gray-700">Next Session Focus</h5>
                          <p className="mt-1 text-gray-600 pl-4">
                            {documentationReport.additionalComponents.nextSessionFocus}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Summary Section */}
                {documentationReport.progressSummary && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Progress Summary</h4>
                    <div className="space-y-4">
                      {documentationReport.progressSummary.treatmentGoalsProgress?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">Treatment Goals Progress</h5>
                          <div className="space-y-2 mt-1">
                            {documentationReport.progressSummary.treatmentGoalsProgress.map(
                              (item, i) => (
                                <div key={i} className="pl-4">
                                  <p className="font-medium text-gray-600">{item.goal}</p>
                                  <p className="text-gray-600 pl-4">{item.progress}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      {documentationReport.progressSummary.outcomesMeasurement?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">Outcomes Measurement</h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.progressSummary.outcomesMeasurement.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {documentationReport.progressSummary.areasOfImprovement?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">Areas of Improvement</h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.progressSummary.areasOfImprovement.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {documentationReport.progressSummary.challengesAndBarriers?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">Challenges and Barriers</h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.progressSummary.challengesAndBarriers.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {documentationReport.progressSummary.treatmentPlanAdjustments?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">Treatment Plan Adjustments</h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.progressSummary.treatmentPlanAdjustments.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {documentationReport.progressSummary.longTermProgressIndicators?.length >
                        0 && (
                        <div>
                          <h5 className="font-medium text-gray-700">
                            Long-term Progress Indicators
                          </h5>
                          <ul className="list-disc ml-8 mt-1 text-gray-600">
                            {documentationReport.progressSummary.longTermProgressIndicators.map(
                              (item, i) => (
                                <li key={i}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Assessment Tab */}
        <div
          className={`${
            activeTab === "assessment" ? "block" : "hidden"
          } bg-white rounded-lg shadow`}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-lg font-semibold">Assessment</h3>
                <p className="text-sm text-gray-500">
                  Initial data gathering and organization, basic risk screening, and client history
                  analysis
                </p>
              </div>
            </div>

            {assessmentReport && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Initial Assessment Summary</h3>
                  <div className="space-y-4">
                    {assessmentReport.riskLevel && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Risk Level:</span>
                        <span className={getRiskLevelColor(assessmentReport.riskLevel)}>
                          {assessmentReport.riskLevel}
                        </span>
                      </div>
                    )}
                    {assessmentReport.primaryConcerns &&
                      assessmentReport.primaryConcerns.length > 0 && (
                        <div>
                          <span className="font-medium">Primary Concerns:</span>
                          <ul className="list-disc ml-5 mt-1">
                            {assessmentReport.primaryConcerns.map((concern, i) => (
                              <li key={i}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {assessmentReport.recommendedAssessmentTools &&
                      assessmentReport.recommendedAssessmentTools.length > 0 && (
                        <div>
                          <span className="font-medium">Recommended Assessment Tools:</span>
                          <ul className="list-disc ml-5 mt-1">
                            {assessmentReport.recommendedAssessmentTools.map((tool, i) => (
                              <li key={i}>{tool}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {assessmentReport.initialClinicalObservations && (
                      <div>
                        <span className="font-medium">Clinical Observations:</span>
                        <p className="mt-1 text-gray-700">
                          {assessmentReport.initialClinicalObservations}
                        </p>
                      </div>
                    )}
                    {assessmentReport.suggestedNextSteps &&
                      assessmentReport.suggestedNextSteps.length > 0 && (
                        <div>
                          <span className="font-medium">Suggested Next Steps:</span>
                          <ul className="list-disc ml-5 mt-1">
                            {assessmentReport.suggestedNextSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {assessmentReport.areasRequiringImmediateAttention &&
                      assessmentReport.areasRequiringImmediateAttention.length > 0 && (
                        <div>
                          <span className="font-medium">Areas Requiring Immediate Attention:</span>
                          <ul className="list-disc ml-5 mt-1 text-red-600">
                            {assessmentReport.areasRequiringImmediateAttention.map((area, i) => (
                              <li key={i}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostic Tab */}
        <div
          className={`${
            activeTab === "diagnostic" ? "block" : "hidden"
          } bg-white rounded-lg shadow`}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔍</span>
              <div>
                <h3 className="text-lg font-semibold">Diagnostic</h3>
                <p className="text-sm text-gray-500">
                  DSM-5 expertise and analysis, clinical concern identification, and risk factor
                  assessment
                </p>
              </div>
            </div>

            {diagnosticReport && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Diagnostic Impression</h3>
                  <div className="space-y-2">
                    {diagnosticReport.primaryDiagnosis && (
                      <div>
                        <span className="font-medium">Primary Diagnosis:</span>
                        <div className="mt-1">
                          <p className="font-medium">{diagnosticReport.primaryDiagnosis.name}</p>
                          <p className="text-sm text-gray-600">
                            Code: {diagnosticReport.primaryDiagnosis.code}
                          </p>
                          {diagnosticReport.primaryDiagnosis.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {diagnosticReport.primaryDiagnosis.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {diagnosticReport.differentialDiagnoses &&
                      diagnosticReport.differentialDiagnoses.length > 0 && (
                        <div>
                          <span className="font-medium">Differential Diagnoses:</span>
                          <ul className="list-disc ml-5 mt-1">
                            {diagnosticReport.differentialDiagnoses.map((diagnosis, i) => (
                              <li key={i}>{diagnosis}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {diagnosticReport.severityIndicators &&
                      diagnosticReport.severityIndicators.length > 0 && (
                        <div>
                          <span className="font-medium">Severity Indicators:</span>
                          <ul className="list-disc ml-5 mt-1">
                            {diagnosticReport.severityIndicators.map((indicator, i) => (
                              <li key={i}>{indicator}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {diagnosticReport.clinicalJustification && (
                      <div>
                        <span className="font-medium">Clinical Justification:</span>
                        <p className="mt-1 text-gray-700">
                          {diagnosticReport.clinicalJustification}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Treatment Tab */}
        <div
          className={`${activeTab === "treatment" ? "block" : "hidden"} bg-white rounded-lg shadow`}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="text-lg font-semibold">Treatment</h3>
                <p className="text-sm text-gray-500">
                  Treatment plan development, intervention recommendations, and goal setting
                </p>
              </div>
            </div>

            {treatmentReport && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Treatment Plan</h3>
                  <div className="space-y-4">
                    {/* <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Current Focus</h4>
                      <p className="text-gray-600">
                        {treatmentReport.currentFocus || "Not defined"}
                      </p>
                    </div> */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Treatment Goals</h4>
                      {Array.isArray(treatmentReport.goals) ? (
                        <ul className="list-disc ml-4 text-gray-600">
                          {treatmentReport.goals.map((goal, i) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No goals defined</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Interventions</h4>
                      {Array.isArray(treatmentReport.interventions) ? (
                        <ul className="list-disc ml-4 text-gray-600">
                          {treatmentReport.interventions.map((intervention, i) => (
                            <li key={i}>{intervention}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No interventions defined</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Recommended Approaches
                      </h4>
                      {Array.isArray(treatmentReport.recommendedApproaches) ? (
                        <ul className="list-disc ml-4 text-gray-600">
                          {treatmentReport.recommendedApproaches.map((approach, i) => (
                            <li key={i}>{approach}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No approaches defined</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Success Metrics</h4>
                      {Array.isArray(treatmentReport.successMetrics) ? (
                        <ul className="list-disc ml-4 text-gray-600">
                          {treatmentReport.successMetrics.map((metric, i) => (
                            <li key={i}>{metric}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No metrics defined</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Potential Barriers
                      </h4>
                      {Array.isArray(treatmentReport.potentialBarriers) ? (
                        <ul className="list-disc ml-4 text-gray-600">
                          {treatmentReport.potentialBarriers.map((barrier, i) => (
                            <li key={i}>{barrier}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No barriers identified</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Next Steps</h4>
                      {Array.isArray(treatmentReport.nextSteps) ? (
                        <ul className="list-disc ml-4 text-gray-600">
                          {treatmentReport.nextSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No next steps defined</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Tab */}
        <div
          className={`${activeTab === "progress" ? "block" : "hidden"} bg-white rounded-lg shadow`}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📈</span>
              <div>
                <h3 className="text-lg font-semibold">Progress</h3>
                <p className="text-sm text-gray-500">
                  Treatment effectiveness monitoring, goal completion tracking, and pattern
                  recognition
                </p>
              </div>
            </div>

            {progressReport && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Progress Notes</h3>

                  {/* Summary */}
                  {progressReport.summary && (
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Summary</h4>
                      <p className="text-gray-600">{progressReport.summary}</p>
                    </div>
                  )}

                  {/* Progress Summary */}
                  {progressReport.progressSummary && (
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Progress Summary</h4>
                      <p className="text-gray-600">{progressReport.progressSummary}</p>
                    </div>
                  )}

                  {/* Goal Achievement Status */}
                  {progressReport.goalAchievementStatus?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Goal Achievement Status
                      </h4>
                      <div className="space-y-4">
                        {progressReport.goalAchievementStatus.map((goal, i) => (
                          <div key={i} className="border-l-4 border-blue-200 pl-4">
                            <h5 className="font-medium text-gray-700">{goal.goal}</h5>
                            <div className="mt-2 space-y-2">
                              <p className="text-gray-600">
                                <span className="font-medium">Status: </span>
                                <span className={getProgressStatusColor(goal.status)}>
                                  {goal.status}
                                </span>
                              </p>
                              {goal.notes && (
                                <p className="text-gray-600">
                                  <span className="font-medium">Notes: </span>
                                  {goal.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Observations */}
                  {progressReport.keyObservations?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Key Observations</h4>
                      <ul className="list-disc ml-8 space-y-2 text-gray-600">
                        {progressReport.keyObservations.map((observation, i) => (
                          <li key={i}>{observation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Treatment Effectiveness */}
                  {progressReport.treatmentEffectiveness && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Treatment Effectiveness
                      </h4>
                      <p className="text-gray-600">{progressReport.treatmentEffectiveness}</p>
                    </div>
                  )}

                  {/* Identified Barriers */}
                  {progressReport.identifiedBarriers?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Identified Barriers
                      </h4>
                      <ul className="list-disc ml-8 space-y-2 text-gray-600">
                        {progressReport.identifiedBarriers.map((barrier, i) => (
                          <li key={i}>{barrier}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas of Improvement */}
                  {progressReport.areasOfImprovement?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Areas of Improvement
                      </h4>
                      <ul className="list-disc ml-8 space-y-2 text-gray-600">
                        {progressReport.areasOfImprovement.map((area, i) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas Needing Focus */}
                  {progressReport.areasNeedingFocus?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Areas Needing Focus
                      </h4>
                      <ul className="list-disc ml-8 space-y-2 text-gray-600">
                        {progressReport.areasNeedingFocus.map((area, i) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {progressReport.recommendations?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Recommendations</h4>
                      <ul className="list-disc ml-8 space-y-2 text-gray-600">
                        {progressReport.recommendations.map((recommendation, i) => (
                          <li key={i}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps */}
                  {progressReport.nextSteps?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Next Steps</h4>
                      <ul className="list-disc ml-8 space-y-2 text-gray-600">
                        {progressReport.nextSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Treatment Plan Adjustments */}
                  {progressReport.adjustmentsToTreatmentPlan?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Treatment Plan Adjustments
                      </h4>
                      <ul className="list-disc ml-8 space-y-2 text-gray-600">
                        {progressReport.adjustmentsToTreatmentPlan.map((adjustment, i) => (
                          <li key={i}>{adjustment}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Reassessment Recommendation */}
                  {progressReport.recommendReassessment !== undefined && (
                    <div
                      className={`p-4 mb-6 rounded-lg ${
                        progressReport.recommendReassessment
                          ? "bg-yellow-50 border border-yellow-200"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <h4 className="text-md font-semibold mb-2">
                        {progressReport.recommendReassessment
                          ? "🔔 Reassessment Recommended"
                          : "✅ No Reassessment Needed"}
                      </h4>
                      {progressReport.reassessmentRationale && (
                        <p className="text-gray-700">{progressReport.reassessmentRationale}</p>
                      )}
                    </div>
                  )}

                  {/* Metrics */}
                  {progressReport.metrics && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Progress Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Convert metrics object to array if needed */}
                        {Array.isArray(progressReport.metrics)
                          ? progressReport.metrics.map((metric, i) => (
                              <div key={i} className="flex items-center">
                                <span className="font-medium mr-2">{metric.name}:</span>
                                <span className={getChangeColor(metric.change)}>
                                  {metric.value}
                                </span>
                              </div>
                            ))
                          : /* Handle metrics as an object */
                            Object.entries(progressReport.metrics).map(([key, value]) => (
                              <div key={key} className="flex items-center">
                                <span className="font-medium mr-2">
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                  :
                                </span>
                                <span>{value}</span>
                              </div>
                            ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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

function getChangeColor(change) {
  if (change.includes("Improved") || change.includes("Better")) {
    return "text-green-600";
  } else if (change.includes("Worse") || change.includes("Declined")) {
    return "text-red-600";
  } else if (change.includes("No change") || change.includes("Stable")) {
    return "text-blue-600";
  }
  return "text-gray-600";
}
