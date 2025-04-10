import { connectDB } from "@/lib/mongodb";
import Session from "@/models/session";
import Client from "@/models/client";
import AIReport from "@/models/aiReport";

export async function generateProgressReport(clientId, startDate, endDate, user) {
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

  // Get AI reports for progress tracking
  const aiReports = await AIReport.find({
    clientId,
    type: "progress",
    "metadata.timestamp": {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).sort({ "metadata.timestamp": -1 });

  // Structure the report
  const report = {
    metadata: {
      type: "progress",
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
      moodRating: session.moodRating,
      notes: session.notes,
      interventions: session.interventions,
    })),
    progressAnalysis: aiReports.map((aiReport) => ({
      date: aiReport.metadata.timestamp,
      treatmentProgress: aiReport.content.treatmentProgress,
      goalProgress: aiReport.content.treatmentProgress?.goalProgress || [],
      interventionEffectiveness:
        aiReport.content.treatmentProgress?.interventionEffectiveness || [],
      nextSteps: aiReport.content.treatmentProgress?.nextSteps || [],
    })),
    summary: {
      totalSessions: sessions.length,
      averageMoodRating: calculateAverageMood(sessions),
      keyUpdates: extractKeyUpdates(sessions, aiReports),
      overallProgress: calculateOverallProgress(aiReports),
    },
  };

  return report;
}

function calculateAverageMood(sessions) {
  if (sessions.length === 0) return null;

  const total = sessions.reduce((sum, session) => sum + (session.moodRating || 0), 0);
  return total / sessions.length;
}

function calculateOverallProgress(aiReports) {
  if (aiReports.length === 0) return null;

  const latestReport = aiReports[0];
  return {
    status: latestReport.content.treatmentProgress?.status || "stable",
    overallEffectiveness: calculateAverageEffectiveness(aiReports),
    keyInterventions: extractKeyInterventions(aiReports),
  };
}

function calculateAverageEffectiveness(aiReports) {
  const interventions = {};
  const counts = {};

  aiReports.forEach((report) => {
    const effectiveness = report.content.treatmentProgress?.interventionEffectiveness || [];
    effectiveness.forEach((item) => {
      if (!interventions[item.intervention]) {
        interventions[item.intervention] = 0;
        counts[item.intervention] = 0;
      }
      interventions[item.intervention] += item.effectiveness;
      counts[item.intervention]++;
    });
  });

  return Object.entries(interventions).map(([intervention, total]) => ({
    intervention,
    averageEffectiveness: total / counts[intervention],
  }));
}

function extractKeyInterventions(aiReports) {
  const interventions = new Set();
  aiReports.forEach((report) => {
    const effectiveness = report.content.treatmentProgress?.interventionEffectiveness || [];
    effectiveness.forEach((item) => {
      if (item.effectiveness >= 0.7) {
        // Consider interventions with 70%+ effectiveness as key
        interventions.add(item.intervention);
      }
    });
  });
  return Array.from(interventions);
}

function extractKeyUpdates(sessions, aiReports) {
  const updates = {
    progress: [],
    challenges: [],
    interventions: [],
  };

  // Extract from sessions
  sessions.forEach((session) => {
    if (session.notes) {
      if (
        session.notes.toLowerCase().includes("progress") ||
        session.notes.toLowerCase().includes("improved")
      ) {
        updates.progress.push(session.notes);
      }
      if (
        session.notes.toLowerCase().includes("challenge") ||
        session.notes.toLowerCase().includes("difficulty")
      ) {
        updates.challenges.push(session.notes);
      }
    }
    if (session.interventions && session.interventions.length > 0) {
      updates.interventions.push(...session.interventions);
    }
  });

  // Extract from AI reports
  aiReports.forEach((report) => {
    const progress = report.content.treatmentProgress;
    if (progress) {
      if (progress.notes) {
        updates.progress.push(progress.notes);
      }
      if (progress.nextSteps && progress.nextSteps.length > 0) {
        updates.interventions.push(...progress.nextSteps);
      }
    }
  });

  return updates;
}
