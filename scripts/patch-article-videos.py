#!/usr/bin/env python3
"""Regenerate course entries via seed-wiki-courses.py (1 video per course)."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED_SCRIPT = ROOT / "scripts" / "seed-wiki-courses.py"

if __name__ == "__main__":
    subprocess.check_call([sys.executable, str(SEED_SCRIPT)])
