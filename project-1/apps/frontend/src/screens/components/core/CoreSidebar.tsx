import { useMemo } from "react";
import type { CoreNode, CoreEdge } from "../../../commons/types";

type CoreSidebarProps = {
  nodes: CoreNode[];
  edges: CoreEdge[];
  selectedId: string | null;
};

export default function CoreSidebar({ nodes, edges, selectedId }: CoreSidebarProps) {
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const selected = selectedId ? nodeMap.get(selectedId) ?? null : null;

  const neighbors = useMemo(() => {
    if (!selectedId) return [] as { id: string; weight: number }[];
    const list: { id: string; weight: number }[] = [];
    for (const e of edges) {
      if (e.source === selectedId) list.push({ id: e.target, weight: e.weight });
      if (e.target === selectedId) list.push({ id: e.source, weight: e.weight });
    }
    list.sort((a, b) => b.weight - a.weight);
    return list.slice(0, 12);
  }, [edges, selectedId]);

  if (!selected) {
    return (
      <aside className="card h-full border border-base-300 bg-base-100">
        <div className="card-body">
          <h3 className="card-title">Wybierz węzeł</h3>
          <p className="text-sm text-base-content/80">Kliknij w dowolny węzeł na grafie, aby zobaczyć szczegóły.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="card h-full border border-base-300 bg-base-100">
      <div className="card-body space-y-3">
        <h3 className="card-title">{selected.id}</h3>
        <div className="text-sm text-base-content/80">
          <div><strong>Frequency:</strong> {selected.frequency}</div>
          <div><strong>Unique neighbors:</strong> {selected.unique_neighbors}</div>
          <div><strong>Connection weight:</strong> {selected.connection_weight}</div>
        </div>

        <div>
          <h4 className="font-medium">Top połączenia</h4>
          <ul className="list-disc pl-5 text-sm space-y-1 text-base-content/80">
            {neighbors.map((n) => (
              <li key={n.id}>
                {n.id} — {n.weight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
