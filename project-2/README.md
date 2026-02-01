# Projekt 2 — Generator zdań (zadanie 2)

Aplikacja webowa oparta o Flask do składania poprawnych zdań w języku angielskim w modelu **SVO (Subject–Verb–Object)**.

> **Zakres zajęć:** projekt realizuje **zadanie 2**.

![Podgląd aplikacji](img/main.png)

## Co robi aplikacja

- Składa zdania po angielsku na podstawie wybranych elementów (S, V, O).
- Obsługuje tryby i czasy (m.in. present, past, future, perfect, continuous).
- Dobiera rodzajniki i odmianę czasownika.

## Wymagania

- Python 3.10+
- (opcjonalnie) GNU Make

## Szybki start

```bash
make install
make run
```

Aplikacja działa pod adresem http://127.0.0.1:5000.

## Uruchomienie bez Makefile

```bash
python -m venv .venv
.\.venv\Scripts\pip install -U pip
.\.venv\Scripts\pip install -e .
.\.venv\Scripts\python app.py
```

## Tryb developerski (Flask)

```bash
make dev
```

## API

### POST /generate

```bash
curl -X POST http://127.0.0.1:5000/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"subject_noun\":\"cat\",\"subject_number\":\"singular\",\
  \"verb\":\"eat\",\"object_noun\":\"apple\",\
  \"object_number\":\"singular\",\"tense\":\"present\",\
  \"mode\":\"affirmative\"}"
```

Przykładowa odpowiedź:

```json
{"sentence":"The cat eats an apple."}
```

## Struktura projektu

- app.py — główna aplikacja Flask i routing
- engine.py — logika składania zdania i odmiany czasowników
- data.py — dane wejściowe (czasowniki, rzeczowniki, przymiotniki)
- templates/ — szablony HTML
- static/ — CSS i JS

## Makefile

- make install — tworzy venv i instaluje zależności
- make run — uruchamia aplikację
- make dev — tryb developerski Flask
- make clean — usuwa środowisko wirtualne
