import Anthropic from "@anthropic-ai/sdk";
import { Result } from "@/shared/result";
import type {
  IImageAnalyzer,
  WatchSuggestions,
  AnalysisError,
} from "@/domain/ports/i-image-analyzer";
import { WATCH_ANALYSIS_PROMPT, cleanJsonResponse } from "./watch-analysis-prompt";

type AnthropicMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export class ClaudeVisionAdapter implements IImageAnalyzer {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyzeWatch(
    imageBase64: string,
    mimeType: string,
  ): Promise<Result<WatchSuggestions, AnalysisError>> {
    try {
      const mediaType = (mimeType || "image/jpeg") as AnthropicMediaType;

      const response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              { type: "text", text: WATCH_ANALYSIS_PROMPT },
            ],
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        return Result.err({
          code: "API_ERROR",
          message: "Claude: resposta vazia.",
        });
      }

      const parsed = JSON.parse(
        cleanJsonResponse(textBlock.text),
      ) as WatchSuggestions;

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
          message: `Claude rate limited: ${message}`,
        });
      }

      if (message.includes("JSON")) {
        return Result.err({
          code: "PARSE_ERROR",
          message: "Claude: resposta não estruturada.",
        });
      }

      return Result.err({
        code: "API_ERROR",
        message: `Claude: ${message}`,
      });
    }
  }
}
