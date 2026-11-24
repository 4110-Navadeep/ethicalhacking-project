import os
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from .routes import (
    analyzer_router,
    findings_router,
    dashboard_router,
    report_router,
    session_router,
)
from .services.session_store import session_store
from .services.sample_data import get_sample_findings

app = FastAPI(
    title="Intelligent Web Application Vulnerability Triage and Risk Assessment Framework",
    description="Backend API for automated web application vulnerability triage, risk assessment, and remediation planning.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup for local development (when Vite runs on port 5173)
frontend_origin = os.getenv("FRONTEND_ORIGIN", "*")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
if frontend_origin and frontend_origin != "*":
    allowed_origins.append(frontend_origin.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if frontend_origin == "*" else allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes FIRST so they take precedence over frontend static routing
app.include_router(analyzer_router)
app.include_router(findings_router)
app.include_router(dashboard_router)
app.include_router(report_router)
app.include_router(session_router)


@app.on_event("startup")
async def startup_event():
    """
    On application startup, pre-populate in-memory session with realistic
    academic demonstration findings so the dashboard has rich data on first launch.
    """
    if session_store.get_count() == 0:
        samples = get_sample_findings()
        session_store.add_many(samples)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for Render Web Service monitoring and local diagnostics.
    Does NOT depend on frontend loading.
    """
    return {
        "status": "healthy",
        "service": "Intelligent Web Application Vulnerability Triage and Risk Assessment Framework",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "None (Pure In-Memory Session Storage)",
        "active_findings_count": session_store.get_count(),
        "storage_mode": "In-Memory Temporary Structures",
    }


# =====================================================================
# SINGLE-SERVICE PRODUCTION FRONTEND SERVING
# =====================================================================

def find_dist_directory() -> Path:
    """
    Locates the compiled frontend/dist directory across multiple deployment contexts
    (running from repo root, running from backend directory, or running inside Render).
    """
    candidates = [
        Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
        Path(__file__).resolve().parent.parent / "frontend" / "dist",
        Path("frontend/dist").resolve(),
        Path("../frontend/dist").resolve(),
    ]
    for c in candidates:
        if c.is_dir() and (c / "index.html").is_file():
            return c
    # Return primary canonical path even if not yet compiled
    return candidates[0]


dist_dir = find_dist_directory()
assets_dir = dist_dir / "assets"

# If assets directory exists, mount it directly under /assets
if assets_dir.is_dir():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/", include_in_schema=False)
async def serve_root():
    """
    Serves the compiled React frontend homepage at the root URL (https://project.onrender.com/).
    """
    index_file = dist_dir / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    return JSONResponse(
        content={
            "status": "Backend Active",
            "message": "Frontend build (frontend/dist/index.html) not found. Build the frontend using 'npm run build' inside the frontend directory.",
            "docs_url": "/docs",
            "health_url": "/api/health",
        }
    )


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa_fallback(full_path: str):
    """
    SPA Fallback: Serves static assets or falls back to index.html for React Router routes.
    Ensures that refreshing /analyzer, /findings, /risk, /remediation, /reports never returns 404!
    """
    # 1. Do not capture API routes or docs
    if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
        return JSONResponse(status_code=404, content={"detail": f"Route '/{full_path}' not found."})

    # 2. Check if a static file in dist matches (e.g. favicon.svg, vite.svg)
    file_path = dist_dir / full_path
    if full_path and file_path.is_file():
        return FileResponse(file_path)

    # 3. Fallback to index.html for React Router SPA paths
    index_file = dist_dir / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)

    return JSONResponse(
        status_code=404,
        content={"detail": "Frontend bundle not found. Please compile frontend with 'npm run build'."},
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
