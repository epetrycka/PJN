import type { FrequencyEntry, FrequencyMetadata } from "../../../commons/types";

type FrequencySummaryProps = {
	metadata: FrequencyMetadata;
	totalEntries: number;
	filteredEntries: number;
	topEntry: FrequencyEntry | null;
};

const numberFormatter = new Intl.NumberFormat("pl-PL");
const percentFormatter = new Intl.NumberFormat("pl-PL", {
	style: "percent",
	minimumFractionDigits: 3,
	maximumFractionDigits: 3,
});

export default function FrequencySummary({
	metadata,
	totalEntries,
	filteredEntries,
	topEntry,
}: FrequencySummaryProps) {
	return (
		<section className="card border border-base-300 bg-base-100">
			<div className="card-body space-y-4">
				<div className="stats stats-vertical gap-3 md:stats-horizontal">
					<div className="stat">
						<div className="stat-title text-sm uppercase tracking-wide text-base-content/70">
							Łączna liczba tokenów
						</div>
						<div className="stat-value text-2xl text-primary">
							{numberFormatter.format(metadata.total_tokens)}
						</div>
						<div className="stat-desc">
							Korpus źródłowy:{" "}
							{numberFormatter.format(metadata.source_corpus_tokens)}{" "}
							tokenów
						</div>
					</div>
					<div className="stat">
						<div className="stat-title text-sm uppercase tracking-wide text-base-content/70">
							Unikalne słowa
						</div>
						<div className="stat-value text-2xl text-secondary">
							{numberFormatter.format(metadata.unique_words)}
						</div>
						<div className="stat-desc">
							Łącznie rekordów w tabeli:{" "}
							{numberFormatter.format(totalEntries)}
						</div>
					</div>
					<div className="stat">
						<div className="stat-title text-sm uppercase tracking-wide text-base-content/70">
							Bieżący widok
						</div>
						<div className="stat-value text-2xl">
							{numberFormatter.format(filteredEntries)}
						</div>
						<div className="stat-desc">
							Po zastosowaniu filtrów i sortowania
						</div>
					</div>
				</div>
				{topEntry ? (
					<div className="alert shadow-sm bg-fuchsia-600 text-white">
						<div>
							<h3 className="font-semibold">
								Najczęstsze słowo w korpusie
							</h3>
							<p className="text-sm text-white/90">
								<span className="font-semibold">{topEntry.word}</span>{" "}
								(z rangą #{topEntry.rank}) pojawia się{" "}
								{numberFormatter.format(topEntry.count)} razy, co
								stanowi około{" "}
								{percentFormatter.format(topEntry.relative_frequency)}{" "}
								wszystkich tokenów.
							</p>
						</div>
					</div>
				) : null}
			</div>
		</section>
	);
}
