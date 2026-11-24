from fastapi import APIRouter, Response, HTTPException, status
from fastapi.responses import StreamingResponse
from datetime import datetime

from ..services.session_store import session_store
from ..services.report_generator import generate_pdf_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/export/json")
async def export_findings_json():
    """
    Exports the current in-memory session findings in standard JSON format.
    """
    findings = session_store.get_all_findings()
    findings_data = [f.model_dump() for f in findings]

    payload = {
        "project": "Intelligent Web Application Vulnerability Triage and Risk Assessment Framework",
        "exported_at": datetime.utcnow().isoformat(),
        "total_findings": len(findings),
        "session_type": "In-Memory Session (No Database)",
        "findings": findings_data,
    }

    return payload


@router.get("/export/pdf")
@router.post("/export/pdf")
async def export_findings_pdf():
    """
    Generates and streams a professional PDF vulnerability triage report
    compiled on-the-fly from in-memory session data.
    """
    findings = session_store.get_all_findings()
    if not findings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No findings in active session to generate report. Please analyze a request or load sample findings first.",
        )

    try:
        pdf_stream = generate_pdf_report(findings)
        filename = f"VulnTriage_Report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"

        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Cache-Control": "no-cache",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error compiling PDF report: {str(e)}",
        )
