import { useEffect, useState } from "react";
import type { SemanticResponse, SemanticSubgraph, SemanticMetadata } from "../commons/types";

const semanticUrl = new URL("../data/semantic_bipartite_graphs.json", import.meta.url).toString();

type UseSemanticGraphsResult = {
  data: SemanticResponse | null;
  adjectiveNoun: SemanticSubgraph | null;
  verbNoun: SemanticSubgraph | null;
  metadata: SemanticMetadata | null;
  isLoading: boolean;
  error: string | null;
};

export default function useSemanticGraphs(): UseSemanticGraphsResult {
  const [data, setData] = useState<SemanticResponse | null>(null);
  const [metadata, setMetadata] = useState<SemanticMetadata | null>(null);
  const [adjectiveNoun, setAdjectiveNoun] = useState<SemanticSubgraph | null>(null);
  const [verbNoun, setVerbNoun] = useState<SemanticSubgraph | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        const response = await fetch(semanticUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Nie udało się pobrać danych (${response.status})`);
        }
        const payload = (await response.json()) as SemanticResponse;
        setData(payload);
        setMetadata(payload.metadata ?? null);
        setAdjectiveNoun(payload.adjective_noun ?? null);
        setVerbNoun(payload.verb_noun ?? null);
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

  return { data, metadata, adjectiveNoun, verbNoun, isLoading, error };
}
