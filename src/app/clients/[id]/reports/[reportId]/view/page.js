"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";

export default function ReportViewPage() {
  const params = useParams();
  const [report, setReport] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch report
        const reportResponse = await fetch(`/api/clients/${params.id}/reports/${params.reportId}`);
        if (!reportResponse.ok) {
          throw new Error("Failed to fetch report");
        }
        const reportData = await reportResponse.json();
        console.log("Report data:", reportData); // Debug log
        setReport(reportData.report);

        // Fetch client information
        const clientResponse = await fetch(`/api/clients/${params.id}`);
        if (!clientResponse.ok) {
          throw new Error("Failed to fetch client information");
        }
        const clientData = await clientResponse.json();
        console.log("Client data:", clientData); // Debug log
        setClient(clientData.client);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.reportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Report not found</div>
      </div>
    );
  }

  const renderAssessmentReport = () => {
    const { content } = report;
    const latestAnalysis = content?.aiAnalysis?.[0]?.content;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Assessment Summary</h2>
          <p className="text-gray-700">{latestAnalysis?.summary || "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Risk Level</p>
              <p className="font-medium">{latestAnalysis?.riskLevel || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Suicide Risk</p>
              <p className="font-medium">{client?.riskFactors?.suicideRisk?.level || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Violence Risk</p>
              <p className="font-medium">{client?.riskFactors?.violence?.risk || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Primary Concerns</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.primaryConcerns?.map((concern, index) => (
              <li key={index} className="text-gray-700">
                {concern}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Initial Clinical Observations</h2>
          <p className="text-gray-700">{latestAnalysis?.initialClinicalObservations || "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Areas Requiring Immediate Attention</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.areasRequiringImmediateAttention?.map((area, index) => (
              <li key={index} className="text-gray-700">
                {area}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recommended Assessment Tools</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.recommendedAssessmentTools?.map((tool, index) => (
              <li key={index} className="text-gray-700">
                {tool}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Suggested Next Steps</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.suggestedNextSteps?.map((step, index) => (
              <li key={index} className="text-gray-700">
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderDiagnosticReport = () => {
    const { content } = report;
    const latestAnalysis = content?.aiAnalysis?.[0]?.content;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Summary</h2>
          <p className="text-gray-700">{latestAnalysis?.summary || "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Primary Diagnosis</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                {latestAnalysis?.primaryDiagnosis?.name || "N/A"}
              </h3>
              <p className="text-sm text-gray-500">
                Code: {latestAnalysis?.primaryDiagnosis?.code || "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                Confidence: {latestAnalysis?.primaryDiagnosis?.confidence || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Diagnostic Criteria</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.primaryDiagnosis?.criteria?.map((criterion, index) => (
                  <li key={index} className="text-gray-700">
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Rationale</h3>
              <p className="text-gray-700">
                {latestAnalysis?.primaryDiagnosis?.rationale || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Differential Diagnoses</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.differentialDiagnoses?.map((diagnosis, index) => (
              <li key={index} className="text-gray-700">
                {diagnosis}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Rule Out Conditions</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.ruleOutConditions?.map((condition, index) => (
              <li key={index} className="text-gray-700">
                {condition}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Severity Indicators</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.severityIndicators?.map((indicator, index) => (
              <li key={index} className="text-gray-700">
                {indicator}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Risk Factors</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.riskFactors?.map((factor, index) => (
              <li key={index} className="text-gray-700">
                {factor}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cultural Considerations</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.culturalConsiderations?.map((consideration, index) => (
              <li key={index} className="text-gray-700">
                {consideration}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recommended Assessments</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.recommendedAssessments?.map((assessment, index) => (
              <li key={index} className="text-gray-700">
                {assessment}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Clinical Justification</h2>
          <p className="text-gray-700">{latestAnalysis?.clinicalJustification || "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Treatment Implications</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.treatmentImplications?.map((implication, index) => (
              <li key={index} className="text-gray-700">
                {implication}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderTreatmentReport = () => {
    const { content } = report;
    const latestAnalysis = content?.aiAnalysis?.[0]?.content;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Treatment Summary</h2>
          <p className="text-gray-700">{latestAnalysis?.summary || "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Treatment Goals</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Short-term Goals</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.goals?.shortTerm?.map((goal, index) => (
                  <li key={index} className="text-gray-700">
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Long-term Goals</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.goals?.longTerm?.map((goal, index) => (
                  <li key={index} className="text-gray-700">
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Interventions</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.interventions?.map((intervention, index) => (
              <li key={index} className="text-gray-700">
                {intervention}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Treatment Timeline</h2>
          <div className="space-y-4">
            {latestAnalysis?.timeline?.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h3 className="font-medium">{item.milestone}</h3>
                <p className="text-gray-700">Timeframe: {item.timeframe}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Measurable Outcomes</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.measurableOutcomes?.map((outcome, index) => (
              <li key={index} className="text-gray-700">
                {outcome}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Progress Indicators</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.progressIndicators?.map((indicator, index) => (
              <li key={index} className="text-gray-700">
                {indicator}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recommended Approaches</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.recommendedApproaches?.map((approach, index) => (
              <li key={index} className="text-gray-700">
                {approach}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Potential Barriers</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.potentialBarriers?.map((barrier, index) => (
              <li key={index} className="text-gray-700">
                {barrier}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Success Metrics</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.successMetrics?.map((metric, index) => (
              <li key={index} className="text-gray-700">
                {metric}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderProgressReport = () => {
    const { content } = report;
    const latestAnalysis = content?.aiAnalysis?.[0]?.content;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Progress Summary</h2>
          <p className="text-gray-700">{latestAnalysis?.summary || "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Overall Progress</p>
              <p className="font-medium">{latestAnalysis?.metrics?.overallProgress || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Symptom Severity</p>
              <p className="font-medium">{latestAnalysis?.metrics?.symptomSeverity || 0}/10</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Treatment Adherence</p>
              <p className="font-medium">{latestAnalysis?.metrics?.treatmentAdherence || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Risk Level</p>
              <p className="font-medium">{latestAnalysis?.metrics?.riskLevel || 0}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Goal Achievement Status</h2>
          <div className="space-y-4">
            {latestAnalysis?.goalAchievementStatus?.map((goal, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h3 className="font-medium">{goal.goal}</h3>
                <p className="text-gray-700">Status: {goal.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Key Observations</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.keyObservations?.map((observation, index) => (
              <li key={index} className="text-gray-700">
                {observation}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Treatment Effectiveness</h2>
          <p className="text-gray-700">{latestAnalysis?.treatmentEffectiveness || "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Areas of Focus</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Areas of Improvement</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.areasOfImprovement?.map((area, index) => (
                  <li key={index} className="text-gray-700">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Areas Needing Focus</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.areasNeedingFocus?.map((area, index) => (
                  <li key={index} className="text-gray-700">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Barriers and Recommendations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Identified Barriers</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.identifiedBarriers?.map((barrier, index) => (
                  <li key={index} className="text-gray-700">
                    {barrier}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Recommendations</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.recommendations?.map((recommendation, index) => (
                  <li key={index} className="text-gray-700">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.nextSteps?.map((step, index) => (
              <li key={index} className="text-gray-700">
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Treatment Plan Adjustments</h2>
          <ul className="list-disc pl-5 space-y-1">
            {latestAnalysis?.treatmentPlanAdjustments?.map((adjustment, index) => (
              <li key={index} className="text-gray-700">
                {adjustment}
              </li>
            ))}
          </ul>
        </div>

        {latestAnalysis?.recommendReassessment && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Reassessment Recommendation</h2>
            <p className="text-gray-700">{latestAnalysis?.reassessmentRationale || "N/A"}</p>
          </div>
        )}
      </div>
    );
  };

  const renderDocumentationReport = () => {
    const { content } = report;
    const latestAnalysis = content?.aiAnalysis?.[0]?.content;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
          <p className="text-gray-700">{latestAnalysis?.summary || "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">SOAP Notes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Subjective</h3>
              <p className="text-gray-700">{latestAnalysis?.soap?.subjective || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Objective</h3>
              <p className="text-gray-700">{latestAnalysis?.soap?.objective || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Assessment</h3>
              <p className="text-gray-700">{latestAnalysis?.soap?.assessment || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Plan</h3>
              <p className="text-gray-700">{latestAnalysis?.soap?.plan || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Clinical Documentation</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Initial Observations</h3>
              <p className="text-gray-700">
                {latestAnalysis?.clinicalDocumentation?.initialObservations || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Risk Assessment</h3>
              <p className="text-gray-700">
                {latestAnalysis?.clinicalDocumentation?.riskAssessmentSummary || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Diagnostic Considerations</h3>
              <p className="text-gray-700">
                {latestAnalysis?.clinicalDocumentation?.diagnosticConsiderations || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Treatment Goals and Interventions</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.clinicalDocumentation?.treatmentGoalsAndInterventions?.map(
                  (item, index) => (
                    <li key={index} className="text-gray-700">
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Progress Indicators</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.clinicalDocumentation?.progressIndicators?.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Treatment Effectiveness</h3>
              <p className="text-gray-700">
                {latestAnalysis?.clinicalDocumentation?.treatmentEffectivenessAnalysis || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Follow-up Recommendations</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.clinicalDocumentation?.followUpRecommendations?.map(
                  (item, index) => (
                    <li key={index} className="text-gray-700">
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Progress Summary</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Treatment Goals Progress</h3>
              <div className="space-y-4">
                {latestAnalysis?.progressSummary?.treatmentGoalsProgress?.map((goal, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h4 className="font-medium">{goal.goal}</h4>
                    <p className="text-gray-700">Status: {goal.progress}</p>
                    {goal.metrics && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Metrics:</p>
                        <p className="text-gray-700">
                          Current: {goal.metrics.currentScore} / Target: {goal.metrics.targetScore}{" "}
                          ({goal.metrics.progressPercentage})
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Areas of Improvement</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.progressSummary?.areasOfImprovement?.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Challenges and Barriers</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.progressSummary?.challengesAndBarriers?.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Treatment Plan Adjustments</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.progressSummary?.treatmentPlanAdjustments?.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Additional Components</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Specific Interventions</h3>
              <ul className="list-disc pl-5 space-y-1">
                {latestAnalysis?.additionalComponents?.specificInterventions?.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Next Session Focus</h3>
              <p className="text-gray-700">
                {latestAnalysis?.additionalComponents?.nextSessionFocus || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    switch (report.type) {
      case "assessment":
        return renderAssessmentReport();
      case "diagnostic":
        return renderDiagnosticReport();
      case "treatment":
        return renderTreatmentReport();
      case "progress":
        return renderProgressReport();
      case "documentation":
        return renderDocumentationReport();
      default:
        return <div className="text-gray-500">Report type not supported</div>;
    }
  };

  const DebugView = () => {
    if (!report) return null;

    return (
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Report Type</h3>
            <pre className="bg-white p-4 rounded overflow-auto">
              {JSON.stringify(report.type, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Report Content</h3>
            <pre className="bg-white p-4 rounded overflow-auto">
              {JSON.stringify(report.content, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Client Information</h3>
            <pre className="bg-white p-4 rounded overflow-auto">
              {JSON.stringify(client, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
            </h1>
            <p className="text-gray-600 mt-1">
              Generated by {report?.content?.metadata?.generatedBy || "Unknown Counselor"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                  clipRule="evenodd"
                />
              </svg>
              Print Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Client</p>
            <p className="text-lg font-semibold text-gray-900">
              {client?.name || "Unknown Client"}
            </p>
            <p className="text-sm text-gray-600">
              {client?.age || "N/A"} years old • {client?.gender || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Report Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {format(new Date(report.metadata?.generatedAt || report.createdAt), "PPP")}
            </p>
            <p className="text-sm text-gray-600">
              {format(new Date(report.metadata?.generatedAt || report.createdAt), "p")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Time Period</p>
            <p className="text-lg font-semibold text-gray-900">
              {format(
                new Date(report.metadata?.timeRange?.start || report.startDate),
                "MMM d, yyyy"
              )}{" "}
              - {format(new Date(report.metadata?.timeRange?.end || report.endDate), "MMM d, yyyy")}
            </p>
            <p className="text-sm text-gray-600">
              {Math.round(
                (new Date(report.metadata?.timeRange?.end || report.endDate) -
                  new Date(report.metadata?.timeRange?.start || report.startDate)) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{report.status}</p>
            <p className="text-sm text-gray-600">
              Total Reports: {report.metadata?.totalReports || 1}
            </p>
          </div>
        </div>

        <div className="prose max-w-none">{renderReportContent()}</div>

        {showDebug && <DebugView />}
      </div>
    </div>
  );
}
