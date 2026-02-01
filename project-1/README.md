# Projekt PJN — Statystyczna analiza języka portugalskiego

Nowoczesny projekt do analizy korpusu językowego i wizualizacji wyników w aplikacji webowej.

## Najważniejsze funkcje

- Tabela częstości wyrazów z wyszukiwaniem i sortowaniem.
- Analiza prawa Zipfa z metrykami dopasowania.
- Graf rdzenia języka (najsilniej powiązane słowa).
- Top 50 rzeczowników z tłumaczeniami.
- Analiza semantyczna: grafy dwudzielne przymiotnik–rzeczownik i czasownik–rzeczownik.

## Zakres zadania (zajęcia)

Projekt realizuje **zadanie 1** (analiza języka) oraz **zadanie 3** (analizy i wizualizacje oparte o grafy).

## Struktura projektu

- [apps/backend](apps/backend) — pipeline przetwarzania danych i generowanie JSON‑ów.
- [apps/frontend](apps/frontend) — aplikacja React + Vite + Tailwind + DaisyUI.
- [img](img) — zrzuty ekranu użyte w README.

## Dane wejściowe i wyjściowe

Wyniki przetwarzania zapisywane są w [apps/backend/data/processed](apps/backend/data/processed),
a następnie kopiowane do [apps/frontend/src/data](apps/frontend/src/data), skąd korzysta UI.

## Uruchomienie backendu (pipeline)

1. Przejdź do katalogu backendu:

```bash
cd apps/backend
```

2. Uruchom pełny pipeline (generuje dane i kopiuje je do frontendu):

```bash
uv run python run_pipeline.py
```

> Wymagania Python znajdują się w [apps/backend/pyproject.toml](apps/backend/pyproject.toml).

## Uruchomienie frontendu

1. Przejdź do katalogu frontendu:

```bash
cd apps/frontend
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Start w trybie developerskim:

```bash
npm run dev
```

Aplikacja działa domyślnie pod adresem http://localhost:5173.

## Build produkcyjny

```bash
npm run build
npm run preview
```

## Wskazówki

- Jeśli dane nie odświeżają się w UI, uruchom ponownie pipeline backendu.
- Projekt zakłada korpus portugalski; filtry usuwają pojedyncze litery i szum.

---

Jeśli chcesz dodać nowe metryki lub rozbudować UI, daj znać — dopasuję architekturę i styling.
