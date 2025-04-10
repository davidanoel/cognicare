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
 * Generate comprehensive documentation for a client
 */
async function generateDocumentationReport(clientId, startDate, endDate, user) {
  // Get all relevant data
  const [reports, sessions, client] = await Promise.all([
    getClientReports(clientId, startDate, endDate, ["documentation"]),
    getClientSessions(clientId, startDate, endDate),
    getClientInfo(clientId),
  ]);

  // Get the most recent documentation report
  const latestDocumentation = reports
    .filter((r) => r.type === "documentation")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  // Structure the report
  const report = {
    metadata: generateReportMetadata("documentation", user),
    clientInfo: {
      name: client.name,
      age: client.age,
      riskLevel: client.riskLevel,
      diagnosis: client.diagnosis,
      presentingIssues: client.presentingIssues || [],
    },
    timeframe: {
      start: startDate,
      end: endDate,
    },
    documentation: latestDocumentation?.content || {},
    sessionSummary: {
      totalSessions: sessions.length,
      sessionTypes: sessions.reduce((acc, session) => {
        acc[session.type] = (acc[session.type] || 0) + 1;
        return acc;
      }, {}),
      detailedSessions: sessions.map((session) => ({
        date: session.date,
        type: session.type,
        moodRating: session.moodRating,
        notes: session.notes,
        interventions: session.interventions || [],
        homework: session.homework || [],
      })),
    },
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

    const report = await generateDocumentationReport(clientId, startDate, endDate, session.user);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Documentation Report Error:", error);
    return NextResponse.json({ error: "Failed to generate documentation report" }, { status: 500 });
  }
});
