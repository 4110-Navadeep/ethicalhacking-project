#!/usr/bin/env python3
"""
Intelligent Web Application Vulnerability Triage and Risk Assessment Framework
Unified Local Development Orchestrator

Starts both the FastAPI backend and Vite frontend development server
with a single command, monitors their health, and handles clean termination.
"""

import os
import sys
import time
import signal
import shutil
import subprocess
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

processes = []

def cleanup(signum=None, frame=None):
    """Gracefully terminates both backend and frontend child processes."""
    print("\n\nShutting down development servers...")
    for proc, name in processes:
        if proc and proc.poll() is None:
            try:
                if sys.platform == "win32":
                    # On Windows, kill entire process tree to ensure node.exe / uvicorn stop cleanly
                    subprocess.run(
                        ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                else:
                    proc.terminate()
            except Exception:
                pass
    print("All servers stopped successfully. Goodbye!")
    sys.exit(0)

# Register signal handlers for Ctrl+C
signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def main():
    # Verify directories
    if not BACKEND_DIR.is_dir():
        print(f"Error: Backend directory not found at {BACKEND_DIR}")
        sys.exit(1)
    if not FRONTEND_DIR.is_dir():
        print(f"Error: Frontend directory not found at {FRONTEND_DIR}")
        sys.exit(1)

    # Determine npm executable name
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    npm_path = shutil.which(npm_cmd) or shutil.which("npm")
    if not npm_path:
        print("Error: 'npm' command not found. Please ensure Node.js and npm are installed and in your PATH.")
        sys.exit(1)

    print("Starting FastAPI backend service...")
    try:
        backend_proc = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
            cwd=str(BACKEND_DIR),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
        processes.append((backend_proc, "Backend"))
    except Exception as e:
        print(f"Failed to start backend: {e}")
        cleanup()

    print("Starting Vite frontend development server...")
    try:
        frontend_proc = subprocess.Popen(
            [npm_path, "run", "dev"],
            cwd=str(FRONTEND_DIR),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
        processes.append((frontend_proc, "Frontend"))
    except Exception as e:
        print(f"Failed to start frontend: {e}")
        cleanup()

    # Allow servers a brief moment to bind to ports
    time.sleep(1.5)

    # Check if either died immediately
    if backend_proc.poll() is not None:
        err = backend_proc.stderr.read().decode("utf-8", errors="ignore")
        print(f"Error: Backend failed to start:\n{err}")
        cleanup()

    if frontend_proc.poll() is not None:
        err = frontend_proc.stderr.read().decode("utf-8", errors="ignore")
        print(f"Error: Frontend failed to start:\n{err}")
        cleanup()

    # Formatted user-facing banner
    print("\n" + "=" * 40)
    print("INTELLIGENT WEB APPLICATION VULNERABILITY")
    print("TRIAGE AND RISK ASSESSMENT FRAMEWORK")
    print("=" * 40 + "\n")
    print("Backend:")
    print("http://localhost:8000\n")
    print("Frontend:")
    print("http://localhost:5173\n")
    print("API Documentation:")
    print("http://localhost:8000/docs\n")
    print("Status:")
    print("Frontend and backend running.\n")
    print("Open the frontend URL to use the application.\n")
    print("=" * 40)
    print("Press Ctrl+C to stop both servers.\n")

    # Keep alive and monitor child processes
    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                err = backend_proc.stderr.read().decode("utf-8", errors="ignore")
                print(f"\n[Backend stopped unexpectedly]: {err}")
                break
            if frontend_proc.poll() is not None:
                err = frontend_proc.stderr.read().decode("utf-8", errors="ignore")
                print(f"\n[Frontend stopped unexpectedly]: {err}")
                break
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()

if __name__ == "__main__":
    main()
