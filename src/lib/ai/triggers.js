import { TRIGGER_EVENTS } from "@/constants";

export async function handleTrigger(eventType, data) {
  try {
    let endpoint;
    let requestData;

    switch (eventType) {
      case TRIGGER_EVENTS.NEW_CLIENT:
        endpoint = "/api/ai/assessment";
        requestData = {
          clientId: data._id,
          clientData: {
            name: data.name,
            age: data.age,
            gender: data.gender,
            initialAssessment: data.initialAssessment,
            contactInfo: data.contactInfo,
          },
          priority: "normal",
          riskFactor: shouldTriggerRiskAssessment(data),
        };
        break;
      case TRIGGER_EVENTS.SESSION_COMPLETED:
        endpoint = "/api/ai/documentation";
        requestData = {
          clientId: data.clientData._id,
          sessionId: data.sessionData._id,
          sessionData: data.sessionData,
          clientData: data.clientData,
        };
        break;
      case TRIGGER_EVENTS.RISK_IDENTIFIED:
        endpoint = "/api/ai/diagnostic";
        requestData = {
          clientId: data._id,
          assessmentData: data,
          priority: "high",
          riskFactor: true,
        };
        break;
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `AI processing failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Trigger handling error:", error);
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
