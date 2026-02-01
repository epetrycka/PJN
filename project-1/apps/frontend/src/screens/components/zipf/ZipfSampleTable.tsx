import type { ZipfMetadata, ZipfPoint } from "../../../../commons/types";

type ZipfSampleTableProps = {
	points: ZipfPoint[];
	metadata: ZipfMetadata;
};

const numberFormatter = new Intl.NumberFormat("pl-PL", {
	maximumFractionDigits: 0,
});

function formatPredicted(point: ZipfPoint, metadata: ZipfMetadata) {
	const logPredicted = metadata.slope * point.log_rank + metadata.intercept;
	return Math.exp(logPredicted);
}

export default function ZipfSampleTable({
	points,
	metadata,
}: ZipfSampleTableProps) {
	if (!points.length) {
		return null;
	}

	return (
		<div className="card border border-base-300 bg-base-100">
			<div className="card-body space-y-4">
				<div className="space-y-1">
					<h3 className="card-title text-base">Porównanie częstotliwości</h3>
					<p className="text-sm text-base-content/70">
						Porównuję rzeczywistą częstość z przewidywaną wartością z modelu
						Zipfa oraz pokazuję stosunek modelu do obserwacji.
					</p>
				</div>
				<div className="overflow-x-auto">
					<table className="table w-full table-zebra text-sm">
						<thead>
							<tr>
								<th>Ranga</th>
								<th>Wyraz</th>
								<th>Częstość</th>
								<th>Model</th>
								<th>Stosunek</th>
							</tr>
						</thead>
						<tbody>
							{points.map((point) => {
								const predicted = formatPredicted(point, metadata);
								const ratio = point.frequency / predicted;

								return (
									<tr key={`${point.rank}-${point.word}`}>
										<td>{point.rank}</td>
										<td>{point.word}</td>
										<td>{numberFormatter.format(point.frequency)}</td>
										<td>{numberFormatter.format(predicted)}</td>
										<td className="text-xs text-base-content/70">
											{ratio.toFixed(2)}×
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
