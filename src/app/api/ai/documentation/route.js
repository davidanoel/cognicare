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
      sessionId,
      progressData,
      sessionData,
      clientData,
      assessmentResults,
      diagnosticResults,
      treatmentResults,
      progressResults,
    } = await req.json();
    if (!clientId || !sessionId || !sessionData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = {
      role: "system",
      content: `You are an expert mental health documentation specialist who creates comprehensive clinical documentation by synthesizing information from multiple sources.

Your response MUST follow this exact JSON structure:
{
  "soap": {
    "subjective": "Client's reported experiences",
    "objective": "Clinical observations",
    "assessment": "Clinical judgment",
    "plan": "Treatment recommendations"
  },
  "clinicalDocumentation": {
    "initialObservations": "Initial clinical observations",
    "riskAssessmentSummary": "Summary of risk assessment",
    "diagnosticConsiderations": "Diagnostic considerations",
    "treatmentGoalsAndInterventions": ["Array of goals and interventions"],
    "progressIndicators": ["Array of progress indicators"],
    "treatmentEffectivenessAnalysis": "Analysis of treatment effectiveness",
    "followUpRecommendations": ["Array of follow-up recommendations"]
  },
  "additionalComponents": {
    "areasRequiringImmediateAttention": ["Array of immediate concerns"],
    "recommendedAssessmentTools": ["Array of assessment tools"],
    "specificInterventions": ["Array of specific interventions"],
    "progressMetrics": ["Array of progress metrics"],
    "nextSessionFocus": "Focus for next session"
  },
  "progressSummary": {
    "treatmentGoalsProgress": [
      {
        "goal": "Treatment goal",
        "progress": "Progress description"
      }
    ],
    "outcomesMeasurement": ["Array of outcome measurements"],
    "areasOfImprovement": ["Array of improvement areas"],
    "challengesAndBarriers": ["Array of challenges"],
    "treatmentPlanAdjustments": ["Array of adjustments"],
    "longTermProgressIndicators": ["Array of long-term indicators"]
  }
}`,
    };

    const userPrompt = {
      role: "user",
      content: `Create comprehensive clinical documentation for this session using the exact schema structure specified. Include all required fields.

Client Info:
${JSON.stringify(clientData)}

Session Info:
${JSON.stringify(sessionData)}

Assessment Results:
${JSON.stringify(assessmentResults || {})}

Diagnostic Results:
${JSON.stringify(diagnosticResults || {})}

Treatment Results:
${JSON.stringify(treatmentResults || {})}

Progress Results:
${JSON.stringify(progressResults || {})}

Ensure your response includes all required fields and follows the exact schema structure provided.`,
    };

    const response = await createStructuredResponse(
      [systemPrompt, userPrompt],
      null,
      "documentation"
    );
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
      },
    });
    await aiReport.save();

    return NextResponse.json(documentationResults);
  } catch (error) {
    console.error("Documentation Agent Error:", error);
    return NextResponse.json({ error: "Documentation generation failed" }, { status: 500 });
  }
}
