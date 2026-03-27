import { NextResponse } from "next/server";
import { GeminiVisionAdapter } from "@/infrastructure/ai/gemini-vision-adapter";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const { imageBase64, mimeType } = await req.json();

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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
