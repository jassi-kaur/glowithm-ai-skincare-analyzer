"""
Manual smoke test for a local Ollama install.

Moved out of test_ollama.py: pytest collects files named test_*.py, and the old
file called ollama.chat() at import time, so `pytest` failed on any machine
without a running Ollama.  Run this by hand:  python scripts/ollama_smoke.py
"""
import os

import ollama


def main():
    model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    response = ollama.chat(
        model=model,
        messages=[{"role": "user", "content": "Give me 3 skincare tips for oily skin."}],
    )
    print(response["message"]["content"])


if __name__ == "__main__":
    main()
