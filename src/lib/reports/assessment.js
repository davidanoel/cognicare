import { connectDB } from "@/lib/mongodb";
import Client from "@/models/client";
import AIReport from "@/models/aiReport";

export async function generateAssessmentReport(clientId, startDate, endDate, user) {
  await connectDB();

  // Get client information
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }

  // Get AI reports for assessment analysis
  const aiReports = await AIReport.find({
    clientId,
    type: "assessment",
    "metadata.timestamp": {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).sort({ "metadata.timestamp": -1 });

  // Structure the report
  const report = {
    metadata: {
      type: "assessment",
      generatedAt: new Date(),
      generatedBy: user.name,
      clientId,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    },
    clientInfo: {
      name: client.name,
      age: client.age,
      riskLevel: client.riskLevel,
    },
    aiAnalysis: aiReports.map((aiReport) => ({
      date: aiReport.metadata.timestamp,
      diagnosticConsiderations: aiReport.content.diagnosticConsiderations,
      riskAnalysis: aiReport.content.riskAnalysis,
      treatmentEffectiveness: aiReport.content.treatmentEffectiveness,
      futurePredictions: aiReport.content.futurePredictions,
      therapeuticInsights: aiReport.content.therapeuticInsights,
    })),
    summary: {
      totalAssessments: aiReports.length,
      keyFindings: extractKeyFindings(aiReports),
      riskAssessment: calculateRiskAssessment(aiReports),
      diagnosticSummary: extractDiagnosticSummary(aiReports),
      treatmentProgress: calculateTreatmentProgress(aiReports),
    },
  };

  return report;
}

function calculateRiskAssessment(aiReports) {
  if (aiReports.length === 0) return null;

  const latestReport = aiReports[0];
  return {
    currentLevel: latestReport.content.riskAnalysis?.currentRisks?.[0]?.level || "none",
    protectiveFactors: latestReport.content.riskAnalysis?.protectiveFactors || [],
    recommendedActions: latestReport.content.riskAnalysis?.recommendedActions || [],
    monitoringPoints: latestReport.content.riskAnalysis?.monitoring_points || [],
  };
}

function extractDiagnosticSummary(aiReports) {
  if (aiReports.length === 0) return null;

  const latestReport = aiReports[0];
  return {
    confirmedDiagnoses: latestReport.content.diagnosticConsiderations?.confirmedDiagnoses || [],
    differentialDiagnoses:
      latestReport.content.diagnosticConsiderations?.differentialDiagnoses || [],
    recommendedAssessments:
      latestReport.content.diagnosticConsiderations?.recommendedAssessments || [],
  };
}

function calculateTreatmentProgress(aiReports) {
  if (aiReports.length === 0) return null;

  const latestReport = aiReports[0];
  return {
    status: latestReport.content.treatmentEffectiveness?.overallProgress?.status || "stable",
    score: latestReport.content.treatmentEffectiveness?.overallProgress?.score || 0,
    trend: latestReport.content.treatmentEffectiveness?.overallProgress?.trend || "stable",
    keyFactors: latestReport.content.treatmentEffectiveness?.overallProgress?.keyFactors || [],
    interventionAnalysis: latestReport.content.treatmentEffectiveness?.interventionAnalysis || [],
  };
}

function extractKeyFindings(aiReports) {
  const findings = {
    improvements: [],
    concerns: [],
    recommendations: [],
    clinicalInsights: [],
    futurePredictions: [],
  };

  aiReports.forEach((report) => {
    // Add therapeutic insights
    const insights = report.content.therapeuticInsights;
    if (insights) {
      if (insights.keyPatterns) {
        findings.clinicalInsights.push(
          ...insights.keyPatterns.map((p) => ({
            pattern: p.pattern,
            evidence: p.evidence,
            significance: p.significance,
          }))
        );
      }
      if (insights.treatment_implications) {
        findings.recommendations.push(...insights.treatment_implications);
      }
    }

    // Add risk analysis findings
    const riskAnalysis = report.content.riskAnalysis;
    if (riskAnalysis) {
      if (riskAnalysis.currentRisks) {
        findings.concerns.push(...riskAnalysis.currentRisks.map((r) => r.factors).flat());
      }
      if (riskAnalysis.recommendedActions) {
        findings.recommendations.push(...riskAnalysis.recommendedActions);
      }
    }

    // Add treatment effectiveness findings
    const treatmentEffectiveness = report.content.treatmentEffectiveness;
    if (treatmentEffectiveness) {
      if (treatmentEffectiveness.overallProgress?.keyFactors) {
        findings.improvements.push(...treatmentEffectiveness.overallProgress.keyFactors);
      }
      if (treatmentEffectiveness.barriers) {
        findings.concerns.push(...treatmentEffectiveness.barriers.map((b) => b.description));
      }
    }

    // Add future predictions
    const predictions = report.content.futurePredictions;
    if (predictions) {
      findings.futurePredictions.push({
        expectedOutcomes: predictions.expectedOutcomes || [],
        potentialChallenges: predictions.potentialChallenges || [],
        recommendedAdjustments: predictions.recommendedAdjustments || [],
      });
    }
  });

  return findings;
}
