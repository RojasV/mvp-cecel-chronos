import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Composition Root — wires real implementations to use case constructors.
 * Each factory function receives a Supabase client and returns a fully wired use case.
 *
 * Usage in route handlers / server actions:
 *   const supabase = await createSupabaseServerClient();
 *   const useCase = createListWatchesUseCase(supabase);
 *   const result = await useCase.execute(input);
 */

export type AppDependencies = {
  supabase: SupabaseClient;
};

// Use case factories will be added here as we build each use case.
// Example:
// export function createCreateWatchUseCase(deps: AppDependencies) {
//   const watchRepo = new SupabaseWatchRepository(deps.supabase);
//   return new CreateWatchUseCase(watchRepo);
// }
