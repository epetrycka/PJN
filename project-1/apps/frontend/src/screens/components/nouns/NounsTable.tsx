type NounEntry = {
  rank: number;
  word: string;
  count: number;
  translation_pl?: string;
  translation_en?: string;
};

const numberFormatter = new Intl.NumberFormat("pl-PL");

type Props = {
  entries: NounEntry[];
};

export default function NounsTable({ entries }: Props) {
  if (!entries || entries.length === 0) {
    return (
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Ranga</th>
            <th>Słowo</th>
            <th className="text-right">Liczba</th>
            <th>Tłumaczenie (PL)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4} className="py-10 text-center text-base-content/70">
              Brak danych do wyświetlenia.
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="table table-zebra">
      <thead>
        <tr>
          <th>Ranga</th>
          <th>Słowo</th>
          <th className="text-right">Liczba</th>
          <th>Tłumaczenie (PL)</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, index) => (
          <tr key={`${e.rank}-${e.word}`}>
            <td>#{index + 1}</td>
            <td className="font-semibold">{e.word}</td>
            <td className="text-right">{numberFormatter.format(e.count)}</td>
            <td>{e.translation_pl ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
