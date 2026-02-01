import { useState } from "react";
import useSemanticGraphs from "../../../hooks/useSemanticGraphs";
import BipartiteGraph from "./BipartiteGraph";
import SemanticSidebar from "./SemanticSidebar";

export default function SemanticTab() {
  const { adjectiveNoun, verbNoun, isLoading, error } = useSemanticGraphs();
  const [selectedAdj, setSelectedAdj] = useState<string | null>(null);
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="card border border-base-300 bg-base-100">
        <div className="card-body">Ładowanie danych...</div>
      </div>
    );
  }

  if (error || !adjectiveNoun || !verbNoun) {
    return (
      <div className="card border border-base-300 bg-base-100">
        <div className="card-body">Błąd podczas wczytywania danych.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="card border border-base-300 bg-base-100">
        <div className="card-body space-y-4">
          <div>
            <h2 className="card-title">Przymiotnik ↔ rzeczownik</h2>
            <p className="text-sm text-base-content/70">
              Graf dwudzielny dla top 100 przymiotników i top 100 rzeczowników, połączenia gdy stoją obok siebie w tekście.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <BipartiteGraph
                leftNodes={adjectiveNoun.left_nodes}
                rightNodes={adjectiveNoun.right_nodes}
                edges={adjectiveNoun.edges}
                leftLabel={adjectiveNoun.metadata.left_label}
                rightLabel={adjectiveNoun.metadata.right_label}
                selectedId={selectedAdj}
                onSelect={setSelectedAdj}
              />
            </div>
            <div className="col-span-1">
              <SemanticSidebar
                leftLabel={adjectiveNoun.metadata.left_label}
                rightLabel={adjectiveNoun.metadata.right_label}
                leftNodes={adjectiveNoun.left_nodes}
                rightNodes={adjectiveNoun.right_nodes}
                edges={adjectiveNoun.edges}
                selectedId={selectedAdj}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card border border-base-300 bg-base-100">
        <div className="card-body space-y-4">
          <div>
            <h2 className="card-title">Czasownik ↔ rzeczownik</h2>
            <p className="text-sm text-base-content/70">
              Graf dwudzielny dla top 100 czasowników i top 100 rzeczowników z sąsiedztwa w tekście.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <BipartiteGraph
                leftNodes={verbNoun.left_nodes}
                rightNodes={verbNoun.right_nodes}
                edges={verbNoun.edges}
                leftLabel={verbNoun.metadata.left_label}
                rightLabel={verbNoun.metadata.right_label}
                selectedId={selectedVerb}
                onSelect={setSelectedVerb}
              />
            </div>
            <div className="col-span-1">
              <SemanticSidebar
                leftLabel={verbNoun.metadata.left_label}
                rightLabel={verbNoun.metadata.right_label}
                leftNodes={verbNoun.left_nodes}
                rightNodes={verbNoun.right_nodes}
                edges={verbNoun.edges}
                selectedId={selectedVerb}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
