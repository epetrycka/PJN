import argparse

from common import frequency_path, load_or_build_frequency


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generuje tabel�t cz�tsto�>ci na podstawie korpusu."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Przelicza tabel�t cz�tsto�>ci ignorujƈc wcze�>niejsze wyniki.",
    )
    args = parser.parse_args()

    payload = load_or_build_frequency(force_rebuild=args.force)
    path = frequency_path()
    total = payload["metadata"]["total_tokens"]
    unique = payload["metadata"]["unique_words"]
    print(f"Tabela cz�tsto�>ci: {unique} unikalnych s�'ƈw z {total} tokenƈw -> {path}")


if __name__ == "__main__":
    main()
