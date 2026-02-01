import type { FeatureTab } from "../../commons/types";
import FrequencyTab from "./frequency/FrequencyTab";
import ZipfTab from "./zipf/ZipfTab";
import CoreTab from "./core/CoreTab";
import NounsTab from "./nouns/NounsTab";
import SemanticTab from "./semantic/SemanticTab";

type FeaturePanelProps = {
	activeTab: FeatureTab;
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

	return null;
}
