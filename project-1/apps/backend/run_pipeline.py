import subprocess
import sys
import os

def run_step(command):
    print(f"--- Running: {' '.join(command)} ---")
    # Flush stdout to ensure order in logs
    sys.stdout.flush()
    result = subprocess.run(command, check=False)
    if result.returncode != 0:
        print(f"!!! Error running step: {command}")
        sys.exit(result.returncode)

def main():
    # Use the current python interpreter (which corresponds to the uv venv)
    python = sys.executable
    # Path to scripts relative to apps/backend
    src = os.path.join("src", "processing")
    
    steps = [
        # 1. Corpus: Extracts text from the raw dump
        [python, os.path.join(src, "corpus.py"), "--force"],
        
        # 2. Frequency: Calculates word counts
        [python, os.path.join(src, "frequency.py"), "--force"],
        
        # 3. Zipf: Generates Zipf's law analysis
        [python, os.path.join(src, "zipf.py"), "--max-points", "2000"],
        
        # 4. Language Core: Builds the graph of connected words
        [python, os.path.join(src, "language_core.py"), 
         "--min-frequency", "12", 
         "--min-connection", "5", 
         "--max-nodes", "250"],
         
        # 5. Nouns: Extracts and translates nouns
        [python, os.path.join(src, "nouns.py"), "--limit", "50"],
        
        # 6. Semantic: Semantic analysis (co-occurrence)
        [python, os.path.join(src, "semantic.py"), 
         "--top-n", "100", 
         "--min-connection", "1", 
         "--target-tokens", "100000"]
    ]

    for step in steps:
        run_step(step)

    # Copy files to frontend
    import shutil
    
    # Define paths relative to CWD (apps/backend)
    backend_processed = os.path.join("data", "processed")
    # path to frontend/src/data -> ../frontend/src/data
    frontend_data = os.path.join("..", "frontend", "src", "data")
    
    # Ensure destination exists
    if not os.path.exists(frontend_data):
        print(f"!!! Frontend data dir not found at: {frontend_data}")
    else:
        print(f"--- Copying files to frontend: {frontend_data} ---")
        files_to_copy = [
            "corpus_100000_tokens.json",
            "frequency_table.json",
            "zipf_analysis.json",
            "language_core_graph.json",
            "nouns_translations.json",
            "semantic_bipartite_graphs.json"
        ]
        
        for fname in files_to_copy:
            src_file = os.path.join(backend_processed, fname)
            dst_file = os.path.join(frontend_data, fname)
            if os.path.exists(src_file):
                shutil.copy2(src_file, dst_file)
                print(f"Copied {fname}")
            else:
                print(f"Warning: {fname} not found in processed dir")

    print("\n=== SUCCESS: All processing steps completed! ===")

if __name__ == "__main__":
    main()
