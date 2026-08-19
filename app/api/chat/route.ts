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
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const completion = await client.chat.completions.create({
      model,
      ...(model.toLowerCase().startsWith("gpt-5") ? {} : { temperature: 0.35 }),
      max_completion_tokens: 280,
      messages: [
        {
          role: "system",
          content: `You are the poised, concise property adviser for ${project.name}. Answer only using the supplied listing facts. Do not invent availability, legal advice, school catchments, financing, rental yields, vacancy rates, investment returns, or local facts. When asked about renting versus self-living, compare the known owner-occupier and long-term-investor positioning, then clearly say which rental metrics are not available. For information not in the listing, say you can arrange a discussion with the sales team. Mention that investment comments are general information, not financial advice.\n\nLISTING FACTS:\n${knowledgeContext}`,
        },
        ...safeMessages,
      ],
    });
    const message = completion.choices[0]?.message.content?.trim();
    if (!message) throw new Error("Empty LLM response");

    return Response.json({ message, source: "llm" });
  } catch (error) {
    const details = error && typeof error === "object" ? error as { name?: unknown; status?: unknown; code?: unknown; type?: unknown; param?: unknown; request_id?: unknown } : {};
    console.error("AI service unavailable", {
      name: typeof details.name === "string" ? details.name : "unknown",
      status: typeof details.status === "number" ? details.status : undefined,
      code: typeof details.code === "string" ? details.code : undefined,
      type: typeof details.type === "string" ? details.type : undefined,
      param: typeof details.param === "string" ? details.param : undefined,
      requestId: typeof details.request_id === "string" ? details.request_id : undefined,
    });
    return Response.json({ message: buildFallbackAnswer(lastUserMessage.content), source: "fallback" });
  }
}
