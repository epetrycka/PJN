import type { SemanticEdge, SemanticNode } from "../../../commons/types";

type SemanticSidebarProps = {
  leftLabel: string;
  rightLabel: string;
  leftNodes: SemanticNode[];
  rightNodes: SemanticNode[];
  edges: SemanticEdge[];
  selectedId?: string | null;
};

function countToClass(count: number) {
  if (count === 0) return "bg-red-500 text-white";
  if (count === 1) return "bg-yellow-400 text-neutral-900";
  if (count > 10) return "bg-blue-500 text-white";
  if (count > 2) return "bg-green-500 text-white";
  return "bg-yellow-400 text-neutral-900";
}

export default function SemanticSidebar({
  leftLabel,
  rightLabel,
  leftNodes,
  rightNodes,
  edges,
  selectedId,
}: SemanticSidebarProps) {
  const leftSet = new Set(leftNodes.map((n) => n.id));
  const rightSet = new Set(rightNodes.map((n) => n.id));

  const selectedSide = selectedId
    ? leftSet.has(selectedId)
      ? "left"
      : rightSet.has(selectedId)
      ? "right"
      : null
    : null;

  const connections = selectedId
    ? edges
        .filter((edge) => edge.source === selectedId || edge.target === selectedId)
        .map((edge) => ({
          id: edge.source === selectedId ? edge.target : edge.source,
          weight: edge.weight,
        }))
        .sort((a, b) => b.weight - a.weight)
    : [];

  const topLeft = [...leftNodes].sort((a, b) => b.frequency - a.frequency).slice(0, 10);
  const topRight = [...rightNodes].sort((a, b) => b.frequency - a.frequency).slice(0, 10);

  return (
    <div className="card border border-base-300 bg-base-100 h-full">
      <div className="card-body space-y-4">
        <div>
          <h3 className="card-title text-base">Szybki podgląd</h3>
          <p className="text-sm text-base-content/70">
            Kliknij w węzeł, aby zobaczyć listę powiązań i kolorową skalę częstości.
          </p>
        </div>

        {selectedId ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold">
              Wybrany węzeł:{" "}
              <span className="badge badge-outline">{selectedId}</span>
            </div>
            <div className="text-xs text-base-content/70">
              {selectedSide === "left" ? leftLabel : rightLabel} →{" "}
              {selectedSide === "left" ? rightLabel : leftLabel}
            </div>
            <div className="overflow-auto max-h-[360px] border border-base-200 rounded-lg">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>Słowo</th>
                    <th className="text-right">Wystąpienia</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center text-sm text-base-content/60">
                        Brak połączeń spełniających próg.
                      </td>
                    </tr>
                  ) : (
                    connections.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td className="text-right">
                          <span className={`badge ${countToClass(item.weight)}`}>{item.weight}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="text-sm font-semibold">{leftLabel} (top 10)</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {topLeft.map((node) => (
                  <span key={node.id} className="badge badge-outline">
                    {node.id}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">{rightLabel} (top 10)</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {topRight.map((node) => (
                  <span key={node.id} className="badge badge-outline">
                    {node.id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
