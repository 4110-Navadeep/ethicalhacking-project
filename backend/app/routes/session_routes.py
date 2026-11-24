from fastapi import APIRouter
from ..services.session_store import session_store

router = APIRouter(prefix="/api/session", tags=["Session"])


@router.delete("")
async def clear_session_data():
    """
    Clears all active findings from in-memory data structures and resets dashboard state.
    """
    session_store.clear()
    return {
        "status": "Session Cleared",
        "message": "All temporary in-memory findings and metrics have been reset.",
        "findings_count": 0,
    }


@router.get("/status")
async def get_session_status():
    """
    Returns current memory footprint and active session metrics.
    """
    return {
        "active_findings": session_store.get_count(),
        "storage_mode": "In-Memory Temporary Structures (No Database)",
        "persistence": False,
        "notice": "All data is ephemeral and will be cleared on process restart.",
    }
