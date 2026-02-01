import { useMemo, useState } from "react";
import type {
	FrequencyEntry,
	FrequencySortKey,
} from "../../../commons/types";
import useFrequencyTable from "../../../hooks/useFrequencyTable";
import FrequencyPagination from "./FrequencyPagination";
import FrequencySummary from "./FrequencySummary";
import FrequencyTable from "./FrequencyTable";
import FrequencyToolbar from "./FrequencyToolbar";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

type SortDirection = "asc" | "desc";

type SortState = {
	key: FrequencySortKey;
	direction: SortDirection;
};

const collator = new Intl.Collator("pl", { sensitivity: "base" });

const getDefaultSortState = (): SortState => ({
	key: "rank",
	direction: "asc",
});

function sortEntries(
	values: FrequencyEntry[],
	sort: SortState
): FrequencyEntry[] {
	if (!values.length) {
		return values;
	}

	const sorted = [...values];
	const direction = sort.direction === "asc" ? 1 : -1;

	sorted.sort((a, b) => {
		switch (sort.key) {
			case "word":
				return collator.compare(a.word, b.word) * direction;
			case "count":
				if (a.count === b.count) {
					return (a.rank - b.rank) * direction;
				}
				return (a.count - b.count) * direction;
			case "relative_frequency":
				if (a.relative_frequency === b.relative_frequency) {
					return (a.rank - b.rank) * direction;
				}
				return (a.relative_frequency - b.relative_frequency) * direction;
			case "rank":
			default:
				return (a.rank - b.rank) * direction;
		}
	});

	return sorted;
}

export default function FrequencyTab() {
	const { data, metadata, isLoading, error } = useFrequencyTable();
	const [searchTerm, setSearchTerm] = useState("");
	const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState<SortState>(() => getDefaultSortState());

	const normalizedSearch = useMemo(
		() => searchTerm.trim().toLowerCase(),
		[searchTerm]
	);

	const filteredEntries = useMemo(() => {
		if (!data) {
			return [];
		}

		if (!normalizedSearch) {
			return data;
		}

		return data.filter((entry) =>
			entry.word.toLowerCase().includes(normalizedSearch)
		);
	}, [data, normalizedSearch]);

	const sortedEntries = useMemo(
		() => sortEntries(filteredEntries, sort),
		[filteredEntries, sort]
	);

	const totalPages = Math.max(1, Math.ceil(sortedEntries.length / pageSize));
	const currentPage = Math.min(page, totalPages);

	const paginatedEntries = useMemo(() => {
		const startIndex = (currentPage - 1) * pageSize;
		return sortedEntries.slice(startIndex, startIndex + pageSize);
	}, [sortedEntries, currentPage, pageSize]);

	const hasEntries = paginatedEntries.length > 0;
	const rangeStart = hasEntries ? (currentPage - 1) * pageSize + 1 : 0;
	const rangeEnd = hasEntries
		? rangeStart + paginatedEntries.length - 1
		: 0;

	const handleSortChange = (key: FrequencySortKey) => {
		setSort((prev) => {
			if (prev.key === key) {
				return {
					key,
					direction: prev.direction === "asc" ? "desc" : "asc",
				};
			}

			const defaultDirection: SortDirection =
				key === "word" || key === "rank" ? "asc" : "desc";

			return { key, direction: defaultDirection };
		});
		setPage(1);
	};

	const handlePageChange = (nextPage: number) => {
		const clamped = Math.min(Math.max(nextPage, 1), totalPages);
		setPage(clamped);
	};

	const handleSearchChange = (value: string) => {
		setSearchTerm(value);
		setPage(1);
	};

	const handlePageSizeChange = (value: number) => {
		setPageSize(value);
		setPage(1);
	};

	const handleResetFilters = () => {
		setSearchTerm("");
		setSort(getDefaultSortState());
		setPageSize(PAGE_SIZE_OPTIONS[1]);
		setPage(1);
	};

	if (isLoading) {
		return (
			<section className="card border border-base-300 bg-base-100">
				<div className="card-body items-center justify-center gap-3 text-center">
					<span className="loading loading-spinner loading-md text-primary" />
					<p className="text-sm text-base-content/70">
						Ładuję tabelę częstości słów...
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

	const topEntry = data[0] ?? null;

	return (
		<section className="space-y-6">
			<FrequencySummary
				metadata={metadata}
				totalEntries={data.length}
				filteredEntries={filteredEntries.length}
				topEntry={topEntry}
			/>
			<FrequencyToolbar
				searchTerm={searchTerm}
				onSearchTermChange={handleSearchChange}
				pageSize={pageSize}
				onPageSizeChange={handlePageSizeChange}
				pageSizeOptions={PAGE_SIZE_OPTIONS}
				filteredCount={filteredEntries.length}
				onReset={handleResetFilters}
				isFiltered={
					Boolean(normalizedSearch) ||
					filteredEntries.length !== data.length ||
					sort.key !== "rank" ||
					sort.direction !== "asc" ||
					pageSize !== PAGE_SIZE_OPTIONS[1]
				}
			/>
			<div className="card border border-base-300 bg-base-100">
				<div className="card-body space-y-4 overflow-x-auto">
					<FrequencyTable
						entries={paginatedEntries}
						sort={sort}
						onSortChange={handleSortChange}
						isFiltered={Boolean(normalizedSearch)}
					/>
					<FrequencyPagination
						page={currentPage}
						totalPages={totalPages}
						rangeStart={rangeStart}
						rangeEnd={rangeEnd}
						totalItems={sortedEntries.length}
						onPageChange={handlePageChange}
					/>
				</div>
			</div>
		</section>
	);
}
