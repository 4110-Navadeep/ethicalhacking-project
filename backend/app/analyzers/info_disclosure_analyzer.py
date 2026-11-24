import re
import urllib.parse
from typing import List, Dict, Any
from .request_parser import ParsedRequest

SERVER_BANNER_REGEX = re.compile(r"(?i)(Apache|Nginx|Microsoft-IIS|LiteSpeed|Express|PHP|ASP\.NET)/[\d\.]+")
CREDENTIAL_PARAM_REGEX = re.compile(r"(?i)^(pass(word)?|secret|token|api_?key|access_?token|auth_?token|client_?secret)$")
JWT_REGEX = re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")
INTERNAL_IP_REGEX = re.compile(r"\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b")
DB_CONN_REGEX = re.compile(r"(?i)(postgres|mysql|mongodb|redis|mssql)://[^\s\"']+")
PROTOTYPE_POLLUTION_REGEX = re.compile(r"(__proto__|constructor\[\"prototype\"\]|prototype\.)")


def analyze_info_disclosure(req: ParsedRequest) -> List[Dict[str, Any]]:
    findings = []

    # 1. Credentials or Tokens in GET Query String
    for p_name, p_val in req.query_params.items():
        if CREDENTIAL_PARAM_REGEX.match(p_name):
            findings.append({
                "name": "Sensitive Credential Exposed in Query Parameter",
                "category": "Sensitive Information Exposure",
                "severity": "High",
                "detection_type": "Potential Vulnerability",
                "confidence": "High",
                "description": f"Sensitive authentication or secret credential found in query parameter '{p_name}'. Query parameters are stored in server logs, browser history, and proxy logs.",
                "evidence": f"Query parameter '{p_name}' contains sensitive value fragment '{p_val[:10]}...'.",
                "affected_target": f"Query parameter '{p_name}'",
                "impact": "Credential compromise via proxy logs, web server access logs, Referer headers, and browser histories.",
                "detection_limitation": "Static heuristic pattern match on query parameter key name.",
                "matched_text": f"{p_name}={p_val[:10]}...",
            })

        if JWT_REGEX.search(p_val):
            findings.append({
                "name": "JSON Web Token (JWT) Exposed in URL Query String",
                "category": "Sensitive Information Exposure",
                "severity": "High",
                "detection_type": "Potential Vulnerability",
                "confidence": "High",
                "description": f"A JSON Web Token (JWT) structure was detected inside query parameter '{p_name}'. Sensitive tokens should be transmitted in the Authorization header or secure cookies.",
                "evidence": f"JWT pattern found in query parameter '{p_name}'.",
                "affected_target": f"Query parameter '{p_name}'",
                "impact": "Replay attacks, session hijacking, and token harvesting from intermediary caching proxies.",
                "detection_limitation": "Token format identified by base64url header.payload.signature structure.",
                "matched_text": p_val[:25] + "...",
            })

    # 2. Server Software Version Disclosure
    server_hdr = req.get_header("Server")
    powered_by = req.get_header("X-Powered-By")
    for hdr_name, hdr_val in [("Server", server_hdr), ("X-Powered-By", powered_by)]:
        if hdr_val and SERVER_BANNER_REGEX.search(hdr_val):
            findings.append({
                "name": f"Server Software Version Disclosure ({hdr_name})",
                "category": "Sensitive Information Exposure",
                "severity": "Low",
                "detection_type": "Detected Indicator",
                "confidence": "High",
                "description": f"The '{hdr_name}' header discloses detailed web server and framework version information ('{hdr_val}').",
                "evidence": f"{hdr_name}: {hdr_val}",
                "affected_target": f"HTTP Header '{hdr_name}'",
                "impact": "Facilitates targeted vulnerability research against known CVEs for the specific version.",
                "detection_limitation": "Header inspection. Server banner might be spoofed.",
                "matched_text": hdr_val,
            })

    # 3. Database Connection String in Body or Query
    text_corpus = f"{req.raw_text} {req.body}"
    db_match = DB_CONN_REGEX.search(text_corpus)
    if db_match:
        findings.append({
            "name": "Database Connection String Leaked in Request",
            "category": "Sensitive Information Exposure",
            "severity": "Critical",
            "detection_type": "Potential Vulnerability",
            "confidence": "High",
            "description": "Database connection URI containing protocol and credentials exposed in request data.",
            "evidence": f"Connection URI pattern: '{db_match.group(0)[:30]}...'",
            "affected_target": "Request payload",
            "impact": "Direct compromise of backend database access and total data breach.",
            "detection_limitation": "Pattern matching on URI scheme.",
            "matched_text": db_match.group(0)[:30],
        })

    # 4. Internal RFC1918 Private IP Address Disclosure
    ip_match = INTERNAL_IP_REGEX.search(text_corpus)
    if ip_match and not ip_match.group(0).startswith("127.0.0.1"):
        findings.append({
            "name": "Internal Private IP Address Disclosure",
            "category": "Sensitive Information Exposure",
            "severity": "Low",
            "detection_type": "Detected Indicator",
            "confidence": "Medium",
            "description": f"Internal private IP address ('{ip_match.group(0)}') identified in request data.",
            "evidence": f"Internal IP '{ip_match.group(0)}' revealed in request payload.",
            "affected_target": "Request payload",
            "impact": "Internal network topology reconnaissance aiding lateral movement.",
            "detection_limitation": "Regex match for private IPv4 blocks.",
            "matched_text": ip_match.group(0),
        })

    # 5. Prototype Pollution Indicators
    proto_match = PROTOTYPE_POLLUTION_REGEX.search(text_corpus)
    if proto_match:
        findings.append({
            "name": "Prototype Pollution Indicator in Input",
            "category": "Input Validation",
            "severity": "Medium",
            "detection_type": "Detected Indicator",
            "confidence": "High",
            "description": f"Object prototype mutation string ('{proto_match.group(0)}') detected in input payload.",
            "evidence": f"Found '{proto_match.group(0)}' in request data.",
            "affected_target": "Request payload",
            "impact": "Denial of service or remote code execution in Node.js / JavaScript application runtimes.",
            "detection_limitation": "Static pattern match. Requires vulnerable recursive object merge in application logic.",
            "matched_text": proto_match.group(0),
        })

    return findings
