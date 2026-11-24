import re
import urllib.parse
from typing import List, Dict, Any
from .request_parser import ParsedRequest

TRAVERSAL_PATTERNS = [
    {
        "name": "Path Traversal (Directory Traversal Sequences)",
        "pattern": re.compile(r"(\.\.[\\/]|%2e%2e[%2f%5c]|\.\.%2f|\.\.%5c|%252e%252e)", re.IGNORECASE),
        "severity": "High",
        "detection_type": "Potential Vulnerability",
        "confidence": "High",
        "description": "Relative directory climb sequences ('../' or encoded equivalents) detected, designed to escape intended root directories.",
        "impact": "Arbitrary file read on the server filesystem, exposing configuration files, source code, and credentials.",
    },
    {
        "name": "Path Traversal (Critical System File Access)",
        "pattern": re.compile(r"(?i)(/etc/(passwd|shadow|hosts|group|issue)|/proc/self/environ|[a-zA-Z]:[\\/](windows|winnt)[\\/]|boot\.ini|win\.ini)", re.IGNORECASE),
        "severity": "Critical",
        "detection_type": "Potential Vulnerability",
        "confidence": "High",
        "description": "Direct reference to known sensitive operating system configuration files detected.",
        "impact": "Severe exposure of OS user accounts, system configuration, hashes, or environment secrets.",
    },
    {
        "name": "Path Traversal (Null Byte File Extension Bypass)",
        "pattern": re.compile(r"(%00|\x00|\\0)", re.IGNORECASE),
        "severity": "Medium",
        "detection_type": "Detected Indicator",
        "confidence": "Medium",
        "description": "Null byte injection indicator detected, historically used to truncate filename extensions in file APIs.",
        "impact": "File extension filter bypass enabling unexpected file inclusion or reading.",
    },
]


def analyze_traversal(req: ParsedRequest) -> List[Dict[str, Any]]:
    findings = []
    targets_to_inspect = []

    # Inspect path
    targets_to_inspect.append(("URL Path", req.path))

    # Inspect query parameters
    for p_name, p_val in req.query_params.items():
        targets_to_inspect.append((f"Query parameter '{p_name}'", p_val))

    # Inspect body
    if req.body:
        targets_to_inspect.append(("HTTP Request Body", req.body))

    seen = set()

    for target_label, text in targets_to_inspect:
        if not text:
            continue
        decoded = urllib.parse.unquote_plus(text)
        samples = [text, decoded] if text != decoded else [text]

        for rule in TRAVERSAL_PATTERNS:
            rule_id = f"{rule['name']}:{target_label}"
            if rule_id in seen:
                continue

            for t in samples:
                match = rule["pattern"].search(t)
                if match:
                    snippet = match.group(0)[:80]
                    findings.append({
                        "name": rule["name"],
                        "category": "Path Traversal",
                        "severity": rule["severity"],
                        "detection_type": rule["detection_type"],
                        "confidence": rule["confidence"],
                        "description": rule["description"],
                        "evidence": f"Found traversal pattern '{snippet}' in {target_label}.",
                        "affected_target": target_label,
                        "impact": rule["impact"],
                        "detection_limitation": "Static pattern detected. Exploitation requires vulnerable file read/write operations without path canonicalization.",
                        "matched_text": snippet,
                    })
                    seen.add(rule_id)
                    break

    return findings
