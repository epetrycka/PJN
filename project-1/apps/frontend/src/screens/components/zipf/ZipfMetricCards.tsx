import type { ZipfMetadata } from "../../../commons/types";

type ZipfMetricCardsProps = {
	metadata: ZipfMetadata;
};

const numberFormatter = new Intl.NumberFormat("pl-PL");

export default function ZipfMetricCards({ metadata }: ZipfMetricCardsProps) {
	return (
		<div className="stats stats-vertical lg:stats-horizontal w-full">
			<div className="stat rounded-box border border-base-300 bg-base-100 px-4 py-3">
				<div className="stat-title text-xs uppercase tracking-wide text-base-content/60">
					Punkty wykresu
				</div>
				<div className="stat-value text-2xl font-semibold">
					{numberFormatter.format(metadata.points_count)}
				</div>
				<div className="stat-desc text-sm text-base-content/70">
					Każdy punkt odpowiada rangi i częstości wyrazu.
				</div>
			</div>
			<div className="stat rounded-box border border-base-300 bg-base-100 px-4 py-3">
				<div className="stat-title text-xs uppercase tracking-wide text-base-content/60">
					Współczynnik kierunku
				</div>
				<div className="stat-value text-2xl font-semibold">
					{metadata.slope.toFixed(3)}
				</div>
				<div className="stat-desc text-sm text-base-content/70">
					Im bardziej ujemny, tym silniejsza zależność Zipfa.
				</div>
			</div>
			<div className="stat rounded-box border border-base-300 bg-base-100 px-4 py-3">
				<div className="stat-title text-xs uppercase tracking-wide text-base-content/60">
					Przecięcie
				</div>
				<div className="stat-value text-2xl font-semibold">
					{metadata.intercept.toFixed(3)}
				</div>
				<div className="stat-desc text-sm text-base-content/70">
					Logarytm oczekiwanej częstości dla rzędu 1.
				</div>
			</div>
		</div>
	);
}
