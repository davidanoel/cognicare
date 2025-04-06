import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AIReport from "@/models/aiReport";
import Session from "@/models/session";

export async function GET(req, context) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: clientId } = await context.params;

    await connectDB();

    // Get all sessions for the client
    const sessions = await Session.find({ clientId }).sort({ date: 1 }).lean();

    // Get all AI reports for the client
    const reports = await AIReport.find({
      clientId,
      counselorId: session.user.id,
    })
      .sort({ "metadata.timestamp": 1 })
      .lean();

    // Process the data for analytics
    const analytics = {
      moodTrends: sessions.map((s) => ({
        date: s.date,
        mood: s.moodRating,
        sessionId: s._id,
      })),
      riskLevels: reports
        .filter((r) => r.type === "assessment")
        .map((r) => ({
          date: r.metadata.timestamp,
          level: r.content.riskLevel,
          sessionId: r.sessionId,
        })),
      treatmentProgress: reports
        .filter((r) => r.type === "progress")
        .map((r) => ({
          date: r.metadata.timestamp,
          status: r.content.treatmentProgress?.status,
          goals: r.content.treatmentProgress?.goalProgress,
          sessionId: r.sessionId,
        })),
      keyInsights: {
        riskFactors: reports
          .filter((r) => r.type === "assessment")
          .flatMap((r) => r.content.primaryConcerns || []),
        diagnoses: reports
          .filter((r) => r.type === "diagnostic")
          .flatMap((r) => r.content.primaryDiagnosis || []),
        treatmentGoals: reports
          .filter((r) => r.type === "treatment")
          .flatMap((r) => r.content.goals || []),
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
