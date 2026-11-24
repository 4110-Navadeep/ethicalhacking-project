from fastapi import APIRouter
from ..models.schemas import DashboardStats
from ..services.session_store import session_store

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStats)
async def get_dashboard_summary():
    """
    Returns dynamically computed overview statistics, distributions, and prioritized findings
    from the current in-memory session.
    """
    return session_store.get_dashboard_stats()
