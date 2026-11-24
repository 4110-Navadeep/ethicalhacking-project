import uuid
from typing import List, Tuple
from .request_parser import ParsedRequest
from .sqli_analyzer import analyze_sqli
from .xss_analyzer import analyze_xss
from .cmdi_analyzer import analyze_cmdi
from .traversal_analyzer import analyze_traversal
from .idor_analyzer import analyze_idor
from .header_analyzer import analyze_security_headers
from .info_disclosure_analyzer import analyze_info_disclosure
from ..services.risk_scorer import calculate_risk_score
from ..services.remediation_service import get_remediation_for_finding
from ..services.session_store import session_store
from ..models.schemas import (
    Finding,
    SeverityLevel,
    RiskCategory,
    RemediationStatus,
    DetectionType,
    ConfidenceLevel,
)


def run_comprehensive_analysis(req: ParsedRequest, detection_source: str = "Request Analyzer") -> List[Finding]:
    """
    Executes all modular rule-based security analyzers against the parsed request.
    Synthesizes findings, computes risk scores, attaches remediation guidance,
    and saves findings to the active in-memory session.
    """
    candidate_findings = []

    # Run all analyzers safely
    candidate_findings.extend(analyze_sqli(req))
    candidate_findings.extend(analyze_xss(req))
    candidate_findings.extend(analyze_cmdi(req))
    candidate_findings.extend(analyze_traversal(req))
    candidate_findings.extend(analyze_idor(req))
    candidate_findings.extend(analyze_security_headers(req))
    candidate_findings.extend(analyze_info_disclosure(req))

    processed_findings: List[Finding] = []

    for raw in candidate_findings:
        finding_id = f"VULN-{uuid.uuid4().hex[:8].upper()}"
        severity_val = raw.get("severity", "Medium")
        category_val = raw.get("category", "General")
        target_val = raw.get("affected_target", "Request")
        conf_val = raw.get("confidence", "Medium")
        det_type_val = raw.get("detection_type", "Detected Indicator")

        # Calculate transparent risk score
        score, risk_cat, rationale = calculate_risk_score(
            severity=severity_val,
            category=category_val,
            affected_target=target_val,
            confidence=conf_val,
            detection_type=det_type_val,
        )

        # Get full remediation guidance
        remediation_pack = get_remediation_for_finding(category_val, raw.get("name", ""))

        finding_obj = Finding(
            id=finding_id,
            name=raw.get("name", "Security Weakness Indicator"),
            category=category_val,
            severity=SeverityLevel(severity_val),
            risk_score=score,
            risk_category=risk_cat,
            risk_rationale=rationale,
            description=raw.get("description", "Potential vulnerability indicator detected."),
            evidence=raw.get("evidence", "Pattern matched."),
            affected_target=target_val,
            detection_source=detection_source,
            detection_type=DetectionType(det_type_val),
            confidence=ConfidenceLevel(conf_val),
            detection_limitation=raw.get("detection_limitation", "Static heuristic analysis."),
            remediation_summary=remediation_pack.get("recommended_remediation", "Apply defensive validation."),
            remediation_details=remediation_pack,
            remediation_status=RemediationStatus.OPEN,
            request_snippet=req.raw_text[:400] if req.raw_text else f"{req.method} {req.url}",
            is_sample=False,
        )

        processed_findings.append(finding_obj)

    # Save to in-memory session store
    session_store.add_many(processed_findings)

    return processed_findings
