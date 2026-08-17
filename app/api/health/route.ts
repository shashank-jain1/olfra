import { getAiProvider } from '@/lib/ai';
import { serverCapabilities } from '@/lib/config/env';
import { getFragranceRepository } from '@/lib/fragrance/repository';
import { handleError, ok } from '@/lib/http/respond';

/**
 * What is actually wired up right now.
 *
 * Useful in deployment ("did my env vars land?") and honest in the UI —
 * the app tells you it is running on the seed catalogue rather than
 * implying a 74,000-fragrance database it cannot reach.
 */
export async function GET() {
  try {
    const capabilities = serverCapabilities();
    const repository = getFragranceRepository();

    return ok({
      status: 'ok',
      capabilities,
      catalogue: {
        adapter: repository.name,
        /** Seed-only means a small curated set, not the full catalogue. */
        seedOnly: !capabilities.database,
      },
      ai: {
        provider: getAiProvider()?.name ?? null,
        /** Features that need a provider; everything else works without one. */
        gatedFeatures: capabilities.generativeAi
          ? []
          : ['bottle-photo-identification', 'weekly-editorial'],
      },
    });
  } catch (error) {
    return handleError(error, 'health');
  }
}
