import OpenAI from "openai";
import { buildFallbackAnswer } from "@/lib/fallback";
import { redactContactDetails } from "@/lib/privacy";
import { knowledgeContext, project } from "@/lib/project";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { chatRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, "chat");
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Please provide at least one valid message." }, { status: 400 });
  }

  const safeMessages = parsed.data.messages.map((message) => ({ ...message, content: redactContactDetails(message.content) }));
  const lastUserMessage = [...safeMessages].reverse().find((message) => message.role === "user");
  if (!lastUserMessage) {
    return Response.json({ error: "A user question is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ message: buildFallbackAnswer(lastUserMessage.content), source: "fallback" });
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.35,
      max_tokens: 280,
      messages: [
        {
          role: "system",
          content: `You are the poised, concise property adviser for ${project.name}. Answer only using the supplied listing facts. Do not invent availability, legal advice, school catchments, financing, investment returns, or local facts. For information not in the listing, say you can arrange a discussion with the sales team. Mention that investment comments are general information, not financial advice.\n\nLISTING FACTS:\n${knowledgeContext}`,
        },
        ...safeMessages,
      ],
    });
    const message = completion.choices[0]?.message.content?.trim();
    if (!message) throw new Error("Empty LLM response");

    return Response.json({ message, source: "llm" });
  } catch (error) {
    console.error("AI service unavailable", error instanceof Error ? error.name : "unknown error");
    return Response.json({ message: buildFallbackAnswer(lastUserMessage.content), source: "fallback" });
  }
}
