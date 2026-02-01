export default function IntroSection() {
	return (
		<section className="space-y-4">
			<div className="space-y-3">
				<p className="text-xs uppercase tracking-[0.3em] text-info">
					Analiza językowa
				</p>
				<h1 className="text-3xl font-semibold sm:text-4xl">
					Statystyczna analiza języka portugalskiego
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-base-content/70">
					Aplikacja podsumowuje rozkład częstości, prawo Zipfa oraz rdzeń
					języka, a także pokazuje relacje semantyczne między słowami.
				</p>
			</div>
			<div className="flex flex-wrap gap-2">
				<span className="badge badge-info badge-outline">portugalski 🇵🇹</span>
				<span className="badge badge-primary badge-outline">
					korpus 100k tokenów
				</span>
				<span className="badge badge-accent badge-outline">
					wizualizacje i metryki
				</span>
			</div>
		</section>
	);
}
