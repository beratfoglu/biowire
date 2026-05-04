import { useState, useEffect } from "react";

interface WikipediaData {
  extract: string;
  thumbnail?: string;
  url: string;
  loading: boolean;
  error: boolean;
}

const cache: Record<string, WikipediaData> = {};

export function useWikipedia(slug: string): WikipediaData {
  const [data, setData] = useState<WikipediaData>({
    extract: "",
    thumbnail: undefined,
    url: `https://en.wikipedia.org/wiki/${slug}`,
    loading: true,
    error: false,
  });

  useEffect(() => {
    if (!slug) return;

    // Return from cache if available
    if (cache[slug]) {
      setData(cache[slug]);
      return;
    }

    let cancelled = false;

    async function fetchWiki() {
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
          { headers: { "Accept": "application/json" } }
        );

        if (!res.ok) throw new Error("Wikipedia fetch failed");

        const json = await res.json();

        const result: WikipediaData = {
          extract: json.extract || "",
          thumbnail: json.thumbnail?.source,
          url: json.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${slug}`,
          loading: false,
          error: false,
        };

        cache[slug] = result;

        if (!cancelled) setData(result);
      } catch {
        const fallback: WikipediaData = {
          extract: "",
          thumbnail: undefined,
          url: `https://en.wikipedia.org/wiki/${slug}`,
          loading: false,
          error: true,
        };
        cache[slug] = fallback;
        if (!cancelled) setData(fallback);
      }
    }

    fetchWiki();
    return () => { cancelled = true; };
  }, [slug]);

  return data;
}