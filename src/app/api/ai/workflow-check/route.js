import { NextResponse } from "next/server";

/**
 * Simple API route to check if AI workflow is accessible
 * GET /api/ai/workflow-check
 */
export async function GET(req) {
  return NextResponse.json({
    status: "ok",
    message: "AI workflow API is accessible",
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "/api/ai/agent-workflow",
      "/api/ai/assessment",
      "/api/ai/diagnostic",
      "/api/ai/treatment",
      "/api/ai/progress",
      "/api/ai/documentation",
    ],
    version: "1.0.0",
  });
}
