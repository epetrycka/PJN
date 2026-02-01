import ZipfChart from "./ZipfChart";
import ZipfMetricCards from "./ZipfMetricCards";
import ZipfSampleTable from "./ZipfSampleTable";
import useZipfAnalysis from "../../../hooks/useZipfAnalysis";

export default function ZipfTab() {
	const { data, metadata, isLoading, error } = useZipfAnalysis();

	if (isLoading) {
		return (
			<section className="card border border-base-300 bg-base-100">
				<div className="card-body items-center justify-center gap-3 text-center">
					<span className="loading loading-spinner loading-md text-primary" />
					<p className="text-sm text-base-content/70">
						Analizuję rozkład częstości dla prawa Zipfa...
					</p>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="alert alert-error">
				<div>
					<h3 className="font-semibold">Błąd wczytywania danych</h3>
					<p className="text-sm">{error}</p>
				</div>
			</section>
		);
	}

	if (!data || !metadata) {
		return null;
	}

	const samplePoints = data.slice(0, 12);

	return (
		<section className="space-y-6">
			<ZipfMetricCards metadata={metadata} />

			<div className="card border border-base-300 bg-base-100">
				<div className="card-body space-y-4">
					<div className="space-y-1">
						<h2 className="card-title">Wykres log-log</h2>
						<p className="text-sm text-base-content/70">
							Punkty pokazują zależność logarytmicznego rzędu od logarytmicznej
							częstości, a czerwona linia to dopasowanie regresji z metadanych.
						</p>
					</div>
					<ZipfChart points={data} metadata={metadata} />
					<p className="text-xs uppercase tracking-wide text-base-content/60">
						Współczynnik determinacji: {metadata.r_squared.toFixed(3)}
					</p>
				</div>
			</div>

			<ZipfSampleTable points={samplePoints} metadata={metadata} />
		</section>
	);
}
