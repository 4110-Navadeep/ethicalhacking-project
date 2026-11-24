import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import ValidationError

from ..models.schemas import (
    RawRequestInput,
    ManualRequestInput,
    AnalyzeResponse,
    Finding,
    SeverityLevel,
    RiskCategory,
    RemediationStatus,
    DetectionType,
    ConfidenceLevel,
)
from ..analyzers.request_parser import parse_raw_http_request, parse_manual_request
from ..analyzers.engine import run_comprehensive_analysis
from ..services.session_store import session_store
from ..services.risk_scorer import calculate_risk_score
from ..services.remediation_service import get_remediation_for_finding

router = APIRouter(prefix="/api", tags=["Analyzer"])


@router.post("/analyze/raw", response_model=AnalyzeResponse)
async def analyze_raw_http_request(payload: RawRequestInput):
    """
    Parses a raw HTTP request string and performs safe rule-based vulnerability triage.
    """
    try:
        parsed = parse_raw_http_request(payload.raw_request)
        findings = run_comprehensive_analysis(parsed, detection_source="Raw HTTP Request")
        target_summary = f"{parsed.method} {parsed.url}"
        return AnalyzeResponse(
            analysis_status="Completed",
            target_summary=target_summary,
            total_detected=len(findings),
            findings=findings,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing and analyzing raw request: {str(e)}",
        )


@router.post("/analyze/manual", response_model=AnalyzeResponse)
async def analyze_manual_request_input(payload: ManualRequestInput):
    """
    Parses manually configured HTTP parameters and performs vulnerability triage.
    """
    try:
        parsed = parse_manual_request(
            method=payload.method,
            url=payload.url,
            headers=payload.headers,
            query_params=payload.query_params,
            body=payload.body,
        )
        findings = run_comprehensive_analysis(parsed, detection_source="Manual Request Input")
        target_summary = f"{payload.method} {payload.url}"
        return AnalyzeResponse(
            analysis_status="Completed",
            target_summary=target_summary,
            total_detected=len(findings),
            findings=findings,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error analyzing manual request: {str(e)}",
        )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_unified(
    raw_payload: Optional[RawRequestInput] = None,
    manual_payload: Optional[ManualRequestInput] = None,
):
    """
    Unified endpoint for request analysis.
    """
    if raw_payload and raw_payload.raw_request:
        return await analyze_raw_http_request(raw_payload)
    elif manual_payload and manual_payload.url:
        return await analyze_manual_request_input(manual_payload)
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either raw_request or manual request fields must be provided.",
        )


@router.post("/import-report")
async def import_scan_report(file: UploadFile = File(...)):
    """
    Imports a vulnerability scan report in JSON format.
    Validates structure, transforms findings into standardized schema,
    scores risk, and stores in temporary session memory.
    """
    # Max file size 5MB guard
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded file exceeds 5MB limit.",
        )

    try:
        data = json.loads(contents.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format. Please upload a valid JSON scan report.",
        )

    raw_items = []
    # Accept standard shapes: list of findings, or object with 'findings' or 'vulnerabilities' key
    if isinstance(data, list):
        raw_items = data
    elif isinstance(data, dict):
        raw_items = data.get("findings") or data.get("vulnerabilities") or data.get("results") or [data]

    imported_findings: List[Finding] = []

    for item in raw_items:
        if not isinstance(item, dict):
            continue

        name = item.get("name") or item.get("title") or item.get("vulnerability") or "Imported Security Finding"
        category = item.get("category") or item.get("type") or "Imported Finding"
        sev_str = str(item.get("severity", "Medium")).capitalize()
        if sev_str not in ["Critical", "High", "Medium", "Low", "Informational"]:
            sev_str = "Medium"

        affected = item.get("affected_target") or item.get("url") or item.get("target") or "Imported Target"
        conf_str = str(item.get("confidence", "Medium")).capitalize()
        if conf_str not in ["High", "Medium", "Low"]:
            conf_str = "Medium"

        det_type = item.get("detection_type") or "Potential Vulnerability"

        score, risk_cat, rationale = calculate_risk_score(
            severity=sev_str,
            category=category,
            affected_target=affected,
            confidence=conf_str,
            detection_type=det_type,
        )

        remediation_pack = get_remediation_for_finding(category, name)
        finding_id = f"IMP-{uuid.uuid4().hex[:6].upper()}"

        finding_obj = Finding(
            id=finding_id,
            name=name,
            category=category,
            severity=SeverityLevel(sev_str),
            risk_score=score,
            risk_category=risk_cat,
            risk_rationale=rationale,
            description=item.get("description") or f"Imported vulnerability finding for {name}.",
            evidence=item.get("evidence") or item.get("proof") or "Imported from external scan document.",
            affected_target=affected,
            detection_source=f"Imported File ({file.filename})",
            detection_type=DetectionType.POTENTIAL,
            confidence=ConfidenceLevel(conf_str),
            detection_limitation="Finding ingested from external report. Subject to original tool scanning parameters.",
            remediation_summary=remediation_pack.get("recommended_remediation", "Apply recommended defensive controls."),
            remediation_details=remediation_pack,
            remediation_status=RemediationStatus.OPEN,
            is_sample=False,
        )
        imported_findings.append(finding_obj)

    if not imported_findings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid vulnerability findings could be parsed from the uploaded JSON.",
        )

    session_store.add_many(imported_findings)

    return {
        "status": "Success",
        "imported_count": len(imported_findings),
        "filename": file.filename,
        "message": f"Successfully ingested {len(imported_findings)} findings into active temporary session.",
        "session_notice": "Data is stored temporarily in memory and will reset upon backend restart.",
    }
