import { useState, useEffect } from "react";

export default function ClientInsights({ clientId }) {
  const [assessmentReport, setAssessmentReport] = useState(null);
  const [diagnosticReport, setDiagnosticReport] = useState(null);
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

      {progressContent && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Progress Notes</h3>

          {/* Summary */}
          {progressContent.summary && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Summary</h4>
              <p className="text-gray-600">{progressContent.summary}</p>
            </div>
          )}

          {/* Progress Summary */}
          {progressContent.progressSummary && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Progress Summary</h4>
              <p className="text-gray-600">{progressContent.progressSummary}</p>
            </div>
          )}

          {/* Goal Achievement Status */}
          {progressContent.goalAchievementStatus?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Goal Achievement Status</h4>
              <div className="space-y-4">
                {progressContent.goalAchievementStatus.map((goal, i) => (
                  <div key={i} className="border-l-4 border-blue-200 pl-4">
                    <h5 className="font-medium text-gray-700">{goal.goal}</h5>
                    <div className="mt-2 space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Status: </span>
                        <span className={getProgressStatusColor(goal.status)}>{goal.status}</span>
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
          {progressContent.keyObservations?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Key Observations</h4>
              <ul className="list-disc ml-8 space-y-2 text-gray-600">
                {progressContent.keyObservations.map((observation, i) => (
                  <li key={i}>{observation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatment Effectiveness */}
          {progressContent.treatmentEffectiveness && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Treatment Effectiveness</h4>
              <p className="text-gray-600">{progressContent.treatmentEffectiveness}</p>
            </div>
          )}

          {/* Identified Barriers */}
          {progressContent.identifiedBarriers?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Identified Barriers</h4>
              <ul className="list-disc ml-8 space-y-2 text-gray-600">
                {progressContent.identifiedBarriers.map((barrier, i) => (
                  <li key={i}>{barrier}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas of Improvement */}
          {progressContent.areasOfImprovement?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Areas of Improvement</h4>
              <ul className="list-disc ml-8 space-y-2 text-gray-600">
                {progressContent.areasOfImprovement.map((area, i) => (
                  <li key={i}>{area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas Needing Focus */}
          {progressContent.areasNeedingFocus?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Areas Needing Focus</h4>
              <ul className="list-disc ml-8 space-y-2 text-gray-600">
                {progressContent.areasNeedingFocus.map((area, i) => (
                  <li key={i}>{area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {progressContent.recommendations?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Recommendations</h4>
              <ul className="list-disc ml-8 space-y-2 text-gray-600">
                {progressContent.recommendations.map((recommendation, i) => (
                  <li key={i}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {progressContent.nextSteps?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Next Steps</h4>
              <ul className="list-disc ml-8 space-y-2 text-gray-600">
                {progressContent.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatment Plan Adjustments */}
          {progressContent.treatmentPlanAdjustments?.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-2">
                Treatment Plan Adjustments
              </h4>
              <ul className="list-disc ml-8 space-y-2 text-gray-600">
                {progressContent.treatmentPlanAdjustments.map((adjustment, i) => (
                  <li key={i}>{adjustment}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {documentationContent && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Session Documentation</h3>

          {/* Summary Section */}
          {documentationContent.summary && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Summary</h4>
              <p className="text-gray-600">{documentationContent.summary}</p>
            </div>
          )}

          {/* SOAP Notes Section */}
          {documentationContent.soap && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">SOAP Notes</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700">Subjective</h5>
                  <p className="mt-1 text-gray-600 pl-4">{documentationContent.soap.subjective}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700">Objective</h5>
                  <p className="mt-1 text-gray-600 pl-4">{documentationContent.soap.objective}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700">Assessment</h5>
                  <p className="mt-1 text-gray-600 pl-4">{documentationContent.soap.assessment}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700">Plan</h5>
                  <p className="mt-1 text-gray-600 pl-4">{documentationContent.soap.plan}</p>
                </div>
              </div>
            </div>
          )}

          {/* Clinical Documentation Section */}
          {documentationContent.clinicalDocumentation && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Clinical Documentation</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700">Initial Observations</h5>
                  <p className="mt-1 text-gray-600 pl-4">
                    {documentationContent.clinicalDocumentation.initialObservations}
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700">Risk Assessment</h5>
                  <p className="mt-1 text-gray-600 pl-4">
                    {documentationContent.clinicalDocumentation.riskAssessmentSummary}
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700">Diagnostic Considerations</h5>
                  <p className="mt-1 text-gray-600 pl-4">
                    {documentationContent.clinicalDocumentation.diagnosticConsiderations}
                  </p>
                </div>
                {documentationContent.clinicalDocumentation.treatmentGoalsAndInterventions?.length >
                  0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Treatment Goals & Interventions</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.clinicalDocumentation.treatmentGoalsAndInterventions.map(
                        (item, i) => (
                          <li key={i}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {documentationContent.clinicalDocumentation.progressIndicators?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Progress Indicators</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.clinicalDocumentation.progressIndicators.map(
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
                    {documentationContent.clinicalDocumentation.treatmentEffectivenessAnalysis}
                  </p>
                </div>
                {documentationContent.clinicalDocumentation.followUpRecommendations?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Follow-up Recommendations</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.clinicalDocumentation.followUpRecommendations.map(
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
          {documentationContent.additionalComponents && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Additional Information</h4>
              <div className="space-y-4">
                {documentationContent.additionalComponents.areasRequiringImmediateAttention
                  ?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-red-600">
                      Areas Requiring Immediate Attention
                    </h5>
                    <ul className="list-disc ml-8 mt-1 text-red-600">
                      {documentationContent.additionalComponents.areasRequiringImmediateAttention.map(
                        (item, i) => (
                          <li key={i}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {documentationContent.additionalComponents.recommendedAssessmentTools?.length >
                  0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Recommended Assessment Tools</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.additionalComponents.recommendedAssessmentTools.map(
                        (item, i) => (
                          <li key={i}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {documentationContent.additionalComponents.specificInterventions?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Specific Interventions</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.additionalComponents.specificInterventions.map(
                        (item, i) => (
                          <li key={i}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {documentationContent.additionalComponents.progressMetrics?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Progress Metrics</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.additionalComponents.progressMetrics.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {documentationContent.additionalComponents.nextSessionFocus && (
                  <div>
                    <h5 className="font-medium text-gray-700">Next Session Focus</h5>
                    <p className="mt-1 text-gray-600 pl-4">
                      {documentationContent.additionalComponents.nextSessionFocus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Summary Section */}
          {documentationContent.progressSummary && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-2">Progress Summary</h4>
              <div className="space-y-4">
                {documentationContent.progressSummary.treatmentGoalsProgress?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Treatment Goals Progress</h5>
                    <div className="space-y-2 mt-1">
                      {documentationContent.progressSummary.treatmentGoalsProgress.map(
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
                {documentationContent.progressSummary.outcomesMeasurement?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Outcomes Measurement</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.progressSummary.outcomesMeasurement.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {documentationContent.progressSummary.areasOfImprovement?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Areas of Improvement</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.progressSummary.areasOfImprovement.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {documentationContent.progressSummary.challengesAndBarriers?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Challenges and Barriers</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.progressSummary.challengesAndBarriers.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {documentationContent.progressSummary.treatmentPlanAdjustments?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Treatment Plan Adjustments</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.progressSummary.treatmentPlanAdjustments.map(
                        (item, i) => (
                          <li key={i}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {documentationContent.progressSummary.longTermProgressIndicators?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Long-term Progress Indicators</h5>
                    <ul className="list-disc ml-8 mt-1 text-gray-600">
                      {documentationContent.progressSummary.longTermProgressIndicators.map(
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
