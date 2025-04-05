import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createAgentStream(messages, context) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      {
        role: "system",
        content: "You are a professional mental health AI assistant.",
      },
      ...messages,
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}

export async function createStructuredResponse(messages, context) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are a professional mental health AI assistant. Always respond in valid JSON format.",
      },
      ...messages,
    ],
  });

  return response.choices[0].message.content;
}
