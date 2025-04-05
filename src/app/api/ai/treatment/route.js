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

    const { clientId, clientData, sessionData, assessmentResults, diagnosticResults } =
      await req.json();
    if (!clientId || !diagnosticResults) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Process through AI
    const systemPrompt = {
      role: "system",
      content: `You are an expert mental health treatment planner with extensive experience in developing evidence-based treatment plans.

Key Focus Areas:
1. Evidence-based interventions
2. Goal setting and outcome measurement
3. Treatment timeline planning
4. Progress monitoring strategies
5. Intervention customization

Provide treatment recommendations in structured JSON format.`,
    };

    const userPrompt = {
      role: "user",
      content: `Based on the following information, develop a comprehensive treatment plan:

Client Information:
${JSON.stringify(clientData, null, 2)}

Session Information:
${JSON.stringify(sessionData || {}, null, 2)}

Assessment Results:
${JSON.stringify(assessmentResults || {}, null, 2)}

Diagnostic Results:
${JSON.stringify(diagnosticResults, null, 2)}

Create a treatment plan including:
1. Treatment Goals (short-term and long-term)
2. Specific Interventions
3. Timeline and Milestones
4. Measurable Outcomes
5. Progress Indicators
6. Recommended Approaches
7. Potential Barriers
8. Success Metrics`,
    };

    const treatmentPlan = await createStructuredResponse(
      [systemPrompt, userPrompt],
      null,
      "treatment"
    );

    // Store the AI output
    await connectDB();
    const aiReport = new AIReport({
      clientId,
      counselorId: session.user.id,
      type: "treatment",
      content: treatmentPlan,
      source: "treatment-planning",
      metadata: {
        modelVersion: "gpt-3.5-turbo",
        timestamp: new Date(),
      },
    });
    await aiReport.save();

    return NextResponse.json(treatmentPlan);
  } catch (error) {
    console.error("Treatment planning error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
