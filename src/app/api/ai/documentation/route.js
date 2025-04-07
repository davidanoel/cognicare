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

IMPORTANT: You must ALWAYS include:
1. All relevant metrics (risk levels, symptom severity, progress scores)
2. Diagnostic codes and criteria
3. Treatment adherence percentages
4. Progress indicators with numerical values

Your response MUST follow this exact JSON structure:
{
  "soap": {
    "subjective": "Client's reported experiences with metrics",
    "objective": "Clinical observations with measurements",
    "assessment": "Clinical judgment with diagnostic codes",
    "plan": "Treatment recommendations with metrics"
  },
  "clinicalDocumentation": {
    "initialObservations": "Initial clinical observations with measurements",
    "riskAssessmentSummary": "Summary of risk assessment with levels",
    "diagnosticConsiderations": "Diagnostic considerations with codes",
    "treatmentGoalsAndInterventions": ["Array of goals and interventions with metrics"],
    "progressIndicators": ["Array of progress indicators with numerical values"],
    "treatmentEffectivenessAnalysis": "Analysis of treatment effectiveness with percentages",
    "followUpRecommendations": ["Array of follow-up recommendations with metrics"]
  },
  "additionalComponents": {
    "areasRequiringImmediateAttention": ["Array of immediate concerns with risk levels"],
    "recommendedAssessmentTools": ["Array of assessment tools with scores"],
    "specificInterventions": ["Array of specific interventions with metrics"],
    "progressMetrics": ["Array of progress metrics with numerical values"],
    "nextSessionFocus": "Focus for next session with measurable goals"
  },
  "progressSummary": {
    "treatmentGoalsProgress": [
      {
        "goal": "Treatment goal",
        "progress": "Progress description with percentage",
        "metrics": {
          "currentScore": "numerical value",
          "targetScore": "numerical value",
          "progressPercentage": "percentage"
        }
      }
    ],
    "outcomesMeasurement": ["Array of outcome measurements with scores"],
    "areasOfImprovement": ["Array of improvement areas with metrics"],
    "challengesAndBarriers": ["Array of challenges with severity ratings"],
    "treatmentPlanAdjustments": ["Array of adjustments with impact metrics"],
    "longTermProgressIndicators": ["Array of long-term indicators with measurements"]
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
