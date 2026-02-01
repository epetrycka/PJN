PYTHON ?= python
SRC_DIR := src/processing

ZIPF_MAX_POINTS ?= 2000
LANGUAGE_CORE_MIN_FREQUENCY ?= 12
LANGUAGE_CORE_MIN_CONNECTION ?= 5
LANGUAGE_CORE_MAX_NODES ?= 250
NOUNS_LIMIT ?= 50
SEMANTIC_TOP_N ?= 100
SEMANTIC_MIN_CONNECTION ?= 1
SEMANTIC_TARGET_TOKENS ?= 100000

.PHONY: all run-all corpus frequency zipf language-core nouns semantic

all: run-all

run-all: corpus frequency zipf language-core nouns semantic

corpus:
	$(PYTHON) $(SRC_DIR)/corpus.py

frequency: corpus
	$(PYTHON) $(SRC_DIR)/frequency.py

zipf: frequency
	$(PYTHON) $(SRC_DIR)/zipf.py --max-points $(ZIPF_MAX_POINTS)

language-core: corpus
	$(PYTHON) $(SRC_DIR)/language_core.py \
		--min-frequency $(LANGUAGE_CORE_MIN_FREQUENCY) \
		--min-connection $(LANGUAGE_CORE_MIN_CONNECTION) \
		--max-nodes $(LANGUAGE_CORE_MAX_NODES)

nouns: frequency
	$(PYTHON) $(SRC_DIR)/nouns.py --limit $(NOUNS_LIMIT)

semantic: corpus
	$(PYTHON) $(SRC_DIR)/semantic.py \
		--top-n $(SEMANTIC_TOP_N) \
		--min-connection $(SEMANTIC_MIN_CONNECTION) \
		--target-tokens $(SEMANTIC_TARGET_TOKENS)
