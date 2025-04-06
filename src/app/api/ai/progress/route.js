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

    const {
      clientId,
      clientData,
      sessionData,
      assessmentResults,
      diagnosticResults,
      treatmentResults,
    } = await req.json();

    if (!clientId || !sessionData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Process through AI
    const systemPrompt = {
      role: "system",
      content: `You are an expert mental health progress monitoring specialist.

Key Focus Areas:
1. Treatment progress evaluation
2. Outcome measurement
3. Goal achievement tracking
4. Barrier identification
5. Treatment effectiveness analysis

Provide progress analysis in structured JSON format.`,
    };

    const userPrompt = {
      role: "user",
      content: `Analyze the client's progress based on the following information:

Client Information:
${JSON.stringify(clientData, null, 2)}

Current Session:
${JSON.stringify(sessionData, null, 2)}

Previous Assessment:
${JSON.stringify(assessmentResults || {}, null, 2)}

Diagnostic Information:
${JSON.stringify(diagnosticResults || {}, null, 2)}

Treatment Plan:
${JSON.stringify(treatmentResults || {}, null, 2)}

Provide a comprehensive progress analysis including:
1. Progress Summary
2. Goal Achievement Status
3. Key Observations
4. Treatment Effectiveness
5. Identified Barriers
6. Areas of Improvement
7. Areas Needing Focus
8. Recommendations
9. Next Steps
10. Adjustments to Treatment Plan`,
    };

    const progressAnalysis = await createStructuredResponse(
      [systemPrompt, userPrompt],
      null,
      "progress"
    );

    // Store the AI output
    await connectDB();
    const aiReport = new AIReport({
      clientId,
      counselorId: session.user.id,
      type: "progress",
      content: progressAnalysis,
      source: "progress-monitoring",
      sessionId: sessionData?._id,
      metadata: {
        modelVersion: "gpt-3.5-turbo",
        timestamp: new Date(),
      },
    });
    await aiReport.save();

    return NextResponse.json(progressAnalysis);
  } catch (error) {
    console.error("Progress monitoring error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
