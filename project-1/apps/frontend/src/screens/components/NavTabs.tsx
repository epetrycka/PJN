import type { FeatureTab } from "../../commons/types";

type NavTabsProps = {
	tabs: FeatureTab[];
	activeId: FeatureTab["id"] | null;
	onChange: (id: FeatureTab["id"]) => void;
	onHome: () => void;
	isHomeActive: boolean;
};

export default function NavTabs({
	tabs,
	activeId,
	onChange,
	onHome,
	isHomeActive,
}: NavTabsProps) {
	return (
		<aside className="app-sidebar rounded-3xl p-5">
			<div className="space-y-4">
				<button
					type="button"
					className={`app-pill btn w-full justify-start gap-2 rounded-full border-0 text-left text-sm font-semibold tracking-wide shadow-sm ${
						isHomeActive ? "btn-active" : ""
					}`}
					onClick={onHome}
				>
					Analiza statystyczna języka
				</button>
				<div className="space-y-2">
					<p className="text-xs uppercase tracking-[0.2em] text-base-content/50">
						Sekcje
					</p>
					<div className="space-y-2">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								type="button"
								className={`btn w-full justify-start rounded-2xl border border-transparent bg-white/70 text-sm font-medium shadow-sm transition hover:bg-white ${
									activeId === tab.id
										? "border-info/40 bg-white"
										: ""
								}`}
								onClick={() => onChange(tab.id)}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>
			</div>
		</aside>
	);
}
