type FrequencyToolbarProps = {
	searchTerm: string;
	onSearchTermChange: (value: string) => void;
	pageSize: number;
	onPageSizeChange: (value: number) => void;
	pageSizeOptions: number[];
	filteredCount: number;
	onReset: () => void;
	isFiltered: boolean;
};

const numberFormatter = new Intl.NumberFormat("pl-PL");

export default function FrequencyToolbar({
	searchTerm,
	onSearchTermChange,
	pageSize,
	onPageSizeChange,
	pageSizeOptions,
	filteredCount,
	onReset,
	isFiltered,
}: FrequencyToolbarProps) {
	return (
		<section className="card border border-base-300 bg-base-100">
			<div className="card-body space-y-4">
				<div className="grid gap-4 md:grid-cols-2">
					<label className="form-control w-full">
						<div className="label mr-2">
							<span className="label-text font-semibold">
								Szukaj słowa
							</span>
						</div>
						<input
							type="text"
							value={searchTerm}
							onChange={(event) =>
								onSearchTermChange(event.target.value)
							}
							placeholder="np. język, analiza, dane..."
							className="input input-bordered"
						/>
					</label>
					<label className="form-control w-full md:max-w-xs">
						<div className="label">
							<span className="label-text font-semibold">
								Wiersze na stronę
							</span>
						</div>
						<select
							className="select select-bordered"
							value={pageSize}
							onChange={(event) =>
								onPageSizeChange(Number(event.target.value))
							}
						>
							{pageSizeOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>
				</div>
				<div className="flex flex-col gap-3 text-sm text-base-content/70 md:flex-row md:items-center md:justify-between">
					<p>
						Pasujących rekordów:{" "}
						<span className="font-semibold text-base-content">
							{numberFormatter.format(filteredCount)}
						</span>
					</p>
					<button
						type="button"
						className="btn btn-sm btn-outline self-start md:self-auto"
						onClick={onReset}
						disabled={!isFiltered}
					>
						Wyczyść ustawienia
					</button>
				</div>
			</div>
		</section>
	);
}
