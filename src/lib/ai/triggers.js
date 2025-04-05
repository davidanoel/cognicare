import { TRIGGER_EVENTS } from "@/constants";
import AIReport from "@/models/aiReport";
import { connectDB } from "@/lib/mongodb";

export async function handleTrigger(event, data) {
  try {
    await connectDB();

    switch (event) {
      case TRIGGER_EVENTS.NEW_CLIENT:
        // 1. Assessment Agent
        const assessmentResult = await fetch("/api/ai/assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientData: data }),
        });

        if (!assessmentResult.ok) {
          throw new Error("Assessment failed");
        }

        const assessmentData = await assessmentResult.json();

        // Store assessment report
        await AIReport.create({
          clientId: data._id,
          type: "assessment",
          content: {
            summary: assessmentData.summary,
            riskLevel: assessmentData.riskLevel,
            primaryConcerns: assessmentData.concerns,
            recommendations: assessmentData.recommendations,
          },
          source: "initial-assessment",
          metadata: {
            confidence: assessmentData.confidence,
            modelVersion: assessmentData.modelVersion,
          },
        });

        // 2. Diagnostic Agent
        const diagnosticResult = await fetch("/api/ai/diagnostic", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assessmentData }),
        });

        if (!diagnosticResult.ok) {
          throw new Error("Diagnostic analysis failed");
        }

        const diagnosticData = await diagnosticResult.json();

        // Store diagnostic report
        await AIReport.create({
          clientId: data._id,
          type: "diagnostic",
          content: {
            summary: diagnosticData.summary,
            diagnoses: diagnosticData.diagnoses,
            recommendations: diagnosticData.recommendations,
          },
          source: "initial-assessment",
          metadata: {
            confidence: diagnosticData.confidence,
            modelVersion: diagnosticData.modelVersion,
          },
        });

        return diagnosticData;

      case TRIGGER_EVENTS.SESSION_COMPLETED:
        // Process session completion through the chain
        const sessionResult = await fetch("/api/ai/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionData: data.sessionData,
            clientData: data.clientData,
          }),
        });

        if (!sessionResult.ok) {
          throw new Error("Session processing failed");
        }

        const progressData = await sessionResult.json();

        // Store progress report
        await AIReport.create({
          clientId: data.clientData._id,
          type: "progress",
          content: {
            summary: progressData.summary,
            primaryConcerns: progressData.concerns,
            recommendations: progressData.recommendations,
          },
          source: "session-notes",
          metadata: {
            sessionId: data.sessionData._id,
            confidence: progressData.confidence,
            modelVersion: progressData.modelVersion,
          },
        });

        // Generate documentation
        const documentationResult = await fetch("/api/ai/documentation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            progressData,
            sessionData: data.sessionData,
            clientData: data.clientData,
          }),
        });

        if (!documentationResult.ok) {
          throw new Error("Documentation generation failed");
        }

        const docData = await documentationResult.json();

        // Store treatment report if documentation includes treatment updates
        if (docData.treatmentUpdates) {
          await AIReport.create({
            clientId: data.clientData._id,
            type: "treatment",
            content: {
              summary: docData.treatmentUpdates.summary,
              recommendations: docData.treatmentUpdates.recommendations,
            },
            source: "session-notes",
            metadata: {
              sessionId: data.sessionData._id,
              confidence: docData.confidence,
              modelVersion: docData.modelVersion,
            },
          });
        }

        return docData;

      case TRIGGER_EVENTS.RISK_IDENTIFIED:
        // Immediate assessment and diagnostic review
        const riskAssessment = await fetch("/api/ai/assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientData: data,
            priority: "high",
            riskFactor: true,
          }),
        });

        if (!riskAssessment.ok) {
          throw new Error("Risk assessment failed");
        }

        const riskData = await riskAssessment.json();

        // Store risk assessment report
        await AIReport.create({
          clientId: data._id,
          type: "assessment",
          content: {
            summary: riskData.summary,
            riskLevel: riskData.riskLevel,
            primaryConcerns: riskData.concerns,
            recommendations: riskData.recommendations,
          },
          source: "progress-review",
          metadata: {
            confidence: riskData.confidence,
            modelVersion: riskData.modelVersion,
          },
        });

        return riskData;

      default:
        throw new Error("Unknown trigger event");
    }
  } catch (error) {
    console.error("AI Agent Chain Error:", error);
    throw error;
  }
}

export function shouldTriggerRiskAssessment(data) {
  const riskKeywords = [
    "suicide",
    "self-harm",
    "harm",
    "crisis",
    "emergency",
    "urgent",
    "immediate",
    "severe",
    "extreme",
    "critical",
  ];

  const dataString = JSON.stringify(data).toLowerCase();
  return riskKeywords.some((keyword) => dataString.includes(keyword));
}
