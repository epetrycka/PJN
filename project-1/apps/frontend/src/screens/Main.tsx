import { useMemo, useState } from "react";
import PageContainer from "../commons/PageContainer";
import type { FeatureTab } from "../commons/types";
import FeatureCards from "./components/FeatureCards";
import FeaturePanel from "./components/FeaturePanel";
import IntroSection from "./components/IntroSection";
import NavTabs from "./components/NavTabs";

const tabs: FeatureTab[] = [
	{ id: "frequency", label: "Tabela częstości wyrazów" },
	{ id: "zipf", label: "Prawo Zipfa" },
	{ id: "core", label: "Rdzeń języka" },
	{ id: "nouns", label: "Top 50 rzeczowników" },
	{ id: "semantic", label: "Analiza semantyczna" },
];

export default function Main() {
	const [activeId, setActiveId] = useState<FeatureTab["id"] | "home">("home");

	const activeTab = useMemo(
		() => tabs.find((tab) => tab.id === activeId) ?? tabs[0],
		[activeId]
	);

	const isHomeActive = activeId === "home";
	const activeTabId = isHomeActive ? null : activeId;

	return (
		<PageContainer>
			<div className="grid gap-6 lg:grid-cols-[280px_1fr]">
				<NavTabs
					tabs={tabs}
					activeId={activeTabId}
					onChange={setActiveId}
					onHome={() => setActiveId("home")}
					isHomeActive={isHomeActive}
				/>
				<div className="space-y-6">
					<div className="app-card rounded-3xl p-6">
						{isHomeActive ? (
							<>
								<IntroSection />
								<FeatureCards tabs={tabs} />
							</>
						) : (
							<FeaturePanel activeTab={activeTab} />
						)}
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
