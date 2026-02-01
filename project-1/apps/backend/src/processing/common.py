from __future__ import annotations

import json
import unicodedata
from collections import Counter
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Iterable, Iterator, List, Optional
import re

from bs4 import BeautifulSoup

try:
    import simplemma
except ImportError:  # pragma: no cover - optional dependency
    simplemma = None

BASE_DIR = Path(__file__).resolve().parents[2]
RAW_ROOT = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TARGET_TOKEN_COUNT = 100_000

CORPUS_FILENAME = f"corpus_{TARGET_TOKEN_COUNT}_tokens.json"
FREQUENCY_FILENAME = "frequency_table.json"
ZIPF_FILENAME = "zipf_analysis.json"
LANGUAGE_CORE_FILENAME = "language_core_graph.json"
NOUNS_FILENAME = "nouns_translations.json"
SEMANTIC_FILENAME = "semantic_bipartite_graphs.json"

WORD_RE = re.compile(r"[\w'\-]+", re.UNICODE)
LEMMA_LANGUAGE = "pt"

if simplemma is None:  # pragma: no cover - enforced dependency
    raise RuntimeError("Biblioteka simplemma jest wymagana do lematyzacji.")

LEMMA_STRATEGY = f"simplemma[{LEMMA_LANGUAGE}]"


def _resolve_dump_dir() -> Path:
    candidates = sorted(RAW_ROOT.glob("ptwiki-NS0-*-HTML.json"))
    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    raise FileNotFoundError("Nie znaleziono katalogu z dumpem ptwiki w src/data/raw")


NDJSON_FILES = sorted(RAW_ROOT.glob("**/*.ndjson"))


def html_to_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for element in soup(["script", "style"]):
        element.decompose()
    text = soup.get_text(" ", strip=True)
    return re.sub(r"\s+", " ", text)


def _lemmatize_token(token: str) -> str:
    lemma = simplemma.lemmatize(token, LEMMA_LANGUAGE)
    if not lemma:
        raise RuntimeError(f"Nie udało się zlematyzować tokenu: {token!r}")
    return lemma


STOPWORDS = {
    "de", "a", "o", "que", "e", "do", "da", "em", "um", "para",
    "com", "não", "uma", "os", "no", "se", "na", "por", "mais",
    "as", "dos", "como", "mas", "ao", "ele", "das", "à", "seu",
    "sua", "ou", "quando", "muito", "nos", "já", "eu", "também",
    "só", "pelo", "pela", "até", "isso", "ela", "entre", "depois",
    "sem", "mesmo", "aos", "seus", "quem", "nas", "me", "esse",
    "eles", "você", "essa", "num", "nem", "suas", "meu", "às",
    "minha", "numa", "pelos", "elas", "qual", "nós", "lhe", "deles",
    "essas", "esses", "pelas", "este", "dele", "tu", "te", "vocês",
    "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas",
    "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta",
    "estes", "estas", "aquele", "aquela", "aqueles", "aquelas",
    "isto", "aquilo", "estou", "está", "estamos", "estão", "estive",
    "esteve", "estivemos", "estiveram", "estava", "estávamos",
    "estavam", "estivera", "estivéramos", "hajam", "havemos",
    "hei", "houve", "houvemos", "houveram", "houvera", "houvéramos",
    "haja", "hajamos", "hajas", "tinha", "tínhamos", "tinham",
    "tive", "teve", "tivemos", "tiveram", "tivera", "tivéramos",
    "tenho", "tem", "temos", "tém", "tinha", "tinhas", "tínhamos",
    "tinham", "tiveste", "tivestes", "tiver", "tiveres", "tivermos",
    "tiverem", "terei", "terá", "teremos", "terão", "teria", "teríamos",
    "teriam", "sou", "somos", "são", "era", "éramos", "eram", "fui",
    "foi", "fomos", "foram", "fora", "fôramos", "seja", "sejamos",
    "sejam", "serei", "será", "seremos", "serão", "seria", "seríamos",
    "seriam", "tenha", "tenhamos", "tenham", "tendo", "ter", "ser",
    "foi", "como", "mas", "foi", "ao", "das",
}

MANUAL_ALLOW = {
    "ano",
    "lisboa",
    "portugal",
    "brasil",
    "mundo",
    "exemplo",
}

MANUAL_BLOCK = {
    "online",
    "disponível",
    "acesso",
    "consultado",
    "original",
    "arquivado",
    "ligação",
    "externa",
    "bibliografia",
    "referência",
    "sobre",
    "editar",
    "código",
    "font",
    "span",
    "div",
    "style",
    "class",
    "align",
    "width",
    "height",
    "valign",
    "bgcolor",
    "rowspan",
    "colspan",
    "borda",
    "solid",
    "background",
    "padding",
    "margin",
    "center",
    "right",
    "left",
    "small",
    "big",
    "sup",
    "sub",
    "http",
    "https",
    "www",
    "com",
    "org",
    "net",
    "edu",
    "gov",
    "html",
    "htm",
    "php",
    "aspx",
    "jsp",
    "doi",
    "isbn",
    "issn",
    "pmid",
    "arxiv",
    "pdf",
    "jpg",
    "png",
    "svg",
    "gif",
    "jpeg",
    "and",
    "the",
    "in",
    "of",
    "to",
    "new",
    "time",
    "music",
    "on",
    "yes",
    "no",
    "for",
    "by",
    "with",
    "from",
    "at",
    "his",
    "her",
    "he",
    "she",
    "it",
    "is",
    "are",
    "was",
    "were",
    "that",
    "this",
    "e",
    "s",
    "a",
    "d",
    "v",
    "of",
    "world",
    "single",
    "casar",
    "usar",
    "km",
    "wikipedia",
    "c",
}

# Additional portuguese stopwords that might be appearing as lemmatized forms
EXTRA_STOPWORDS = {
    "o", "a", "os", "as", "um", "uma", "uns", "umas",
    "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
    "por", "pelo", "pela", "pelos", "pelas",
    "para", "pra",
    "com",
    "e", "ou", "mas", "nem",
    "que", "se",
    "não", "sim",
    "eu", "tu", "ele", "ela", "nós", "vós", "eles", "elas",
    "me", "te", "se", "nos", "vos", "lhe", "lhes",
    "meu", "teu", "seu", "nosso", "vosso",
    "este", "esse", "aquele", "aquilo", "isso", "isto",
    "ser", "estar", "ter", "haver", "ir", "vir", # Common verbs in infinitive
    "the", "and", "of", "in", "to", "for", "on", "with", "as", "by", "at", # English pollution
    "is", "it", "that", "this", "was", "are", "from", "be", "or", "an", # More English pollution
     "s", "d", "v", "p", "m", "c", "l", "n", "g", "b", "j", "r", "x", "t", "f", "h", "k", "w", "y", "z", # Single letters
     "ª", "º", "°", "etc", # Ordinals/symbols/abbreviations
}

ALL_STOPWORDS = STOPWORDS | EXTRA_STOPWORDS

def _normalize_token(token: str) -> Optional[str]:
    token = token.strip("_'\"-")
    if not token:
        return None
    if any(ch.isdigit() for ch in token):
        return None
        if not all(
            unicodedata.category(ch).startswith("L") or ch in {"-", "'"}
            for ch in token
        ):
            return None
    # Filter single characters (except maybe 'é' but that's a verb, usually stopword anyway)
    if len(token) < 2:
        return None
    if not any(unicodedata.category(ch).startswith("L") for ch in token):
        return None
        
    # Korean characters filter (Hangul Syllables)
    if any(0xAC00 <= ord(ch) <= 0xD7A3 for ch in token):
        return None
        
    # LaTeX/Wiki artifacts filter
    if token.startswith("{") or token.startswith("\\") or "displaystyle" in token:
        return None
        
    lowered = token.lower()
    
    # Check stopwords BEFORE lemmatization to catch common forms
    if lowered in ALL_STOPWORDS:
        return None

    lemma = _lemmatize_token(lowered)
    
    # Check stopwords AFTER lemmatization (e.g. 'fui' -> 'ser')
    if lemma in ALL_STOPWORDS:
        return None
        
    # Double check length after lemmatization
    if len(lemma) < 2:
        return None
        
    return lemma


def tokenize(text: str) -> List[str]:
    tokens: List[str] = []
    for raw_token in WORD_RE.findall(text):
        normalized = _normalize_token(raw_token)
        if normalized:
            tokens.append(normalized)
    return tokens


def deduplicate_tokens(tokens: Iterable[str]) -> List[str]:
    seen: set[str] = set()
    unique: List[str] = []
    for token in tokens:
        if token in seen:
            continue
        seen.add(token)
        unique.append(token)
    return unique


@dataclass
class CorpusResult:
    tokens: List[str]
    metadata: dict
    frequencies: Optional[Counter[str]] = None


def collect_corpus(target_tokens: int = TARGET_TOKEN_COUNT) -> CorpusResult:
    tokens: List[str] = []
    seen_tokens: set[str] = set()
    frequencies: Counter[str] = Counter()
    article_count = 0
    files_considered = 0

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
                html = payload.get("article_body", {}).get("html")
                if not html:
                    continue
                article_tokens = tokenize(html_to_text(html))
                if not article_tokens:
                    continue
                article_count += 1
                for token in article_tokens:
                    frequencies[token] += 1
                    if token in seen_tokens:
                        continue
                    seen_tokens.add(token)
                    tokens.append(token)
                    if len(tokens) >= target_tokens:
                        metadata = {
                            "target_tokens": target_tokens,
                            "token_count": len(tokens),
                            "articles_used": article_count,
                            "files_considered": files_considered,
                            "unique_words": len(seen_tokens),
                            "total_observed_tokens": sum(frequencies.values()),
                            "lemma_strategy": LEMMA_STRATEGY,
                        }
                        return CorpusResult(tokens, metadata, frequencies)

    metadata = {
        "target_tokens": target_tokens,
        "token_count": len(tokens),
        "articles_used": article_count,
        "files_considered": files_considered,
        "unique_words": len(seen_tokens),
        "total_observed_tokens": sum(frequencies.values()),
        "note": "Nie osi�gni�to docelowej liczby token�w.",
        "lemma_strategy": LEMMA_STRATEGY,
    }
    return CorpusResult(tokens, metadata, frequencies)


def ensure_processed_dir() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, data: dict) -> None:
    ensure_processed_dir()
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)


def read_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def corpus_path() -> Path:
    return PROCESSED_DIR / CORPUS_FILENAME


def frequency_path() -> Path:
    return PROCESSED_DIR / FREQUENCY_FILENAME
def zipf_path() -> Path:
    return PROCESSED_DIR / ZIPF_FILENAME


def language_core_path() -> Path:
    return PROCESSED_DIR / LANGUAGE_CORE_FILENAME


def nouns_path() -> Path:
    return PROCESSED_DIR / NOUNS_FILENAME


def semantic_path() -> Path:
    return PROCESSED_DIR / SEMANTIC_FILENAME


def load_or_build_corpus(force_rebuild: bool = False) -> CorpusResult:
    path = corpus_path()
    if path.exists() and not force_rebuild:
        payload = read_json(path)
        tokens = payload["tokens"]
        metadata = dict(payload["metadata"])
        return CorpusResult(tokens=tokens, metadata=metadata)

    result = collect_corpus()
    tokens = deduplicate_tokens(result.tokens)
    metadata = dict(result.metadata)
    metadata["token_count"] = len(tokens)
    write_json(path, {"tokens": tokens, "metadata": metadata})
    return CorpusResult(
        tokens=tokens, metadata=metadata, frequencies=result.frequencies
    )


def frequency_table(counter: Counter[str]) -> List[dict]:
    total = sum(counter.values())
    table: List[dict] = []
    for rank, (word, count) in enumerate(counter.most_common(), start=1):
        table.append(
            {
                "rank": rank,
                "word": word,
                "count": count,
                "relative_frequency": count / total if total else 0.0,
            }
        )
    return table


def load_or_build_frequency(force_rebuild: bool = False) -> dict:
    path = frequency_path()
    if path.exists() and not force_rebuild:
        return read_json(path)

    corpus = load_or_build_corpus(force_rebuild=True)
    counter = corpus.frequencies or Counter(corpus.tokens)
    table = frequency_table(counter)
    total_tokens = sum(counter.values())
    payload = {
        "metadata": {
            "total_tokens": total_tokens,
            "unique_words": len(counter),
            "source_corpus_tokens": len(corpus.tokens),
        },
        "data": table,
    }
    write_json(path, payload)
    return payload


def iter_corpus_tokens() -> Iterator[str]:
    corpus = load_or_build_corpus()
    yield from corpus.tokens
