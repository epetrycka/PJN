import { useState } from "react";
import useLanguageCore from "../../../hooks/useLanguageCore";
import CoreGraph from "./CoreGraph";
import CoreSidebar from "./CoreSidebar";

export default function CoreTab() {
  const { nodes, edges, isLoading, error } = useLanguageCore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="card border border-base-300 bg-base-100">
        <div className="card-body">Ładowanie danych...</div>
      </div>
    );
  }

  if (error || !nodes || !edges) {
    return (
      <div className="card border border-base-300 bg-base-100">
        <div className="card-body">Błąd podczas wczytywania danych.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        {/* show only top N nodes in the visualisation to keep it readable */}
        {(() => {
          const TOP = 50;
          const topNodes = [...nodes].sort((a, b) => b.connection_weight - a.connection_weight).slice(0, TOP);
          const topIds = new Set(topNodes.map((n) => n.id));
          const topEdges = edges.filter((e) => topIds.has(e.source) && topIds.has(e.target));
          return (
            <CoreGraph
              nodes={topNodes}
              edges={topEdges}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          );
        })()}
      </div>
      <div className="col-span-1">
        {/* sidebar receives full dataset so summaries remain complete */}
        <CoreSidebar nodes={nodes} edges={edges} selectedId={selectedId} />
      </div>
    </div>
  );
}
