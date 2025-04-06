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

    const { clientId, clientData, priority, riskFactor } = await req.json();
    if (!clientId || !clientData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = {
      role: "system",
      content: `You are an expert mental health assessment specialist with deep knowledge of clinical assessment protocols.
      
Key Responsibilities:
1. Initial client assessment
2. Proportional risk evaluation
3. Clinical observation documentation
4. Treatment priority determination

Assessment Guidelines:
- Evaluate risk levels proportionally to the presented symptoms
- Do not assume severe conditions without clear indicators
- Base recommendations on the actual information provided
- Consider the context and severity of reported symptoms
- Avoid over-escalating minor concerns
- Only suggest suicide assessment tools when there are clear risk indicators

Risk Level Definitions:
- none: No clinical risks identified (e.g., routine wellness check)
- low: Common concerns with minimal impact (e.g., mild sleep issues, stress)
- moderate: Notable concerns requiring attention (e.g., persistent anxiety, moderate depression)
- high: ONLY for serious concerns (e.g., active suicidal ideation, severe depression)
- severe: ONLY for immediate danger (e.g., current suicide attempt, active psychosis)

Sleep Issues Guidelines:
- Insomnia alone is typically a low-risk concern unless accompanied by other symptoms
- Sleep problems should be assessed as high-risk only if accompanied by clear indicators of severe depression or other serious conditions
- Focus on sleep hygiene and routine assessment tools before escalating

Provide structured assessment in JSON format.`,
    };

    const userPrompt = {
      role: "user",
      content: `Perform a proportional initial assessment for the following client data:
Name: ${clientData.name}
Age: ${clientData.age}
Gender: ${clientData.gender}
Status: ${clientData.status}

Initial Assessment Notes:
${clientData.initialAssessment}

Context: This is the client's initial presentation. Assess based ONLY on the information provided.
${
  priority === "high"
    ? "Note: This case has been flagged for review due to potential concerns."
    : ""
}
${
  riskFactor
    ? "Note: Some risk-related terms were detected, but please assess independently based on the actual content."
    : ""
}

Provide a proportional assessment including:
1. Risk Level (must match the defined risk levels and be based solely on presented information)
2. Primary Concerns (list only concerns directly mentioned or clearly implied)
3. Recommended Assessment Tools (appropriate and proportional to the symptoms)
4. Initial Clinical Observations (stick to factual observations, avoid speculation)
5. Suggested Next Steps (must be proportional to the actual concerns identified)
6. Areas Requiring Immediate Attention (include ONLY if there are genuinely urgent issues)

Remember:
- Base assessment ONLY on explicitly provided information
- Do not assume additional symptoms or risks
- Keep recommendations proportional to the actual presented concerns
- For sleep issues, start with basic sleep assessment tools unless other serious symptoms are reported`,
    };

    const response = await createStructuredResponse([systemPrompt, userPrompt], null, "assessment");
    const assessmentResults = response;

    // Store the AI output
    await connectDB();
    console.log("Creating AI Report with clientId:", clientId);
    const aiReport = new AIReport({
      clientId,
      counselorId: session.user.id,
      type: "assessment",
      content: assessmentResults,
      source: clientData.sessionId
        ? `session-assessment-${clientData.sessionId}`
        : "initial-assessment",
      sessionId: clientData.sessionId,
      metadata: {
        modelVersion: "gpt-3.5-turbo",
        timestamp: new Date(),
        priority,
        riskFactor: !!riskFactor,
      },
    });
    console.log("AI Report object created:", aiReport);
    await aiReport.save();
    console.log("AI Report saved successfully");

    return NextResponse.json(assessmentResults);
  } catch (error) {
    console.error("Assessment Agent Error:", error);
    return NextResponse.json({ error: "Assessment processing failed" }, { status: 500 });
  }
}
