import { useEffect, useState } from "react";

type NounEntry = {
  rank: number;
  word: string;
  count: number;
  translation_pl?: string;
  translation_en?: string;
};

type NounsMetadata = {
  limit?: number;
  source_total_tokens?: number;
};

type NounsResponse = {
  metadata?: NounsMetadata;
  data: NounEntry[];
};

const nounsUrl = new URL("../data/nouns_translations.json", import.meta.url).toString();

export default function useNouns() {
  const [data, setData] = useState<NounEntry[] | null>(null);
  const [metadata, setMetadata] = useState<NounsMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        const response = await fetch(nounsUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Nie udało się pobrać danych (${response.status})`);
        }
        const payload = (await response.json()) as NounsResponse;
        setData(payload.data ?? []);
        setMetadata(payload.metadata ?? null);
        setError(null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message ?? "Wystąpił błąd podczas ładowania danych");
      } finally {
        setIsLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, []);

  return { data, metadata, isLoading, error } as const;
}
