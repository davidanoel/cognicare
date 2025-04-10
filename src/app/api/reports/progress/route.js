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
 * Generate a progress report for a client
 */
async function generateProgressReport(clientId, startDate, endDate, user) {
  // Get all relevant data
  const [reports, sessions, client] = await Promise.all([
    getClientReports(clientId, startDate, endDate, ["progress", "treatment", "assessment"]),
    getClientSessions(clientId, startDate, endDate),
    getClientInfo(clientId),
  ]);

  // Structure the report
  const report = {
    metadata: generateReportMetadata("progress", user),
    clientInfo: {
      name: client.name,
      age: client.age,
      riskLevel: client.riskLevel,
    },
    timeframe: {
      start: startDate,
      end: endDate,
    },
    sessions: sessions.map((session) => ({
      date: session.date,
      type: session.type,
      moodRating: session.moodRating,
      notes: session.notes,
    })),
    progress: reports.filter((r) => r.type === "progress").map((r) => r.content),
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

    const report = await generateProgressReport(clientId, startDate, endDate, session.user);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Progress Report Error:", error);
    return NextResponse.json({ error: "Failed to generate progress report" }, { status: 500 });
  }
});
