import OpenAI from "openai";
import { Result } from "@/shared/result";
import type {
  IImageAnalyzer,
  WatchSuggestions,
  AnalysisError,
} from "@/domain/ports/i-image-analyzer";
import { WATCH_ANALYSIS_PROMPT, cleanJsonResponse } from "./watch-analysis-prompt";

export class OpenAIVisionAdapter implements IImageAnalyzer {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async analyzeWatch(
    imageBase64: string,
    mimeType: string,
  ): Promise<Result<WatchSuggestions, AnalysisError>> {
    try {
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: WATCH_ANALYSIS_PROMPT },
              {
                type: "image_url",
                image_url: { url: dataUrl, detail: "high" },
              },
            ],
          },
        ],
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        return Result.err({
          code: "API_ERROR",
          message: "OpenAI: resposta vazia.",
        });
      }

      const parsed = JSON.parse(cleanJsonResponse(text)) as WatchSuggestions;

      if (!parsed.confidence_scores) {
        parsed.confidence_scores = {};
      }

      return Result.ok(parsed);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      if (message.includes("429") || message.includes("rate")) {
        return Result.err({
          code: "RATE_LIMITED",
          message: `OpenAI rate limited: ${message}`,
        });
      }

      if (message.includes("JSON")) {
        return Result.err({
          code: "PARSE_ERROR",
          message: "OpenAI: resposta não estruturada.",
        });
      }

      return Result.err({
        code: "API_ERROR",
        message: `OpenAI: ${message}`,
      });
    }
  }
}
