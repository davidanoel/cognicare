import { TRIGGER_EVENTS } from "@/constants";

export async function handleTrigger(eventType, data) {
  try {
    let endpoint;
    let requestData;

    switch (eventType) {
      case TRIGGER_EVENTS.NEW_CLIENT:
        console.log("New client detected - Full data:", JSON.stringify(data, null, 2));
        console.log("Initial assessment from client data:", data.initialAssessment);
        endpoint = "/api/ai/assessment";
        requestData = {
          clientId: data._id,
          clientData: {
            name: data.name,
            age: data.age,
            gender: data.gender,
            initialAssessment: data.initialAssessment,
            contactInfo: data.contactInfo,
            status: data.status,
          },
          priority: shouldTriggerRiskAssessment(data) ? "high" : "normal",
          riskFactor: shouldTriggerRiskAssessment(data),
        };
        console.log("Assessment request data:", JSON.stringify(requestData, null, 2));
        console.log("Initial assessment in request:", requestData.clientData.initialAssessment);
        break;
      case TRIGGER_EVENTS.SESSION_COMPLETED:
        console.log("Session completed event received with data:", JSON.stringify(data, null, 2));
        endpoint = "/api/ai/documentation";

        if (!data.clientData?._id) {
          console.error("Missing clientData._id");
          throw new Error("Missing required fields: clientData._id");
        }
        if (!data.sessionData?._id) {
          console.error("Missing sessionData._id");
          throw new Error("Missing required fields: sessionData._id");
        }

        // Handle nested clientId structure
        const sessionData = {
          ...data.sessionData,
          clientId: data.sessionData.clientId._id || data.sessionData.clientId,
        };

        requestData = {
          clientId: data.clientData._id,
          sessionId: data.sessionData._id,
          sessionData: sessionData,
          clientData: data.clientData,
        };
        console.log("Documentation request data:", JSON.stringify(requestData, null, 2));
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
    "violence",
    "abuse",
    "danger",
  ];

  // Only check the initialAssessment and specific risk-related fields
  const textToCheck = [
    data.initialAssessment,
    data.riskFactors?.suicideRisk?.notes,
    data.riskFactors?.violence?.notes,
    data.clinicalInfo?.presentingProblems,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Check for exact word matches to avoid false positives
  return riskKeywords.some((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    return regex.test(textToCheck);
  });
}
