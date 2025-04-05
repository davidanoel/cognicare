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
    const errorData = await response.json();
    throw new Error(errorData.error || "AI processing failed");
  }

  return response;
}

export async function createStructuredResponse(
  messages,
  functions = null,
  agentType = "assessment"
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/ai/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        functions,
        agentType,
        responseType: "json",
      }),
    });

    if (!response.ok) {
      console.error("AI processing error:", await response.text());
      throw new Error("AI processing failed");
    }

    const data = await response.json();

    // Handle potential parsing errors
    try {
      // If data is already an object, return it
      if (typeof data === "object" && data !== null) {
        return data;
      }
      // If data is a string, try to parse it
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      throw new Error("Invalid response format");
    } catch (parseError) {
      console.error("Response parsing error:", parseError);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Error in createStructuredResponse:", error);
    throw error;
  }
}
