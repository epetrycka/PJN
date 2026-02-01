import type {
	FrequencyEntry,
	FrequencySortKey,
} from "../../../commons/types";

type FrequencyTableProps = {
	entries: FrequencyEntry[];
	sort: { key: FrequencySortKey; direction: "asc" | "desc" };
	onSortChange: (key: FrequencySortKey) => void;
	isFiltered: boolean;
};

const numberFormatter = new Intl.NumberFormat("pl-PL");
const percentFormatter = new Intl.NumberFormat("pl-PL", {
	style: "percent",
	minimumFractionDigits: 3,
	maximumFractionDigits: 3,
});

const columns: Array<{
	key: FrequencySortKey;
	label: string;
	align?: "text-left" | "text-right";
}> = [
	{ key: "rank", label: "Ranga" },
	{ key: "word", label: "Słowo" },
	{ key: "count", label: "Liczba wystąpień", align: "text-right" },
	{
		key: "relative_frequency",
		label: "Częstość względna",
		align: "text-right",
	},
];

export default function FrequencyTable({
	entries,
	sort,
	onSortChange,
	isFiltered,
}: FrequencyTableProps) {
	const emptyMessage = isFiltered
		? "Brak wyników spełniających aktualne filtry."
		: "Brak danych do wyświetlenia.";

	return (
		<table className="table table-zebra">
			<thead>
				<tr>
					{columns.map((column) => {
						const isActive = column.key === sort.key;
						const indicator = isActive
							? sort.direction === "asc"
								? "^"
								: "v"
							: "";

						return (
							<th
								key={column.key}
								className={column.align ?? "text-left"}
							>
								<button
									type="button"
									onClick={() => onSortChange(column.key)}
									className={`flex items-center gap-1 text-sm font-semibold uppercase tracking-wide ${
										column.align === "text-right"
											? "justify-end"
											: "justify-start"
									}`}
								>
									<span>{column.label}</span>
									{indicator ? (
										<span className="text-xs text-base-content/70">
											{indicator}
										</span>
									) : null}
								</button>
							</th>
						);
					})}
				</tr>
			</thead>
			<tbody>
				{entries.length === 0 ? (
					<tr>
						<td
							colSpan={columns.length}
							className="py-10 text-center text-base-content/70"
						>
							{emptyMessage}
						</td>
					</tr>
				) : (
					entries.map((entry) => (
						<tr key={`${entry.rank}-${entry.word}`}>
							<td>#{entry.rank}</td>
							<td className="font-semibold">{entry.word}</td>
							<td className="text-right">
								{numberFormatter.format(entry.count)}
							</td>
							<td className="text-right">
								{percentFormatter.format(
									entry.relative_frequency
								)}
							</td>
						</tr>
					))
				)}
			</tbody>
		</table>
	);
}
