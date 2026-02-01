import { useEffect, useState } from "react";
import type {
	FrequencyEntry,
	FrequencyMetadata,
	FrequencyResponse,
} from "../commons/types";

const frequencyTableUrl = new URL(
	"../data/frequency_table.json",
	import.meta.url
).toString();

type UseFrequencyTableResult = {
	data: FrequencyEntry[] | null;
	metadata: FrequencyMetadata | null;
	isLoading: boolean;
	error: string | null;
};

export default function useFrequencyTable(): UseFrequencyTableResult {
	const [data, setData] = useState<FrequencyEntry[] | null>(null);
	const [metadata, setMetadata] = useState<FrequencyMetadata | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		async function loadFrequencyTable() {
			try {
				setIsLoading(true);
				const response = await fetch(frequencyTableUrl, {
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error(
						`Nie udało się pobrać danych (${response.status})`
					);
				}

				const payload = (await response.json()) as FrequencyResponse;
				setData(payload.data);
				setMetadata(payload.metadata);
				setError(null);
			} catch (err) {
				if ((err as Error).name === "AbortError") {
					return;
				}
				setError(
					(err as Error).message ??
						"Wystąpił błąd podczas ładowania danych"
				);
			} finally {
				setIsLoading(false);
			}
		}

		void loadFrequencyTable();

		return () => controller.abort();
	}, []);

	return { data, metadata, isLoading, error };
}
