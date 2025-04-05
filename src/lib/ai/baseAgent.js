export async function createAgentStream(messages, context) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/ai/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "You are a professional mental health AI assistant.",
        },
        ...messages,
      ],
      responseType: "stream",
    }),
  });

  if (!response.ok) {
    throw new Error("AI processing failed");
  }

  return response;
}

export async function createStructuredResponse(messages, context) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/ai/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are a professional mental health AI assistant. Always respond in valid JSON format.",
        },
        ...messages,
      ],
      responseType: "json",
    }),
  });

  if (!response.ok) {
    throw new Error("AI processing failed");
  }

  const result = await response.json();
  return result;
}
