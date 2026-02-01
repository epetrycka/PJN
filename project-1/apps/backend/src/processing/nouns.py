import argparse
from functools import lru_cache
from typing import Dict

from deep_translator import GoogleTranslator

from common import (
    MANUAL_ALLOW,
    MANUAL_BLOCK,
    STOPWORDS,
    load_or_build_frequency,
    nouns_path,
    write_json,
)

TRANSLATION_SOURCE_LANGUAGE = "pt"
TRANSLATION_TARGETS = ("pl", "en")


@lru_cache(maxsize=None)
def _translator(target_lang: str) -> GoogleTranslator:
    try:
        return GoogleTranslator(source=TRANSLATION_SOURCE_LANGUAGE, target=target_lang)
    except Exception as exc:  # pragma: no cover - network/service dependency
        raise RuntimeError(
            f"Nie udało się zainicjować tłumacza dla języka docelowego '{target_lang}'."
        ) from exc


def translate_word(word: str) -> Dict[str, str]:
    translations: Dict[str, str] = {}
    for target in TRANSLATION_TARGETS:
        try:
            translations[target] = _translator(target).translate(word)
        except Exception as exc:  # pragma: no cover - network/service dependency
            translations[target] = ""
            print(
                f"[WARN] Nie udało się przetłumaczyć '{word}' na '{target}': {exc}",
                flush=True,
            )
    return translations

NOUN_SUFFIXES = (
    "a",
    "á",
    "e",
    "é",
    "i",
    "í",
    "o",
    "u",
    "ů",
    "y",
    "ý",
    "ost",
    "ace",
    "ce",
    "ka",
    "ek",
    "ník",
    "tel",
    "ice",
    "ita",
    "ismus",
    "ista",
    "arium",
    "izace",
    "átor",
    "ista",
    "ment",
    "nost",
)

VOWELS = set("aeiouáéíóúâêôãõàü")




def looks_like_noun(word: str) -> bool:
    if not word.isalpha():
        return False
    if word in MANUAL_ALLOW:
        return True
    if word in MANUAL_BLOCK:
        return False
    if word in STOPWORDS:
        return False
    if len(word) < 3:
        return False
    if len(word) < 3:
        return False
    if not any(ch in VOWELS for ch in word):
        return False
    for suffix in NOUN_SUFFIXES:
        if word.endswith(suffix):
            return True
    return False


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Wyszukuje pierwsze N rzeczowników i dodaje tłumaczenia."
    )
    parser.add_argument("--limit", type=int, default=50)
    args = parser.parse_args()

    frequency_payload = load_or_build_frequency()
    nouns = []
    for entry in frequency_payload["data"]:
        word = entry["word"]
        if looks_like_noun(word):
            translation = translate_word(word)
            nouns.append(
                {
                    "rank": entry["rank"],
                    "word": word,
                    "count": entry["count"],
                    "translation_pl": translation.get("pl", ""),
                    "translation_en": translation.get("en", ""),
                }
            )
        if len(nouns) >= args.limit:
            break

    payload = {
        "metadata": {
            "limit": args.limit,
            "source_total_tokens": frequency_payload["metadata"]["total_tokens"],
        },
        "data": nouns,
    }

    path = nouns_path()
    write_json(path, payload)
    print(f"Rzeczowniki ({len(nouns)} pozycji) -> {path}")


if __name__ == "__main__":
    main()
