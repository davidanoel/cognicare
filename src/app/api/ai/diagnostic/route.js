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

    const { clientId, assessmentData } = await req.json();
    if (!clientId || !assessmentData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = {
      role: "system",
      content: `You are an expert mental health diagnostician with comprehensive knowledge of the DSM-5.

Key Expertise:
1. DSM-5 diagnostic criteria
2. Differential diagnosis
3. Comorbidity assessment
4. Severity determination
5. Course specifiers

Always consider:
- Full diagnostic criteria
- Differential diagnoses
- Rule-out conditions
- Comorbid conditions
- Cultural considerations
- Medical conditions
- Substance use factors

Provide diagnostic impressions in structured JSON format.`,
    };

    const userPrompt = {
      role: "user",
      content: `Based on the following assessment data, provide a comprehensive diagnostic analysis:
${JSON.stringify(assessmentData, null, 2)}

Include in your analysis:
1. Primary Diagnosis (with DSM-5 code)
2. Differential Diagnoses
3. Rule-Out Conditions
4. Severity Indicators
5. Risk Factors
6. Cultural Considerations
7. Recommended Additional Assessments
8. Clinical Justification
9. Treatment Implications`,
    };

    const response = await createStructuredResponse([systemPrompt, userPrompt]);
    const diagnosticResults = JSON.parse(response);

    // Store the AI output
    await connectDB();
    const aiReport = new AIReport({
      clientId,
      type: "diagnostic",
      content: diagnosticResults,
      source: "diagnostic-analysis",
      metadata: {
        modelVersion: "gpt-3.5-turbo",
        timestamp: new Date(),
      },
    });
    await aiReport.save();

    return NextResponse.json(diagnosticResults);
  } catch (error) {
    console.error("Diagnostic Agent Error:", error);
    return NextResponse.json({ error: "Diagnostic analysis failed" }, { status: 500 });
  }
}
