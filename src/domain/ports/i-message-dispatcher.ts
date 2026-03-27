import type { Result } from "@/shared/result";

export type SendTextParams = {
  phone: string;
  text: string;
};

export type SendMediaParams = {
  phone: string;
  mediaUrl: string;
  caption: string;
  mimeType?: string;
  fileName?: string;
};

export type DispatchError = {
  code: "API_ERROR" | "INSTANCE_OFFLINE" | "INVALID_NUMBER" | "RATE_LIMITED";
  message: string;
};

export type DispatchResult = {
  messageId: string | null;
  status: "sent" | "queued";
};

export interface IMessageDispatcher {
  sendText(params: SendTextParams): Promise<Result<DispatchResult, DispatchError>>;
  sendMedia(params: SendMediaParams): Promise<Result<DispatchResult, DispatchError>>;
}
