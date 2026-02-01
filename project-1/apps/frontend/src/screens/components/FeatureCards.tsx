import type { FeatureTab } from "../../commons/types";

type FeatureCardsProps = {
	tabs: FeatureTab[];
};

const descriptions: Record<FeatureTab["id"], string> = {
	frequency: "Zestawienie najczęściej występujących wyrazów w tekście.",
	zipf: "Weryfikacja, czy rozkład częstości spełnia prawo Zipfa.",
	core: "Graf słów, gdzie rdzeń to wyrazy o największej liczbie połączeń.",
	nouns: "Lista 50 najczęstszych rzeczowników i ich tłumaczenia.",
	semantic: "Grafy dwudzielne łączące sąsiadujące przymiotniki, czasowniki i rzeczowniki.",
};

export default function FeatureCards({ tabs }: FeatureCardsProps) {
	return (
		<section className="grid gap-4 md:grid-cols-2">
			{tabs.map((tab) => (
				<div
					key={tab.id}
					className="card border border-info/10 bg-white/80 shadow-sm"
				>
					<div className="card-body">
						<h2 className="card-title text-lg text-info">
							{tab.label}
						</h2>
						<p className="text-sm text-base-content/70">
							{descriptions[tab.id]}
						</p>
					</div>
				</div>
			))}
		</section>
	);
}
