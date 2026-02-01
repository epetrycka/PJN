import type { FeatureTab } from "../../commons/types";
import FrequencyTab from "./frequency/FrequencyTab";
import ZipfTab from "./zipf/ZipfTab";
import CoreTab from "./core/CoreTab";
import NounsTab from "./nouns/NounsTab";
import SemanticTab from "./semantic/SemanticTab";

type FeaturePanelProps = {
	activeTab: FeatureTab;
};

const details: Record<FeatureTab["id"], string[]> = {
	frequency: [
		"Tabela częstotliwości wyrazów z sortowaniem malejącym.",
		"Podsumowanie liczby unikalnych wyrazów i całkowitej liczby tokenów.",
	],
	zipf: [
		"Wykres log-log dla rang i częstotliwości.",
		"Metryka dopasowania do prawa Zipfa.",
	],
	core: [
		"Graf z node'ami ustawionymi na okręgu.",
		"Wyróżnienie słów o największej liczbie połączeń.",
	],
	nouns: [
		"Top 50 rzeczowników w tekście.",
		"Tłumaczenia na język polski.",
	],
	semantic: [
		"Grafy dwudzielne: przymiotnik-rzeczownik i czasownik-rzeczownik.",
		"Lista połączeń dla wybranego węzła z kolorową skalą częstości.",
	],
};

export default function FeaturePanel({ activeTab }: FeaturePanelProps) {
	if (activeTab.id === "frequency") {
		return <FrequencyTab />;
	}

	if (activeTab.id === "zipf") {
		return <ZipfTab />;
	}

	if (activeTab.id === "core") {
		return <CoreTab />;
	}

	if (activeTab.id === "nouns") {
		return <NounsTab />;
	}

	if (activeTab.id === "semantic") {
		return <SemanticTab />;
	}

	return (
		<section className="card border border-base-300 bg-base-100">
			<div className="card-body space-y-3">
				<h2 className="card-title">{activeTab.label}</h2>
				<p className="text-sm text-base-content/80">
					Opis funkcjonalności planowanej do realizacji w tej sekcji.
				</p>
				<ul className="list-disc space-y-1 pl-5 text-sm text-base-content/80">
					{details[activeTab.id].map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</div>
		</section>
	);
}
