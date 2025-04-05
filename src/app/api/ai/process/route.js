import { OpenAI } from "openai";
import { OpenAIStream } from "ai";
import { StreamingTextResponse } from "ai/edge";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages, responseType } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages,
      response_format: responseType === "json" ? { type: "json_object" } : undefined,
    });

    if (responseType === "stream") {
      const stream = OpenAIStream(response);
      return new StreamingTextResponse(stream);
    }

    return new Response(JSON.stringify(response.choices[0].message.content), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
