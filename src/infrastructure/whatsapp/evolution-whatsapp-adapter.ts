import { Result } from "@/shared/result";
import type {
  IMessageDispatcher,
  SendTextParams,
  SendMediaParams,
  DispatchResult,
  DispatchError,
} from "@/domain/ports/i-message-dispatcher";

export class EvolutionWhatsAppAdapter implements IMessageDispatcher {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly instanceName: string;

  constructor(baseUrl: string, apiKey: string, instanceName: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.instanceName = instanceName;
  }

  async sendText(
    params: SendTextParams,
  ): Promise<Result<DispatchResult, DispatchError>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/message/sendText/${this.instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
          body: JSON.stringify({
            number: params.phone,
            text: params.text,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        return Result.err({
          code: "API_ERROR",
          message: `Evolution API error (${response.status}): ${error}`,
        });
      }

      const data = await response.json();

      return Result.ok({
        messageId: data?.key?.id ?? null,
        status: "sent" as const,
      });
    } catch (error) {
      return Result.err({
        code: "API_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async sendMedia(
    params: SendMediaParams,
  ): Promise<Result<DispatchResult, DispatchError>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/message/sendMedia/${this.instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
          body: JSON.stringify({
            number: params.phone,
            mediatype: "image",
            media: params.mediaUrl,
            caption: params.caption,
            mimetype: params.mimeType ?? "image/jpeg",
            fileName: params.fileName ?? "relogio.jpg",
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        return Result.err({
          code: "API_ERROR",
          message: `Evolution API error (${response.status}): ${error}`,
        });
      }

      const data = await response.json();

      return Result.ok({
        messageId: data?.key?.id ?? null,
        status: "sent" as const,
      });
    } catch (error) {
      return Result.err({
        code: "API_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
