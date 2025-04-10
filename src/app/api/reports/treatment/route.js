import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { requireCounselor } from "@/lib/auth";
import {
  getClientReports,
  getClientSessions,
  getClientInfo,
  generateReportMetadata,
} from "@/lib/report-utils";

/**
 * Generate a treatment summary report for a client
 */
async function generateTreatmentReport(clientId, startDate, endDate, user) {
  // Get all relevant data
  const [reports, sessions, client] = await Promise.all([
    getClientReports(clientId, startDate, endDate, ["treatment", "progress", "assessment"]),
    getClientSessions(clientId, startDate, endDate),
    getClientInfo(clientId),
  ]);

  // Structure the report
  const report = {
    metadata: generateReportMetadata("treatment", user),
    clientInfo: {
      name: client.name,
      age: client.age,
      riskLevel: client.riskLevel,
      diagnosis: client.diagnosis,
    },
    timeframe: {
      start: startDate,
      end: endDate,
    },
    treatmentPlan: {
      goals: client.treatmentPlan?.goals || [],
      interventions: client.treatmentPlan?.interventions || [],
      progress: reports.filter((r) => r.type === "progress").map((r) => r.content),
    },
    sessionSummary: {
      totalSessions: sessions.length,
      sessionTypes: sessions.reduce((acc, session) => {
        acc[session.type] = (acc[session.type] || 0) + 1;
        return acc;
      }, {}),
      averageMoodRating:
        sessions.reduce((acc, session) => acc + (session.moodRating || 0), 0) / sessions.length,
    },
    treatmentUpdates: reports.filter((r) => r.type === "treatment").map((r) => r.content),
    assessments: reports.filter((r) => r.type === "assessment").map((r) => r.content),
  };

  return report;
}

export const POST = requireCounselor(async (req) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { clientId, startDate, endDate } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const report = await generateTreatmentReport(clientId, startDate, endDate, session.user);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Treatment Report Error:", error);
    return NextResponse.json({ error: "Failed to generate treatment report" }, { status: 500 });
  }
});
