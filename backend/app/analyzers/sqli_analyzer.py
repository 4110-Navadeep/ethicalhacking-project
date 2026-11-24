import re
import urllib.parse
from typing import List, Dict, Any
from .request_parser import ParsedRequest

# Regular expressions for SQL Injection heuristics
SQLI_PATTERNS = [
    {
        "name": "SQL Injection (Union-Based Query Technique)",
        "pattern": re.compile(r"(?i)(\bUNION\b[\s\+]+(ALL[\s\+]+)?SELECT\b)", re.IGNORECASE),
        "severity": "Critical",
        "detection_type": "Potential Vulnerability",
        "confidence": "High",
        "description": "The input contains a SQL 'UNION SELECT' statement pattern commonly used to extract records from other database tables.",
        "impact": "Complete unauthorized data extraction across database schemas, bypassing access controls.",
    },
    {
        "name": "SQL Injection (Boolean / Tautology Expression)",
        "pattern": re.compile(r"(?i)(\bOR\b[\s\+]+['\"]?\w+['\"]?\s*=\s*['\"]?\w+['\"]?|\bAND\b[\s\+]+['\"]?\w+['\"]?\s*=\s*['\"]?\w+['\"]?|'\s+OR\s+'1'='1|'\s+OR\s+1=1|\bOR\b\s+true\b)", re.IGNORECASE),
        "severity": "High",
        "detection_type": "Detected Indicator",
        "confidence": "High",
        "description": "Tautological boolean condition pattern detected (e.g. 'OR 1=1' or 'OR 'a'='a'). Typically leveraged to bypass authentication or alter WHERE clause evaluation.",
        "impact": "Authentication bypass, unauthorized record exposure, and logic circumvention.",
    },
    {
        "name": "SQL Injection (Comment Sequence & Query Termination)",
        "pattern": re.compile(r"(--[\s\+]|/\*.*?\*/|#\s*$|;\s*--)", re.IGNORECASE),
        "severity": "Medium",
        "detection_type": "Detected Indicator",
        "confidence": "Medium",
        "description": "SQL comment delimiters detected in user input, used to neutralize the remainder of a backend dynamic query.",
        "impact": "Query manipulation and syntax truncation in downstream database engines.",
    },
    {
        "name": "SQL Injection (Stacked Query / Command Execution)",
        "pattern": re.compile(r"(?i)(;\s*(DROP|ALTER|CREATE|TRUNCATE|DELETE|UPDATE|INSERT|EXEC|XP_CMDSHELL)\b)", re.IGNORECASE),
        "severity": "Critical",
        "detection_type": "Potential Vulnerability",
        "confidence": "High",
        "description": "Stacked query syntax detected containing DDL/DML statements or dangerous procedures (e.g. DROP, EXEC, xp_cmdshell).",
        "impact": "Direct database corruption, data destruction, or underlying host OS compromise.",
    },
    {
        "name": "SQL Injection (Time-Based / Blind Function)",
        "pattern": re.compile(r"(?i)(\b(SLEEP|BENCHMARK|PG_SLEEP|WAITFOR[\s\+]+DELAY)\b\s*\(?)", re.IGNORECASE),
        "severity": "High",
        "detection_type": "Potential Vulnerability",
        "confidence": "High",
        "description": "Time-delay database primitives detected, indicative of blind SQL injection enumeration.",
        "impact": "Out-of-band or blind data exfiltration and server latency degradation.",
    },
    {
        "name": "SQL Injection (Error-Based Extraction Function)",
        "pattern": re.compile(r"(?i)(\b(EXTRACTVALUE|UPDATEXML|CTXSYS\.DRITHSX\.SN)\b)", re.IGNORECASE),
        "severity": "High",
        "detection_type": "Potential Vulnerability",
        "confidence": "Medium",
        "description": "Database XML/XPath error extraction function patterns detected.",
        "impact": "Error-based data exfiltration exposing database metadata and credentials.",
    },
]


def analyze_sqli(req: ParsedRequest) -> List[Dict[str, Any]]:
    findings = []
    targets_to_inspect = []

    # Inspect query parameters
    for param_name, param_val in req.query_params.items():
        targets_to_inspect.append((f"Query parameter '{param_name}'", param_val))

    # Inspect body
    if req.body:
        targets_to_inspect.append(("HTTP Request Body", req.body))

    # Inspect path
    targets_to_inspect.append(("URL Path", req.path))

    # Inspect suspicious headers (User-Agent, Cookie, Referer)
    for h in ["Cookie", "User-Agent", "Referer", "X-Forwarded-For"]:
        val = req.get_header(h)
        if val:
            targets_to_inspect.append((f"HTTP Header '{h}'", val))

    seen_patterns = set()

    for target_label, text in targets_to_inspect:
        if not text:
            continue
        # Also test URL-decoded text
        decoded_text = urllib.parse.unquote_plus(text)
        sample_texts = [text, decoded_text] if text != decoded_text else [text]

        for rule in SQLI_PATTERNS:
            rule_id = f"{rule['name']}:{target_label}"
            if rule_id in seen_patterns:
                continue

            for t in sample_texts:
                match = rule["pattern"].search(t)
                if match:
                    matched_snippet = match.group(0)
                    evidence = f"Matched SQL pattern '{matched_snippet}' in {target_label}."
                    findings.append({
                        "name": rule["name"],
                        "category": "SQL Injection",
                        "severity": rule["severity"],
                        "detection_type": rule["detection_type"],
                        "confidence": rule["confidence"],
                        "description": rule["description"],
                        "evidence": evidence,
                        "affected_target": target_label,
                        "impact": rule["impact"],
                        "detection_limitation": "Static pattern match without database interaction. Confirmed impact requires backend dynamic query execution.",
                        "matched_text": matched_snippet,
                    })
                    seen_patterns.add(rule_id)
                    break

    return findings
