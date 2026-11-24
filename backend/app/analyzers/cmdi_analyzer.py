import re
import urllib.parse
from typing import List, Dict, Any
from .request_parser import ParsedRequest

CMDI_PATTERNS = [
    {
        "name": "Command Injection (System Shell Chaining & Execution)",
        "pattern": re.compile(r"(?i)(;|\|{1,2}|&{1,2}|`|\$\([^\)]*\))\s*(cat\s+/|whoami|id\b|uname|bash|sh\b|cmd\.exe|powershell|curl\s+|wget\s+|nc\s+|ping\s+(-c|-n)?\s*\d+)", re.IGNORECASE),
        "severity": "Critical",
        "detection_type": "Potential Vulnerability",
        "confidence": "High",
        "description": "Shell control metacharacters (; | &&) concatenated with system OS binary commands detected.",
        "impact": "Remote code execution on host operating system with permissions of the web service account.",
    },
    {
        "name": "Command Injection (Shell Metacharacter Payload)",
        "pattern": re.compile(r"(?i)(\bwhoami\b|\bid\b\s*$|\buname\s+-a\b|cat\s+/etc/passwd|type\s+C:\\windows|\bpowershell\s+-enc|\bcmd\.exe\s+/c)", re.IGNORECASE),
        "severity": "High",
        "detection_type": "Detected Indicator",
        "confidence": "Medium",
        "description": "Operating system diagnostic or enumeration commands identified in input.",
        "impact": "Host inspection, reconnaissance, privilege escalation, or unauthorized process spawning.",
    },
    {
        "name": "Command Injection (Command Substitution Expression)",
        "pattern": re.compile(r"(`[^`]+`|\$\([a-zA-Z0-9_\-\s]+\))", re.IGNORECASE),
        "severity": "High",
        "detection_type": "Detected Indicator",
        "confidence": "Medium",
        "description": "POSIX/Bash backtick or dollar-parenthesis $(...) subshell substitution syntax found.",
        "impact": "Evaluation of nested command strings before primary command execution.",
    },
    {
        "name": "Command Injection (Suspicious Shell Redirection / Piping)",
        "pattern": re.compile(r"(\|\s*[a-zA-Z0-9_\-\./]+|>\s*/dev/null|2>&1|/dev/tcp/)", re.IGNORECASE),
        "severity": "Medium",
        "detection_type": "Detected Indicator",
        "confidence": "Medium",
        "description": "Shell stream redirection or network pipe patterns detected.",
        "impact": "Reverse shell establishment or output redirection.",
    },
]


def analyze_cmdi(req: ParsedRequest) -> List[Dict[str, Any]]:
    findings = []
    targets_to_inspect = []

    for p_name, p_val in req.query_params.items():
        targets_to_inspect.append((f"Query parameter '{p_name}'", p_val))

    if req.body:
        targets_to_inspect.append(("HTTP Request Body", req.body))

    for h in ["User-Agent", "X-Forwarded-Host", "Referer"]:
        val = req.get_header(h)
        if val:
            targets_to_inspect.append((f"HTTP Header '{h}'", val))

    seen = set()

    for target_label, text in targets_to_inspect:
        if not text:
            continue
        decoded = urllib.parse.unquote_plus(text)
        samples = [text, decoded] if text != decoded else [text]

        for rule in CMDI_PATTERNS:
            rule_id = f"{rule['name']}:{target_label}"
            if rule_id in seen:
                continue

            for t in samples:
                match = rule["pattern"].search(t)
                if match:
                    snippet = match.group(0)[:80]
                    findings.append({
                        "name": rule["name"],
                        "category": "Command Injection",
                        "severity": rule["severity"],
                        "detection_type": rule["detection_type"],
                        "confidence": rule["confidence"],
                        "description": rule["description"],
                        "evidence": f"Detected command injection pattern '{snippet}' in {target_label}.",
                        "affected_target": target_label,
                        "impact": rule["impact"],
                        "detection_limitation": "Static string analysis. Vulnerability triggers only if backend passes untrusted string to os.system, subprocess(shell=True), or exec.",
                        "matched_text": snippet,
                    })
                    seen.add(rule_id)
                    break

    return findings
