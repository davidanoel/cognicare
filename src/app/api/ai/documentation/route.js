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

    const { clientId, sessionId, progressData, sessionData, clientData } = await req.json();
    if (!clientId || !sessionId || !sessionData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = {
      role: "system",
      content: `You are an expert mental health documentation specialist.

Key Responsibilities:
1. Clinical note generation
2. Progress report creation
3. Treatment plan documentation
4. Session summary composition

Documentation Standards:
- Clear and concise language
- Objective observations
- Evidence-based terminology
- SOAP format when applicable
- Proper clinical terminology
- Behavioral descriptions
- Measurable outcomes
- Treatment progress indicators

Always include:
- Relevant clinical observations
- Client statements (quoted when significant)
- Interventions used
- Progress toward goals
- Risk assessment updates
- Plan for next session
- Clinical recommendations

Format all documentation professionally and in compliance with clinical standards.`,
    };

    const userPrompt = {
      role: "user",
      content: `Generate comprehensive clinical documentation based on the following data:

Client Information:
${JSON.stringify(clientData, null, 2)}

Session Details:
${JSON.stringify(sessionData, null, 2)}

Progress Data:
${JSON.stringify(progressData || {}, null, 2)}

Generate complete documentation including:
1. Session Summary (SOAP format)
2. Progress Notes
3. Treatment Plan Updates
4. Risk Assessment Updates
5. Clinical Recommendations
6. Next Session Plan
7. Additional Notes/Concerns`,
    };

    const response = await createStructuredResponse([systemPrompt, userPrompt]);
    const documentationResults = response;

    // Store the AI output
    await connectDB();
    const aiReport = new AIReport({
      clientId,
      sessionId,
      counselorId: session.user.id,
      type: "documentation",
      content: documentationResults,
      source: "session-documentation",
      metadata: {
        modelVersion: "gpt-3.5-turbo",
        timestamp: new Date(),
        hasProgressData: !!progressData,
      },
    });
    console.log("Creating AI Report with data:", {
      clientId,
      sessionId,
      counselorId: session.user.id,
      type: "documentation",
    });
    await aiReport.save();

    return NextResponse.json(documentationResults);
  } catch (error) {
    console.error("Documentation Agent Error:", error);
    return NextResponse.json({ error: "Documentation generation failed" }, { status: 500 });
  }
}
