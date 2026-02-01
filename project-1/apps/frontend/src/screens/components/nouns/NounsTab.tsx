import NounsTable from "./NounsTable";
import useNouns from "../../../hooks/useNouns";

export default function NounsTab() {
  const { data, isLoading, error } = useNouns();

  if (isLoading) {
    return (
      <section className="card border border-base-300 bg-base-100">
        <div className="card-body items-center justify-center gap-3 text-center">
          <span className="loading loading-spinner loading-md text-primary" />
          <p className="text-sm text-base-content/70">Ładuję listę rzeczowników...</p>
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

  return (
    <section className="card border border-base-300 bg-base-100">
      <div className="card-body space-y-4 overflow-x-auto">
        <h2 className="card-title">Top 50 rzeczowników</h2>
        <NounsTable entries={data ?? []} />
      </div>
    </section>
  );
}
