from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from ..models.schemas import (
    Finding,
    SeverityLevel,
    RemediationStatus,
    StatusUpdateRequest,
)
from ..services.session_store import session_store
from ..services.sample_data import get_sample_findings

router = APIRouter(prefix="/api/findings", tags=["Findings"])


@router.get("", response_model=List[Finding])
async def list_findings(
    severity: Optional[str] = Query(None, description="Filter by severity level"),
    category: Optional[str] = Query(None, description="Filter by vulnerability category"),
    remediation_status: Optional[str] = Query(None, alias="status", description="Filter by remediation status"),
    source: Optional[str] = Query(None, description="Filter by detection source"),
    search: Optional[str] = Query(None, description="Search term in name, description, target or evidence"),
):
    """
    Retrieves all vulnerability findings from the active in-memory session with optional filtering and search.
    """
    findings = session_store.get_all_findings()

    filtered = findings

    if isinstance(severity, str) and severity.lower() != "all":
        filtered = [f for f in filtered if f.severity.value.lower() == severity.lower()]

    if isinstance(category, str) and category.lower() != "all":
        filtered = [f for f in filtered if f.category.lower() == category.lower()]

    if isinstance(remediation_status, str) and remediation_status.lower() != "all":
        filtered = [f for f in filtered if f.remediation_status.value.lower() == remediation_status.lower()]

    if isinstance(source, str) and source.lower() != "all":
        filtered = [f for f in filtered if source.lower() in f.detection_source.lower()]

    if isinstance(search, str) and search.strip():
        s = search.lower().strip()
        filtered = [
            f for f in filtered
            if s in f.name.lower()
            or s in f.id.lower()
            or s in f.description.lower()
            or s in f.affected_target.lower()
            or s in f.evidence.lower()
            or s in f.category.lower()
        ]

    return filtered


@router.get("/{finding_id}", response_model=Finding)
async def get_finding_by_id(finding_id: str):
    """
    Retrieves a single finding's detailed view by ID.
    """
    finding = session_store.get_finding(finding_id)
    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Finding with ID '{finding_id}' not found in active session.",
        )
    return finding


@router.patch("/{finding_id}/status", response_model=Finding)
async def update_finding_status(finding_id: str, payload: StatusUpdateRequest):
    """
    Updates the remediation status (Open, In Progress, Resolved) of an in-memory finding.
    """
    updated = session_store.update_status(finding_id, payload.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Finding with ID '{finding_id}' not found.",
        )
    return updated


@router.post("/sample", response_model=List[Finding])
async def load_sample_findings():
    """
    Loads realistic academic demonstration findings into the active session.
    All loaded items are clearly labeled as DEMONSTRATION DATA.
    """
    samples = get_sample_findings()
    session_store.add_many(samples)
    return samples
