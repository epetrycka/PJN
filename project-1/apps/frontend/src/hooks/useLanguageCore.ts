import { useEffect, useState } from "react";
import type { CoreNode, CoreEdge, CoreMetadata, CoreResponse } from "../commons/types";

const coreUrl = new URL("../data/language_core_graph.json", import.meta.url).toString();

type UseLanguageCoreResult = {
  nodes: CoreNode[] | null;
  edges: CoreEdge[] | null;
  metadata: CoreMetadata | null;
  isLoading: boolean;
  error: string | null;
};

export default function useLanguageCore(): UseLanguageCoreResult {
  const [nodes, setNodes] = useState<CoreNode[] | null>(null);
  const [edges, setEdges] = useState<CoreEdge[] | null>(null);
  const [metadata, setMetadata] = useState<CoreMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        const response = await fetch(coreUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Nie udało się pobrać danych (${response.status})`);
        }
        const payload = (await response.json()) as CoreResponse;
        setNodes(payload.nodes);
        setEdges(payload.edges);
        setMetadata(payload.metadata);
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

  return { nodes, edges, metadata, isLoading, error };
}
