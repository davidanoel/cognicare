import { openai } from "@ai-sdk/openai";
import { streamText, generateObject } from "ai";
import { z } from "zod";

export const runtime = "edge";

// Define a flexible schema for the expected JSON object
// Adjust this based on the actual expected structure from your assessment prompt
const assessmentSchema = z
  .object({
    riskLevel: z.string().optional(),
    primaryConcerns: z.array(z.string()).optional(),
    recommendedAssessmentTools: z.array(z.string()).optional(),
    initialClinicalObservations: z.string().optional(),
    suggestedNextSteps: z.array(z.string()).optional(),
    areasRequiringImmediateAttention: z.array(z.string()).optional(),
    // Add any other expected fields
  })
  .passthrough(); // Allow other fields not explicitly defined

export async function POST(req) {
  try {
    const { messages, responseType } = await req.json();

    const model = openai("gpt-3.5-turbo");

    if (responseType === "stream") {
      const result = await streamText({
        model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
      });

      return result.toAIStreamResponse();
    }

    // Handle JSON responses using generateObject
    if (responseType === "json") {
      const result = await generateObject({
        model,
        schema: assessmentSchema,
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

    // Fallback for unknown responseType (optional, could return error)
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
