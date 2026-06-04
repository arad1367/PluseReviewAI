import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { reviewSchema } from "@/lib/ai/schema";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import type { PRContext } from "@/lib/ai/prompt";
import type { ProviderID } from "@/lib/ai/providers";

function getModel(providerId: ProviderID, modelId: string, apiKey: string) {
  switch (providerId) {
    case "anthropic":
      return createAnthropic({ apiKey })(modelId);
    case "openai":
      return createOpenAI({ apiKey })(modelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
    case "groq":
      return createGroq({ apiKey })(modelId);
    case "openrouter":
      return createOpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        headers: {
          "HTTP-Referer": "https://pulsereview.ai",
          "X-Title": "PulseReview AI",
        },
      })(modelId);
    default:
      throw new Error(`Unknown provider: ${providerId}`);
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();

  let body: {
    providerId: ProviderID;
    model: string;
    apiKey: string;
    prContext: PRContext;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { providerId, model, apiKey, prContext } = body;

  if (!providerId || !model || !apiKey || !prContext) {
    return NextResponse.json(
      { error: "Missing required fields: providerId, model, apiKey, prContext" },
      { status: 400 }
    );
  }

  if (apiKey.length < 8) {
    return NextResponse.json({ error: "API key appears invalid" }, { status: 400 });
  }

  try {
    const llmModel = getModel(providerId, model, apiKey);

    const { object, usage } = await generateObject({
      model: llmModel,
      schema: reviewSchema,
      system: buildSystemPrompt(),
      prompt: buildUserPrompt(prContext),
    });

    const latencyMs = Date.now() - start;

    return NextResponse.json({
      review: object,
      meta: {
        latencyMs,
        tokenUsage: usage?.totalTokens ?? null,
        provider: providerId,
        model,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Surface common provider errors cleanly
    if (message.includes("401") || message.includes("Unauthorized") || message.includes("invalid_api_key") || message.includes("Invalid API Key")) {
      return NextResponse.json(
        { error: "Invalid API key. Check your key and try again." },
        { status: 401 }
      );
    }
    if (message.includes("429") || message.includes("rate_limit") || message.includes("quota")) {
      return NextResponse.json(
        { error: "Rate limit or quota exceeded for this API key. Try again shortly or use a different provider." },
        { status: 429 }
      );
    }
    if (message.includes("model_not_found") || message.includes("does not exist")) {
      return NextResponse.json(
        { error: `Model "${model}" not found for provider "${providerId}".` },
        { status: 400 }
      );
    }

    console.error("[review route] Error:", message);
    return NextResponse.json(
      { error: `Review failed: ${message}` },
      { status: 500 }
    );
  }
}
