import argparse
import json
from collections import Counter
from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, Iterable, Iterator, List, Optional, Tuple

import stanza

from common import NDJSON_FILES, TARGET_TOKEN_COUNT, html_to_text, semantic_path, write_json

POS_ADJ = "ADJ"
POS_NOUN = "NOUN"
POS_VERB = "VERB"
POS_AUX = "AUX"

ADJ_VERB_POS = {POS_ADJ, POS_VERB, POS_AUX}
NOUN_POS = {POS_NOUN}

SEMANTIC_BLOCKLIST = {
    "c",
    "km",
    "wikipedia",
}


@lru_cache(maxsize=1)
def _pipeline() -> stanza.Pipeline:
    try:
        return stanza.Pipeline(
            "pt",
            processors="tokenize,pos,lemma",
            use_gpu=False,
            verbose=True,
        )
    except Exception as exc:  # pragma: no cover - runtime dependency
        raise RuntimeError(
            "Nie udało się zainicjalizować Stanza. "
            "Upewnij się, że modele są pobrane (stanza.download('pt'))."
        ) from exc


def _normalize_lemma(lemma: Optional[str]) -> Optional[str]:
    if not lemma:
        return None
    if lemma.startswith("http") or lemma.startswith("www") or "/" in lemma:
        return None
    token = lemma.strip("_'\"-").lower()
    if not token:
        return None
    if any(ch.isdigit() for ch in token):
        return None
    if not all(ch.isalpha() or ch in {"-", "'"} for ch in token):
        return None
    if not any(ch.isalpha() for ch in token):
        return None
    if len(token) < 2:
        return None
    
    # Ignore Korean chars
    if any(0xAC00 <= ord(ch) <= 0xD7A3 for ch in token):
        return None
    
    # Ignore LaTeX artifacts
    if token.startswith("{") or token.startswith("\\") or "displaystyle" in token:
        return None

    if token in SEMANTIC_BLOCKLIST:
        return None

    return token


@dataclass
class TaggedToken:
    lemma: str
    pos: str


def iter_tagged_tokens(target_tokens: int) -> Iterator[TaggedToken]:
    pipeline = _pipeline()
    total_tokens = 0
    for ndjson_file in NDJSON_FILES:
        with ndjson_file.open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                try:
                    payload = json.loads(line)
                except json.JSONDecodeError:
                    continue
                html = payload.get("article_body", {}).get("html")
                if not html:
                    continue
                text = html_to_text(html)
                if not text:
                    continue
                doc = pipeline(text)
                for sentence in doc.sentences:
                    for word in sentence.words:
                        lemma = _normalize_lemma(word.lemma)
                        if not lemma or not word.upos:
                            continue
                        yield TaggedToken(lemma=lemma, pos=word.upos)
                        total_tokens += 1
                        if total_tokens >= target_tokens:
                            return


def select_top(counter: Counter[str], limit: int) -> List[Tuple[str, int]]:
    return counter.most_common(limit)


def collect_bipartite(target_tokens: int) -> dict:
    noun_counts: Counter[str] = Counter()
    adj_counts: Counter[str] = Counter()
    verb_counts: Counter[str] = Counter()
    adj_noun_edges: Counter[Tuple[str, str]] = Counter()
    verb_noun_edges: Counter[Tuple[str, str]] = Counter()

    total_tokens = 0
    previous: Optional[TaggedToken] = None

    for token in iter_tagged_tokens(target_tokens):
        total_tokens += 1
        if token.pos in NOUN_POS:
            noun_counts[token.lemma] += 1
        if token.pos == POS_ADJ:
            adj_counts[token.lemma] += 1
        if token.pos in (POS_VERB, POS_AUX):
            verb_counts[token.lemma] += 1

        if previous:
            if previous.pos in NOUN_POS and token.pos == POS_ADJ:
                adj_noun_edges[(token.lemma, previous.lemma)] += 1
            elif previous.pos == POS_ADJ and token.pos in NOUN_POS:
                adj_noun_edges[(previous.lemma, token.lemma)] += 1

            if previous.pos in NOUN_POS and token.pos in (POS_VERB, POS_AUX):
                verb_noun_edges[(token.lemma, previous.lemma)] += 1
            elif previous.pos in (POS_VERB, POS_AUX) and token.pos in NOUN_POS:
                verb_noun_edges[(previous.lemma, token.lemma)] += 1

        previous = token

    metadata = {
        "target_tokens": target_tokens,
        "total_tokens_observed": total_tokens,
        "lemma_strategy": f"stanza[pt]",
        "pos_strategy": "stanza[upos]",
    }
    return {
        "metadata": metadata,
        "noun_counts": noun_counts,
        "adj_counts": adj_counts,
        "verb_counts": verb_counts,
        "adj_noun_edges": adj_noun_edges,
        "verb_noun_edges": verb_noun_edges,
    }


def build_graphs(
    top_n: int,
    min_connection: int,
    target_tokens: int = TARGET_TOKEN_COUNT,
) -> dict:
    stats = collect_bipartite(target_tokens)

    top_nouns = select_top(stats["noun_counts"], top_n)
    top_adjs = select_top(stats["adj_counts"], top_n)
    top_verbs = select_top(stats["verb_counts"], top_n)

    noun_set = {word for word, _ in top_nouns}
    adj_set = {word for word, _ in top_adjs}
    verb_set = {word for word, _ in top_verbs}

    adj_edges = [
        {"source": adj, "target": noun, "weight": weight}
        for (adj, noun), weight in stats["adj_noun_edges"].items()
        if adj in adj_set and noun in noun_set and weight >= min_connection
    ]
    verb_edges = [
        {"source": verb, "target": noun, "weight": weight}
        for (verb, noun), weight in stats["verb_noun_edges"].items()
        if verb in verb_set and noun in noun_set and weight >= min_connection
    ]

    payload = {
        "metadata": {
            **stats["metadata"],
            "top_n": top_n,
            "min_connection": min_connection,
        },
        "adjective_noun": {
            "metadata": {
                "left_label": "przymiotniki",
                "right_label": "rzeczowniki",
                "left_count": len(top_adjs),
                "right_count": len(top_nouns),
                "edge_count": len(adj_edges),
            },
            "left_nodes": [
                {"id": word, "frequency": count} for word, count in top_adjs
            ],
            "right_nodes": [
                {"id": word, "frequency": count} for word, count in top_nouns
            ],
            "edges": adj_edges,
        },
        "verb_noun": {
            "metadata": {
                "left_label": "czasowniki",
                "right_label": "rzeczowniki",
                "left_count": len(top_verbs),
                "right_count": len(top_nouns),
                "edge_count": len(verb_edges),
            },
            "left_nodes": [
                {"id": word, "frequency": count} for word, count in top_verbs
            ],
            "right_nodes": [
                {"id": word, "frequency": count} for word, count in top_nouns
            ],
            "edges": verb_edges,
        },
    }
    write_json(semantic_path(), payload)
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Buduje grafy dwudzielne przymiotnik-rzeczownik oraz czasownik-rzeczownik."
    )
    parser.add_argument("--top-n", type=int, default=100)
    parser.add_argument("--min-connection", type=int, default=1)
    parser.add_argument("--target-tokens", type=int, default=TARGET_TOKEN_COUNT)
    args = parser.parse_args()

    payload = build_graphs(args.top_n, args.min_connection, args.target_tokens)
    meta = payload["metadata"]
    print(
        "Semantic graphs: "
        f"top_n={meta['top_n']}, "
        f"min_connection={meta['min_connection']} -> {semantic_path()}"
    )


if __name__ == "__main__":
    main()
