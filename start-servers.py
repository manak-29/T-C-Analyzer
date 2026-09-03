"""
T&C Analyzer - Full Stack Launcher
====================================
Starts both the ML server and Backend API server.

Usage:
  python "D:\\risk final\\start-servers.py"
"""

import subprocess
import sys
import time
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
ML_SERVER = BASE_DIR / "ml-server" / "server.py"
BACKEND_API = BASE_DIR / "backend" / "api.py"

def main():
    print("=" * 60)
    print("  T&C Analyzer - Starting Servers")
    print("=" * 60)

    # Start ML Server
    print("\n[1/2] Starting ML Inference Server (port 8001)...")
    ml_proc = subprocess.Popen(
        [sys.executable, str(ML_SERVER)],
        cwd=str(BASE_DIR / "ml-server"),
    )
    time.sleep(3)

    # Start Backend API
    print("[2/2] Starting Backend API Server (port 8000)...")
    api_proc = subprocess.Popen(
        [sys.executable, str(BACKEND_API)],
        cwd=str(BASE_DIR / "backend"),
    )

    print("\n" + "=" * 60)
    print("  Servers started!")
    print("  ML Server:     http://localhost:8001")
    print("  Backend API:   http://localhost:8000")
    print("  Frontend:      Run 'npm run dev' in frontend/")
    print("=" * 60)
    print("\nPress Ctrl+C to stop all servers.\n")

    try:
        ml_proc.wait()
        api_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
        ml_proc.terminate()
        api_proc.terminate()
        ml_proc.wait()
        api_proc.wait()
        print("Done.")


if __name__ == "__main__":
    main()
