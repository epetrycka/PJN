import argparse
import json
from collections import Counter, defaultdict
from typing import Dict, List, Set, Tuple

from common import (
    LEMMA_STRATEGY,
    NDJSON_FILES,
    TARGET_TOKEN_COUNT,
    html_to_text,
    language_core_path,
    tokenize,
    write_json,
)


def collect_neighbor_stats(
    target_unique: int,
) -> Tuple[Counter[str], Dict[str, Counter[str]], dict]:
    token_counts: Counter[str] = Counter()
    neighbors: Dict[str, Counter[str]] = defaultdict(Counter)
    unique_seen: Set[str] = set()
    articles_used = 0
    files_considered = 0
    total_tokens = 0
    reached_target = False

    for ndjson_file in NDJSON_FILES:
        files_considered += 1
        with ndjson_file.open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                try:
                    payload = json.loads(line)
                except json.JSONDecodeError:
                    continue
                article_body = payload.get("article_body") or {}
                html = article_body.get("html")
                if not html:
                    continue
                tokens = tokenize(html_to_text(html))
                if not tokens:
                    continue
                articles_used += 1
                total_tokens += len(tokens)
                previous: str | None = None
                for token in tokens:
                    token_counts[token] += 1
                    if previous and previous != token:
                        neighbors[previous][token] += 1
                        neighbors[token][previous] += 1
                    previous = token
                    if token not in unique_seen:
                        unique_seen.add(token)
                        if len(unique_seen) >= target_unique:
                            reached_target = True
                if reached_target:
                    break
            if reached_target:
                break

    metadata = {
        "target_unique_words": target_unique,
        "unique_words_observed": len(unique_seen),
        "total_tokens_observed": total_tokens,
        "articles_used": articles_used,
        "files_considered": files_considered,
        "lemma_strategy": LEMMA_STRATEGY,
    }
    return token_counts, neighbors, metadata


from common import MANUAL_BLOCK, STOPWORDS

def build_graph(min_frequency: int, min_connection: int, max_nodes: int) -> dict:
    frequencies, neighbors, source_metadata = collect_neighbor_stats(TARGET_TOKEN_COUNT)

    nodes: List[dict] = []
    for word, count in frequencies.items():
        if count < min_frequency:
            continue
        if word in MANUAL_BLOCK or word in STOPWORDS:
            continue
        neighbor_stats = neighbors.get(word)
        if not neighbor_stats:
            continue
        connection_weight = sum(neighbor_stats.values())
        if connection_weight < min_connection:
            continue
        nodes.append(
            {
                "id": word,
                "frequency": count,
                "unique_neighbors": len(neighbor_stats),
                "connection_weight": connection_weight,
            }
        )

    nodes.sort(key=lambda item: (item["connection_weight"], item["frequency"]), reverse=True)
    selected_nodes = nodes[:max_nodes]
    selected_ids: Set[str] = {node["id"] for node in selected_nodes}

    edges: List[dict] = []
    seen_edges: Set[Tuple[str, str]] = set()
    for word in selected_ids:
        neighbor_stats = neighbors.get(word)
        if not neighbor_stats:
            continue
        for neighbor, weight in neighbor_stats.items():
            if neighbor not in selected_ids or weight < min_connection:
                continue
            edge_key = tuple(sorted((word, neighbor)))
            if edge_key in seen_edges:
                continue
            seen_edges.add(edge_key)
            edges.append({"source": word, "target": neighbor, "weight": weight})

    metadata = {
        **source_metadata,
        "min_frequency": min_frequency,
        "min_connection_weight": min_connection,
        "max_nodes": max_nodes,
        "selected_nodes": len(selected_nodes),
        "selected_edges": len(edges),
    }

    payload = {"metadata": metadata, "nodes": selected_nodes, "edges": edges}
    write_json(language_core_path(), payload)
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Buduje graf co-occurrence slow na podstawie dumpu ptwiki."
    )
    parser.add_argument("--min-frequency", type=int, default=12)
    parser.add_argument("--min-connection", type=int, default=5)
    parser.add_argument("--max-nodes", type=int, default=250)
    args = parser.parse_args()

    result = build_graph(args.min_frequency, args.min_connection, args.max_nodes)
    metadata = result["metadata"]
    print(
        "Language core graph: "
        f"{metadata['selected_nodes']} nodes, "
        f"{metadata['selected_edges']} edges -> {language_core_path()}"
    )


if __name__ == "__main__":
    main()
