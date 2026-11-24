import re
from typing import List, Dict, Any
from .request_parser import ParsedRequest

IDOR_PATH_REGEX = re.compile(r"/(users?|accounts?|invoices?|orders?|documents?|profiles?|reports?|files?|customers?)/(\d+)\b", re.IGNORECASE)
PRIVILEGE_PARAM_REGEX = re.compile(r"(?i)^(is_admin|is_superuser|role|privilege|account_role|user_type)$")
OBJECT_PARAM_REGEX = re.compile(r"(?i)^(user_?id|account_?id|doc_?id|invoice_?id|order_?id|customer_?id|file_?id)$")


def analyze_idor(req: ParsedRequest) -> List[Dict[str, Any]]:
    findings = []
    has_auth_header = bool(req.get_header("Authorization") or req.get_header("Cookie"))

    # Check path for direct sequential numeric identifiers
    path_match = IDOR_PATH_REGEX.search(req.path)
    if path_match:
        resource_type = path_match.group(1)
        object_id = path_match.group(2)
        auth_note = "without authorization headers" if not has_auth_header else "with authorization header"
        findings.append({
            "name": "Potential Insecure Direct Object Reference (IDOR Indicator)",
            "category": "Insecure Direct Object Reference",
            "severity": "Medium" if has_auth_header else "High",
            "detection_type": "Detected Indicator",
            "confidence": "Medium",
            "description": f"Direct sequential object identifier ('{object_id}') detected in endpoint resource path for entity '{resource_type}'. If access control is missing at the object level, other users' data can be enumerated.",
            "evidence": f"URL Path '{req.path}' exposes sequential resource '{resource_type}/{object_id}' ({auth_note}).",
            "affected_target": f"Path resource '{resource_type}/{object_id}'",
            "impact": "Horizontal or vertical privilege escalation, unauthorized access to another user's personal records or business data.",
            "detection_limitation": "Heuristic indicator based on URI structure. IDOR can only be confirmed by verifying whether the backend validates current session ownership of object ID.",
            "matched_text": path_match.group(0),
        })

    # Check query params for object ID references
    for param_name, param_val in req.query_params.items():
        if OBJECT_PARAM_REGEX.match(param_name):
            if param_val.isdigit():
                findings.append({
                    "name": "Direct Object Reference Parameter Detected",
                    "category": "Insecure Direct Object Reference",
                    "severity": "Medium",
                    "detection_type": "Detected Indicator",
                    "confidence": "Medium",
                    "description": f"Predictable direct object parameter '{param_name}' containing numeric ID '{param_val}' found.",
                    "evidence": f"Query parameter '{param_name}={param_val}' uses sequential direct object reference.",
                    "affected_target": f"Query parameter '{param_name}'",
                    "impact": "Potential unauthorized data modification or viewing via parameter tampering.",
                    "detection_limitation": "Static heuristic. Relies on whether backend enforces tenant/user object ownership checks.",
                    "matched_text": f"{param_name}={param_val}",
                })

        # Check for privilege escalation tampering parameters
        if PRIVILEGE_PARAM_REGEX.match(param_name):
            findings.append({
                "name": "Privileged Role / Authorization Parameter Tampering",
                "category": "Insecure Direct Object Reference",
                "severity": "High",
                "detection_type": "Potential Vulnerability",
                "confidence": "High",
                "description": f"Client-supplied privilege parameter '{param_name}={param_val}' detected. Authorization levels must never be assigned from client input.",
                "evidence": f"Parameter '{param_name}' passed with value '{param_val}'.",
                "affected_target": f"Parameter '{param_name}'",
                "impact": "Vertical privilege escalation to administrative or elevated system roles.",
                "detection_limitation": "Indicator based on parameter nomenclature. Exploitable if server binds client input directly to user privilege model.",
                "matched_text": f"{param_name}={param_val}",
            })

    return findings
