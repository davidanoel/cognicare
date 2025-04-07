import { openai } from "@ai-sdk/openai";
import { streamText, generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";

// Define comprehensive schemas for each agent type
const assessmentSchema = z
  .object({
    summary: z
      .string()
      .describe(
        "Brief summary (2-3 sentences) highlighting: 1) Overall risk level and key concerns, 2) Most significant clinical observations, 3) Immediate priorities for intervention"
      ),
    riskLevel: z.string(),
    primaryConcerns: z.array(z.string()),
    recommendedAssessmentTools: z.array(z.string()),
    initialClinicalObservations: z.string(),
    suggestedNextSteps: z.array(z.string()),
    areasRequiringImmediateAttention: z.array(z.string()).optional(),
  })
  .passthrough();

const diagnosticSchema = z
  .object({
    summary: z
      .string()
      .describe(
        "Brief summary (2-3 sentences) highlighting: 1) Primary diagnosis and severity, 2) Key differential diagnoses, 3) Most significant clinical implications"
      ),
    primaryDiagnosis: z.object({
      code: z.string(),
      name: z.string(),
      description: z.string().optional(),
    }),
    differentialDiagnoses: z.array(z.string()),
    ruleOutConditions: z.array(z.string()),
    severityIndicators: z.array(z.string()),
    riskFactors: z.array(z.string()),
    culturalConsiderations: z.array(z.string()),
    recommendedAssessments: z.array(z.string()),
    clinicalJustification: z.string(),
    treatmentImplications: z.array(z.string()),
  })
  .passthrough();

const treatmentSchema = z
  .object({
    summary: z
      .string()
      .describe(
        "Brief summary (2-3 sentences) highlighting: 1) Primary treatment approach, 2) Key short-term goals, 3) Most critical interventions"
      ),
    goals: z.object({
      shortTerm: z.array(z.string()),
      longTerm: z.array(z.string()),
    }),
    interventions: z.array(z.string()),
    timeline: z.array(
      z.object({
        milestone: z.string(),
        timeframe: z.string(),
      })
    ),
    measurableOutcomes: z.array(z.string()),
    progressIndicators: z.array(z.string()),
    recommendedApproaches: z.array(z.string()),
    potentialBarriers: z.array(z.string()),
    successMetrics: z.array(z.string()),
  })
  .passthrough();

const progressSchema = z
  .object({
    summary: z
      .string()
      .describe(
        "Brief summary (2-3 sentences) highlighting: 1) Overall progress status with metrics, 2) Key changes since last session, 3) Most significant achievement or concern"
      ),
    goalAchievementStatus: z.array(
      z.object({
        goal: z.string(),
        status: z.string(),
        notes: z.string().optional(),
      })
    ),
    keyObservations: z.array(z.string()),
    treatmentEffectiveness: z.string(),
    identifiedBarriers: z.array(z.string()),
    areasOfImprovement: z.array(z.string()),
    areasNeedingFocus: z.array(z.string()),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string()),
    treatmentPlanAdjustments: z.array(z.string()),
    metrics: z.object({
      overallProgress: z.number(),
      symptomSeverity: z.number(),
      treatmentAdherence: z.number(),
      riskLevel: z.number(),
    }),
  })
  .passthrough();

const documentationSchema = z
  .object({
    summary: z
      .string()
      .describe(
        "Brief summary (2-3 sentences) highlighting: 1) Key session events, 2) Most significant clinical observations, 3) Critical follow-up actions, 4) Highlight key metrics and progress indicators"
      ),
    soap: z.object({
      subjective: z.string(),
      objective: z.string(),
      assessment: z.string(),
      plan: z.string(),
    }),
    clinicalDocumentation: z.object({
      initialObservations: z.string(),
      riskAssessmentSummary: z.string(),
      diagnosticConsiderations: z.string(),
      treatmentGoalsAndInterventions: z.array(z.string()),
      progressIndicators: z.array(z.string()),
      treatmentEffectivenessAnalysis: z.string(),
      followUpRecommendations: z.array(z.string()),
    }),
    additionalComponents: z.object({
      areasRequiringImmediateAttention: z.array(z.string()).optional(),
      recommendedAssessmentTools: z.array(z.string()),
      specificInterventions: z.array(z.string()),
      progressMetrics: z.array(z.string()),
      nextSessionFocus: z.string(),
    }),
    progressSummary: z.object({
      treatmentGoalsProgress: z.array(
        z.object({
          goal: z.string(),
          progress: z.string(),
        })
      ),
      outcomesMeasurement: z.array(z.string()),
      areasOfImprovement: z.array(z.string()),
      challengesAndBarriers: z.array(z.string()),
      treatmentPlanAdjustments: z.array(z.string()),
      longTermProgressIndicators: z.array(z.string()),
    }),
  })
  .passthrough();

// Combined schema that can handle any agent type
const combinedSchema = z.union([
  assessmentSchema,
  diagnosticSchema,
  treatmentSchema,
  progressSchema,
  documentationSchema,
]);

export async function POST(req) {
  try {
    const { messages, responseType, agentType } = await req.json();

    if (responseType === "stream") {
      const result = await streamText({
        model: openai("gpt-3.5-turbo"),
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
      });

      return result.toAIStreamResponse();
    }

    // Handle JSON responses using generateObject with appropriate schema
    if (responseType === "json") {
      let schema;
      switch (agentType) {
        case "assessment":
          schema = assessmentSchema;
          break;
        case "diagnostic":
          schema = diagnosticSchema;
          break;
        case "treatment":
          schema = treatmentSchema;
          break;
        case "progress":
          schema = progressSchema;
          break;
        case "documentation":
          schema = documentationSchema;
          break;
        default:
          schema = combinedSchema;
      }

      const result = await generateObject({
        model: openai("gpt-3.5-turbo"),
        schema,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
      });

      return new Response(JSON.stringify(result.object), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid responseType specified" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Processing Error:", error);
    return new Response(
      JSON.stringify({
        error: "AI processing failed",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
