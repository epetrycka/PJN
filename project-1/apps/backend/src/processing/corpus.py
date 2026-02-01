import argparse

from common import corpus_path, load_or_build_corpus


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Buduje korpus 100k wyrazƈw na podstawie dumpu ptwiki."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Przebudowuje korpus ignorujƈc wcze�>niej zapisany plik.",
    )
    args = parser.parse_args()

    result = load_or_build_corpus(force_rebuild=args.force)
    path = corpus_path()
    print(f"Zapisano korpus ({result.metadata['token_count']} tokenƈw) do: {path}")
    print(f"Metadane: {result.metadata}")


if __name__ == "__main__":
    main()
