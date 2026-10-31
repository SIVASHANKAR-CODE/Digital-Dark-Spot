import config from '../../config';

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  domain: string;
}

/**
 * Search for sources using configured search provider.
 */
export async function searchSources(query: string): Promise<SearchResult[]> {
  if (!config.searchApiKey) {
    console.log('[SearchService] Search API key not configured. Returning empty results.');
    return [];
  }

  if (config.searchProvider === 'google') {
    return googleCustomSearch(query);
  }

  console.log(`[SearchService] Unknown search provider: ${config.searchProvider}`);
  return [];
}

/**
 * Call Google Custom Search API.
 */
async function googleCustomSearch(query: string): Promise<SearchResult[]> {
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  if (!searchEngineId) {
    console.log('[SearchService] GOOGLE_SEARCH_ENGINE_ID not configured.');
    return [];
  }

  try {
    const params = new URLSearchParams({
      key: config.searchApiKey,
      cx: searchEngineId,
      q: query,
      num: '10',
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params.toString()}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status}`);
    }

    const data = (await response.json()) as any;

    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any) => {
      let domain = '';
      try {
        domain = new URL(item.link).hostname;
      } catch {
        domain = 'unknown';
      }

      return {
        url: item.link,
        title: item.title || 'Untitled',
        snippet: item.snippet || '',
        domain,
      };
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown search error';
    console.error(`[SearchService] Search failed: ${message}`);
    return [];
  }
}
