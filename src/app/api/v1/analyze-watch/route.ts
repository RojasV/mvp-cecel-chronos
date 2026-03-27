import { NextResponse } from "next/server";
import type { IImageAnalyzer } from "@/domain/ports/i-image-analyzer";
import { GeminiVisionAdapter } from "@/infrastructure/ai/gemini-vision-adapter";
import { OpenAIVisionAdapter } from "@/infrastructure/ai/openai-vision-adapter";
import { ClaudeVisionAdapter } from "@/infrastructure/ai/claude-vision-adapter";
import { FallbackImageAnalyzer } from "@/infrastructure/ai/fallback-image-analyzer";

export const maxDuration = 60;

function buildAnalyzer(): IImageAnalyzer {
  const providers: { name: string; analyzer: IImageAnalyzer }[] = [];

  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: "Gemini",
      analyzer: new GeminiVisionAdapter(process.env.GEMINI_API_KEY),
    });
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: "OpenAI",
      analyzer: new OpenAIVisionAdapter(process.env.OPENAI_API_KEY),
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      name: "Claude",
      analyzer: new ClaudeVisionAdapter(process.env.ANTHROPIC_API_KEY),
    });
  }

  if (providers.length === 0) {
    throw new Error("No AI provider API keys configured");
  }

  if (providers.length === 1) {
    return providers[0].analyzer;
  }

  return new FallbackImageAnalyzer(providers);
}

export async function POST(req: Request) {
  try {
    let body: { imageBase64?: string; mimeType?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Request body too large or invalid. Try a smaller image." },
        { status: 413 },
      );
    }

    const { imageBase64, mimeType } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "imageBase64 and mimeType are required" },
        { status: 400 },
      );
    }

    const analyzer = buildAnalyzer();
    const result = await analyzer.analyzeWatch(imageBase64, mimeType);

    if (result.isErr()) {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: 422 },
      );
    }

    return NextResponse.json(result.value);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    );
  }
}
