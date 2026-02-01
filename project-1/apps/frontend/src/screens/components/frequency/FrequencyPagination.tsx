type FrequencyPaginationProps = {
	page: number;
	totalPages: number;
	rangeStart: number;
	rangeEnd: number;
	totalItems: number;
	onPageChange: (page: number) => void;
};

const numberFormatter = new Intl.NumberFormat("pl-PL");

export default function FrequencyPagination({
	page,
	totalPages,
	rangeStart,
	rangeEnd,
	totalItems,
	onPageChange,
}: FrequencyPaginationProps) {
	const hasNoData = totalItems === 0;

	return (
		<div className="flex flex-col gap-3 text-sm text-base-content/70 md:flex-row md:items-center md:justify-between">
			<p>
				Wyświetlane rekordy:{" "}
				<span className="font-semibold text-base-content">
					{hasNoData
						? "0"
						: `${numberFormatter.format(rangeStart)} - ${numberFormatter.format(
								rangeEnd
						  )}`}
				</span>{" "}
				z{" "}
				<span className="font-semibold text-base-content">
					{numberFormatter.format(totalItems)}
				</span>
			</p>
			<div className="join self-start md:self-auto">
				<button
					type="button"
					className="btn btn-sm join-item"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1 || hasNoData}
				>
					Poprzednia
				</button>
				<span className="btn btn-sm join-item btn-ghost no-animation cursor-default">
					Strona {numberFormatter.format(page)} /{" "}
					{numberFormatter.format(totalPages)}
				</span>
				<button
					type="button"
					className="btn btn-sm join-item"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages || hasNoData}
				>
					Następna
				</button>
			</div>
		</div>
	);
}
