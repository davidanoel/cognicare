import { TRIGGER_EVENTS } from "@/constants";

async function callAgent(endpoint, data) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `${endpoint} processing failed: ${response.statusText}`);
  }

  const results = await response.json();
  console.log(`${endpoint} complete:`, results);
  return results;
}

async function processSessionAgents(data) {
  // Sequential processing through all agents
  const agentFlow = [
    {
      endpoint: "/api/ai/assessment",
      getData: (prevResults) => ({
        clientId: data.clientData._id,
        clientData: data.clientData,
        sessionData: data.sessionData,
      }),
    },
    {
      endpoint: "/api/ai/diagnostic",
      getData: (prevResults) => ({
        ...prevResults,
        clientId: data.clientData._id,
        clientData: data.clientData,
        sessionData: data.sessionData,
        priority: prevResults.assessmentResults?.riskLevel === "high" ? "high" : "normal",
        riskFactor: prevResults.assessmentResults?.riskLevel === "high",
      }),
    },
    {
      endpoint: "/api/ai/treatment",
      getData: (prevResults) => ({
        ...prevResults,
        clientId: data.clientData._id,
        clientData: data.clientData,
        sessionData: data.sessionData,
      }),
    },
    {
      endpoint: "/api/ai/progress",
      getData: (prevResults) => ({
        ...prevResults,
        clientId: data.clientData._id,
        clientData: data.clientData,
        sessionData: data.sessionData,
      }),
    },
    {
      endpoint: "/api/ai/documentation",
      getData: (prevResults) => ({
        ...prevResults,
        clientId: data.clientData._id,
        sessionId: data.sessionData._id,
        sessionData: {
          ...data.sessionData,
          clientId: data.sessionData.clientId._id || data.sessionData.clientId,
        },
        clientData: data.clientData,
      }),
    },
  ];

  let accumulatedResults = {};
  for (const agent of agentFlow) {
    const results = await callAgent(agent.endpoint, agent.getData(accumulatedResults));
    accumulatedResults = {
      ...accumulatedResults,
      [agent.endpoint.split("/").pop() + "Results"]: results,
    };
  }

  return accumulatedResults;
}

export async function handleTrigger(eventType, data) {
  try {
    switch (eventType) {
      case TRIGGER_EVENTS.NEW_CLIENT: {
        console.log("Processing new client assessment");
        const requestData = {
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
        return await callAgent("/api/ai/assessment", requestData);
      }

      case TRIGGER_EVENTS.SESSION_COMPLETED:
        console.log("Processing completed session");
        return await processSessionAgents(data);

      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }
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

  const textToCheck = [
    data.initialAssessment,
    data.riskFactors?.suicideRisk?.notes,
    data.riskFactors?.violence?.notes,
    data.clinicalInfo?.presentingProblems,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return riskKeywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, "i").test(textToCheck));
}
