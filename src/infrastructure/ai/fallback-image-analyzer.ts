import { Result } from "@/shared/result";
import type {
  IImageAnalyzer,
  WatchSuggestions,
  AnalysisError,
} from "@/domain/ports/i-image-analyzer";

export class FallbackImageAnalyzer implements IImageAnalyzer {
  private readonly providers: { name: string; analyzer: IImageAnalyzer }[];

  constructor(providers: { name: string; analyzer: IImageAnalyzer }[]) {
    this.providers = providers;
  }

  async analyzeWatch(
    imageBase64: string,
    mimeType: string,
  ): Promise<Result<WatchSuggestions, AnalysisError>> {
    const errors: string[] = [];

    for (const { name, analyzer } of this.providers) {
      console.log(`[FallbackAnalyzer] Trying provider: ${name}`);

      const result = await analyzer.analyzeWatch(imageBase64, mimeType);

      if (result.isOk()) {
        console.log(`[FallbackAnalyzer] Success with: ${name}`);
        return result;
      }

      const errMsg = `${name}: ${result.error.message}`;
      console.warn(`[FallbackAnalyzer] Failed - ${errMsg}`);
      errors.push(errMsg);
    }

    return Result.err({
      code: "API_ERROR",
      message: `Todos os provedores de IA falharam:\n${errors.join("\n")}`,
    });
  }
}
