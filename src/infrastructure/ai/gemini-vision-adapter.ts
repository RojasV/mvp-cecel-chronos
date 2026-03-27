import { GoogleGenerativeAI } from "@google/generative-ai";
import { Result } from "@/shared/result";
import type {
  IImageAnalyzer,
  WatchSuggestions,
  AnalysisError,
} from "@/domain/ports/i-image-analyzer";
import { WATCH_ANALYSIS_PROMPT, cleanJsonResponse } from "./watch-analysis-prompt";

export class GeminiVisionAdapter implements IImageAnalyzer {
  private readonly genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeWatch(
    imageBase64: string,
    mimeType: string,
  ): Promise<Result<WatchSuggestions, AnalysisError>> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const result = await model.generateContent([
        WATCH_ANALYSIS_PROMPT,
        {
          inlineData: {
            data: imageBase64,
            mimeType,
          },
        },
      ]);

      const text = result.response.text();
      const parsed = JSON.parse(cleanJsonResponse(text)) as WatchSuggestions;

      if (!parsed.confidence_scores) {
        parsed.confidence_scores = {};
      }

      return Result.ok(parsed);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      const isRateLimited =
        message.includes("429") ||
        message.includes("quota") ||
        message.includes("rate") ||
        message.includes("Resource has been exhausted");

      if (isRateLimited) {
        return Result.err({
          code: "RATE_LIMITED",
          message: `Gemini rate limited: ${message}`,
        });
      }

      if (message.includes("JSON")) {
        return Result.err({
          code: "PARSE_ERROR",
          message: "Gemini: resposta não estruturada.",
        });
      }

      return Result.err({
        code: "API_ERROR",
        message: `Gemini: ${message}`,
      });
    }
  }
}
