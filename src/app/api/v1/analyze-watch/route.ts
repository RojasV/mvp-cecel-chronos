import { NextResponse } from "next/server";
import { GeminiVisionAdapter } from "@/infrastructure/ai/gemini-vision-adapter";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

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

    const analyzer = new GeminiVisionAdapter(apiKey);
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
