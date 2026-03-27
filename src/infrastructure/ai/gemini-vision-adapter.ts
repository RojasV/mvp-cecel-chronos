import { GoogleGenerativeAI } from "@google/generative-ai";
import { Result } from "@/shared/result";
import type {
  IImageAnalyzer,
  WatchSuggestions,
  AnalysisError,
} from "@/domain/ports/i-image-analyzer";

const ANALYSIS_PROMPT = `You are an expert luxury watch appraiser and identifier. Analyze this watch image and provide detailed information.

Return ONLY a valid JSON object (no markdown, no code fences) with these fields:

{
  "brand": "brand name (e.g. Rolex, Patek Philippe, Audemars Piguet, Omega)",
  "model": "model name (e.g. Submariner, Nautilus, Royal Oak, Speedmaster)",
  "reference": "reference number if visible or identifiable",
  "dial_color": "dial color in Portuguese (e.g. Preto, Azul, Branco, Champagne)",
  "case_material": "case material in Portuguese (e.g. Aço Inoxidável, Ouro Amarelo 18k, Ouro Rosa, Titânio, Platina)",
  "case_diameter_mm": numeric diameter in mm (e.g. 41, 40, 36) or null if unknown,
  "movement": "movement type in Portuguese (e.g. Automático, Quartzo, Corda Manual)",
  "year_of_production": numeric year or null if unknown,
  "condition": "one of: new, unworn, excellent, very_good, good, fair",
  "accessories": "visible accessories in Portuguese (e.g. Caixa, Documentos, Certificado) or null",
  "description": "Professional marketing description of the watch in Portuguese (2-3 sentences, luxury tone, highlighting key features)",
  "confidence_scores": {
    "brand": 0.0 to 1.0,
    "model": 0.0 to 1.0,
    "reference": 0.0 to 1.0,
    "dial_color": 0.0 to 1.0,
    "case_material": 0.0 to 1.0,
    "case_diameter_mm": 0.0 to 1.0,
    "movement": 0.0 to 1.0,
    "year_of_production": 0.0 to 1.0,
    "condition": 0.0 to 1.0
  }
}

Rules:
- If you cannot identify a field, set it to null and confidence to 0
- Be specific with models (e.g. "Submariner Date" not just "Submariner")
- Description must be in Brazilian Portuguese, luxury marketing tone
- Confidence scores: 0.9+ = very sure, 0.7-0.9 = likely, 0.5-0.7 = uncertain, <0.5 = guess
- For dial_color, case_material, movement, accessories: always respond in Portuguese`;

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
        ANALYSIS_PROMPT,
        {
          inlineData: {
            data: imageBase64,
            mimeType,
          },
        },
      ]);

      const response = result.response;
      const text = response.text();

      const cleaned = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsed = JSON.parse(cleaned) as WatchSuggestions;

      if (!parsed.confidence_scores) {
        parsed.confidence_scores = {};
      }

      return Result.ok(parsed);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      if (message.includes("429") || message.includes("quota")) {
        return Result.err({
          code: "RATE_LIMITED",
          message: "API rate limit exceeded. Try again in a moment.",
        });
      }

      if (message.includes("JSON")) {
        return Result.err({
          code: "PARSE_ERROR",
          message: "Failed to parse AI response as structured data.",
        });
      }

      return Result.err({
        code: "API_ERROR",
        message: `Gemini API error: ${message}`,
      });
    }
  }
}
