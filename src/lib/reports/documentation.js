import { connectDB } from "@/lib/mongodb";
import Session from "@/models/session";
import Client from "@/models/client";
import AIReport from "@/models/aiReport";

export async function generateDocumentationReport(clientId, startDate, endDate, user) {
  await connectDB();

  // Get client information
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }

  // Get sessions within date range
  const sessions = await Session.find({
    clientId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).sort({ date: -1 });

  // Get AI reports for documentation analysis
  const aiReports = await AIReport.find({
    clientId,
    type: "documentation",
    "metadata.timestamp": {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).sort({ "metadata.timestamp": -1 });

  // Structure the report
  const report = {
    metadata: {
      type: "documentation",
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
    sessions: sessions.map((session) => ({
      date: session.date,
      type: session.type,
      duration: session.duration,
      location: session.location,
      attendees: session.attendees,
      summary: session.summary,
      interventions: session.interventions,
      outcomes: session.outcomes,
    })),
    aiAnalysis: aiReports.map((aiReport) => ({
      date: aiReport.metadata.timestamp,
      sentimentAnalysis: aiReport.content.sentimentAnalysis,
      therapeuticInsights: aiReport.content.therapeuticInsights,
      riskAnalysis: aiReport.content.riskAnalysis,
      treatmentEffectiveness: aiReport.content.treatmentEffectiveness,
      clinicalNotes: extractClinicalNotes(aiReport),
    })),
    summary: {
      totalSessions: sessions.length,
      totalNotes: aiReports.length,
      sessionTypes: [...new Set(sessions.map((s) => s.type))],
      keyEvents: extractKeyEvents(sessions, aiReports),
      sentimentTrends: calculateSentimentTrends(aiReports),
      relationshipDynamics: extractRelationshipDynamics(aiReports),
    },
  };

  return report;
}

function extractClinicalNotes(aiReport) {
  return {
    summary: aiReport.content.summary,
    analysis: aiReport.content.analysis,
    clinicalFormulation: aiReport.content.clinicalFormulation,
    recommendations: aiReport.content.recommendations,
  };
}

function calculateSentimentTrends(aiReports) {
  if (aiReports.length === 0) return null;

  const latestReport = aiReports[0];
  return {
    overallScore: latestReport.content.sentimentAnalysis?.overallScore || 0,
    trend: latestReport.content.sentimentAnalysis?.progression?.trend || "stable",
    keyChanges: latestReport.content.sentimentAnalysis?.progression?.keyChanges || [],
    emotionalThemes: latestReport.content.sentimentAnalysis?.emotionalThemes || [],
  };
}

function extractRelationshipDynamics(aiReports) {
  if (aiReports.length === 0) return null;

  const latestReport = aiReports[0];
  const dynamics = latestReport.content.therapeuticInsights?.relationshipDynamics;
  return {
    therapeuticAlliance: dynamics?.therapeutic_alliance || {},
    interpersonalPatterns: dynamics?.interpersonal_patterns || [],
    treatmentImplications: dynamics?.treatment_implications || [],
  };
}

function extractKeyEvents(sessions, aiReports) {
  const events = {
    significantSessions: [],
    importantNotes: [],
    interventions: [],
    criticalEvents: [],
  };

  // Analyze sessions for significant events
  sessions.forEach((session) => {
    if (
      session.summary &&
      (session.summary.toLowerCase().includes("breakthrough") ||
        session.summary.toLowerCase().includes("significant") ||
        session.summary.toLowerCase().includes("critical"))
    ) {
      events.significantSessions.push({
        date: session.date,
        type: session.type,
        summary: session.summary,
      });
    }

    if (session.interventions && session.interventions.length > 0) {
      events.interventions.push(
        ...session.interventions.map((intervention) => ({
          date: session.date,
          intervention,
        }))
      );
    }
  });

  // Extract from AI reports
  aiReports.forEach((report) => {
    // Add clinical notes as important notes
    if (report.content.summary) {
      events.importantNotes.push({
        date: report.metadata.timestamp,
        type: "clinical",
        content: report.content.summary,
      });
    }

    // Add risk-related events
    const riskAnalysis = report.content.riskAnalysis;
    if (riskAnalysis?.currentRisks) {
      riskAnalysis.currentRisks.forEach((risk) => {
        if (risk.level === "high" || risk.level === "severe") {
          events.criticalEvents.push({
            date: report.metadata.timestamp,
            type: "risk",
            description: `High risk identified: ${risk.factors.join(", ")}`,
            recommendedActions: riskAnalysis.recommendedActions || [],
          });
        }
      });
    }

    // Add treatment-related events
    const treatmentEffectiveness = report.content.treatmentEffectiveness;
    if (treatmentEffectiveness?.interventionAnalysis) {
      treatmentEffectiveness.interventionAnalysis.forEach((intervention) => {
        if (intervention.effectiveness < 0.3) {
          // Consider interventions with <30% effectiveness as critical
          events.criticalEvents.push({
            date: report.metadata.timestamp,
            type: "treatment",
            description: `Low effectiveness intervention: ${intervention.intervention}`,
            recommendations: intervention.recommendations || [],
          });
        }
      });
    }
  });

  return events;
}
