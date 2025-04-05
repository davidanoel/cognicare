import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createStructuredResponse } from "@/lib/ai/baseAgent";
import { connectDB } from "@/lib/mongodb";
import AIReport from "@/models/aiReport";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, sessionNotes } = await req.json();
    if (!clientId || !sessionNotes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Process through AI
    const messages = [
      {
        role: "user",
        content: `Review these session notes and provide a progress analysis. Format the response as JSON with fields: progressSummary, keyObservations, recommendations, and nextSteps.\n\nSession Notes: ${sessionNotes}`,
      },
    ];

    const progressAnalysis = await createStructuredResponse(messages);

    // Store the AI output
    await connectDB();
    const aiReport = new AIReport({
      clientId,
      type: "progress",
      content: JSON.parse(progressAnalysis),
      source: "progress-monitoring",
      metadata: {
        modelVersion: "gpt-3.5-turbo",
        timestamp: new Date(),
      },
    });
    await aiReport.save();

    return NextResponse.json(JSON.parse(progressAnalysis));
  } catch (error) {
    console.error("Progress monitoring error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
