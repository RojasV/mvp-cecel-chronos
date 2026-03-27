import type { Result } from "@/shared/result";

export type WatchSuggestions = {
  brand: string | null;
  model: string | null;
  reference: string | null;
  dial_color: string | null;
  case_material: string | null;
  case_diameter_mm: number | null;
  movement: string | null;
  year_of_production: number | null;
  condition: string | null;
  accessories: string | null;
  description: string | null;
  confidence_scores: Record<string, number>;
};

export type AnalysisError = {
  code: "API_ERROR" | "PARSE_ERROR" | "INVALID_IMAGE" | "RATE_LIMITED";
  message: string;
};

export interface IImageAnalyzer {
  analyzeWatch(
    imageBase64: string,
    mimeType: string,
  ): Promise<Result<WatchSuggestions, AnalysisError>>;
}
