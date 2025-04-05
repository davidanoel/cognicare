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
2. Risk factor identification
3. Clinical observation documentation
4. Treatment priority determination

Always consider:
- Immediate safety concerns
- Risk levels
- Support system availability
- Current symptoms
- Historical factors

Provide structured assessment in JSON format.`,
    };

    const userPrompt = {
      role: "user",
      content: `Perform a comprehensive initial assessment for the following client data:
${JSON.stringify(clientData, null, 2)}

${priority === "high" ? "This is a HIGH PRIORITY assessment requiring immediate attention." : ""}
${
  riskFactor
    ? "Risk factors have been identified. Please pay special attention to safety concerns."
    : ""
}

Provide assessment results including:
1. Risk Level (none, low, moderate, high, severe)
2. Primary Concerns
3. Recommended Assessment Tools
4. Initial Clinical Observations
5. Suggested Next Steps
6. Areas Requiring Immediate Attention`,
    };

    const response = await createStructuredResponse([systemPrompt, userPrompt]);
    const assessmentResults = JSON.parse(response);

    // Store the AI output
    await connectDB();
    const aiReport = new AIReport({
      clientId,
      type: "assessment",
      content: assessmentResults,
      source: "initial-assessment",
      metadata: {
        modelVersion: "gpt-3.5-turbo",
        timestamp: new Date(),
        priority,
        riskFactor: !!riskFactor,
      },
    });
    await aiReport.save();

    return NextResponse.json(assessmentResults);
  } catch (error) {
    console.error("Assessment Agent Error:", error);
    return NextResponse.json({ error: "Assessment processing failed" }, { status: 500 });
  }
}
