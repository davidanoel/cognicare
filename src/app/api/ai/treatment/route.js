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

    const { clientId, clientHistory } = await req.json();
    if (!clientId || !clientHistory) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Process through AI
    const messages = [
      {
        role: "user",
        content: `Based on the client's history, suggest a treatment plan. Format the response as JSON with fields: goals, interventions, timeline, and measurableOutcomes.\n\nClient History: ${clientHistory}`,
      },
    ];

    const treatmentPlan = await createStructuredResponse(messages);

    // Store the AI output
    await connectDB();
    const aiReport = new AIReport({
      clientId,
      type: "treatment",
      content: JSON.parse(treatmentPlan),
      source: "treatment-planning",
      metadata: {
        modelVersion: "gpt-3.5-turbo",
        timestamp: new Date(),
      },
    });
    await aiReport.save();

    return NextResponse.json(JSON.parse(treatmentPlan));
  } catch (error) {
    console.error("Treatment planning error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
