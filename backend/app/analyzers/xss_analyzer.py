import re
import urllib.parse
from typing import List, Dict, Any
from .request_parser import ParsedRequest

XSS_PATTERNS = [
    {
        "name": "Cross-Site Scripting (Reflected Script Tag Injection)",
        "pattern": re.compile(r"(?i)(<\s*script[^>]*>.*?<\s*/\s*script\s*>|<\s*script[^>]*>)", re.DOTALL),
        "severity": "High",
        "detection_type": "Potential Vulnerability",
        "confidence": "High",
        "description": "Explicit HTML <script> markup detected within client-supplied inputs.",
        "impact": "Arbitrary JavaScript execution in victim's browser session, session hijacking via cookie theft, DOM defacement.",
    },
    {
        "name": "Cross-Site Scripting (Inline Event Handler Injection)",
        "pattern": re.compile(r"(?i)(<[^>]+(on(load|error|click|mouseover|focus|blur|mouseenter|submit|change|keyup|keydown))\s*=\s*['\"][^'\"]*['\"])", re.IGNORECASE),
        "severity": "High",
        "detection_type": "Potential Vulnerability",
        "confidence": "High",
        "description": "HTML tag with dynamic JavaScript event handler attribute (e.g. onerror=, onload=) found in request input.",
        "impact": "Execution of arbitrary client-side script when the DOM element renders or the event triggers.",
    },
    {
        "name": "Cross-Site Scripting (JavaScript Pseudo-Protocol URI)",
        "pattern": re.compile(r"(?i)(javascript\s*:\s*[^\s\"'<>]+|vbscript\s*:\s*[^\s\"'<>]+)", re.IGNORECASE),
        "severity": "High",
        "detection_type": "Potential Vulnerability",
        "confidence": "High",
        "description": "URI containing 'javascript:' or 'vbscript:' scheme intended to execute arbitrary script when loaded by href or src attributes.",
        "impact": "Client-side code execution during link traversal or dynamic resource inclusion.",
    },
    {
        "name": "Cross-Site Scripting (HTML Tag / Payload Injection)",
        "pattern": re.compile(r"(?i)(<\s*(img|svg|iframe|body|input|audio|video|link|object|embed)\b[^>]*\b(src|href|data|onerror|onload)\s*=[^>]*>)", re.IGNORECASE),
        "severity": "Medium",
        "detection_type": "Detected Indicator",
        "confidence": "Medium",
        "description": "HTML multimedia or embedded element with active payload attributes detected.",
        "impact": "Client-side content spoofing, CSRF induction, or arbitrary payload execution.",
    },
    {
        "name": "Cross-Site Scripting (Dangerous DOM Sinks / Cookie Access)",
        "pattern": re.compile(r"(?i)(document\s*\.\s*cookie|window\s*\.\s*location|localStorage\b|sessionStorage\b|eval\s*\(|alert\s*\(|confirm\s*\(|prompt\s*\()", re.IGNORECASE),
        "severity": "Medium",
        "detection_type": "Detected Indicator",
        "confidence": "Medium",
        "description": "DOM credential accessors (document.cookie) or execution sinks (eval, alert) detected in input parameters.",
        "impact": "Stealing sensitive session tokens, token leakage to external domains.",
    },
]


def analyze_xss(req: ParsedRequest) -> List[Dict[str, Any]]:
    findings = []
    targets_to_inspect = []

    for p_name, p_val in req.query_params.items():
        targets_to_inspect.append((f"Query parameter '{p_name}'", p_val))

    if req.body:
        targets_to_inspect.append(("HTTP Request Body", req.body))

    for h in ["Referer", "User-Agent", "Cookie"]:
        val = req.get_header(h)
        if val:
            targets_to_inspect.append((f"HTTP Header '{h}'", val))

    seen = set()

    for target_label, text in targets_to_inspect:
        if not text:
            continue
        decoded = urllib.parse.unquote_plus(text)
        samples = [text, decoded] if text != decoded else [text]

        for rule in XSS_PATTERNS:
            rule_id = f"{rule['name']}:{target_label}"
            if rule_id in seen:
                continue

            for t in samples:
                match = rule["pattern"].search(t)
                if match:
                    snippet = match.group(0)[:80]
                    findings.append({
                        "name": rule["name"],
                        "category": "Cross-Site Scripting",
                        "severity": rule["severity"],
                        "detection_type": rule["detection_type"],
                        "confidence": rule["confidence"],
                        "description": rule["description"],
                        "evidence": f"Found XSS indicator '{snippet}' in {target_label}.",
                        "affected_target": target_label,
                        "impact": rule["impact"],
                        "detection_limitation": "Static heuristic detection. Actual exploitability depends on lack of contextual output encoding and browser rendering contexts.",
                        "matched_text": snippet,
                    })
                    seen.add(rule_id)
                    break

    return findings
