PY ?= python
VENV ?= .venv
UV ?= uv

ifeq ($(OS),Windows_NT)
VENV_BIN := $(VENV)/Scripts
PYTHON := $(VENV_BIN)/python
PIP := $(VENV_BIN)/pip
else
VENV_BIN := $(VENV)/bin
PYTHON := $(VENV_BIN)/python
PIP := $(VENV_BIN)/pip
endif

.PHONY: help venv install run dev clean

help:
	@echo "Targets:"
	@echo "  venv    - create virtual environment in $(VENV)"
	@echo "  install - install dependencies"
	@echo "  run     - run the app (debug=True in app.py)"
	@echo "  dev     - run Flask dev server"
	@echo "  clean   - remove virtual environment"
	
run:
	$(PYTHON) app.py

install:
	$(UV) sync

dev:
	$(PYTHON) -m flask --app app run

clean:
	@echo "Removing $(VENV)"
	@rmdir /S /Q $(VENV) 2>nul || rm -rf $(VENV)
