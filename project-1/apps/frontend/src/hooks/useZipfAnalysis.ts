import { useEffect, useState } from "react";
import type { ZipfMetadata, ZipfPoint, ZipfResponse } from "../commons/types";

const zipfDataUrl = new URL("../data/zipf_analysis.json", import.meta.url).toString();

type UseZipfAnalysisResult = {
	data: ZipfPoint[] | null;
	metadata: ZipfMetadata | null;
	isLoading: boolean;
	error: string | null;
};

export default function useZipfAnalysis(): UseZipfAnalysisResult {
	const [data, setData] = useState<ZipfPoint[] | null>(null);
	const [metadata, setMetadata] = useState<ZipfMetadata | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		async function loadZipfData() {
			try {
				setIsLoading(true);

				const response = await fetch(zipfDataUrl, {
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error(
						`Nie udało się pobrać danych (${response.status})`
					);
				}

				const payload = (await response.json()) as ZipfResponse;
				setData(payload.points);
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

		void loadZipfData();

		return () => controller.abort();
	}, []);

	return { data, metadata, isLoading, error };
}
