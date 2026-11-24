from typing import List, Dict, Any
from .request_parser import ParsedRequest


def analyze_security_headers(req: ParsedRequest) -> List[Dict[str, Any]]:
    findings = []
    headers = req.headers_lower

    # In HTTP requests, clients or proxied responses may provide security posture indicators.
    # We analyze both missing standard security defensive mechanisms and insecure header settings.

    # 1. Content-Security-Policy
    if "content-security-policy" not in headers:
        findings.append({
            "name": "Missing Content-Security-Policy (CSP) Defense",
            "category": "Missing Security Headers",
            "severity": "Medium",
            "detection_type": "Detected Indicator",
            "confidence": "High",
            "description": "Content-Security-Policy header is absent from configuration. CSP provides robust defense-in-depth against XSS and data injection attacks.",
            "evidence": "No 'Content-Security-Policy' header defined in request/response headers.",
            "affected_target": "HTTP Security Headers",
            "impact": "Increased susceptibility to Cross-Site Scripting (XSS), clickjacking, and unauthorized resource inclusion.",
            "detection_limitation": "Header check on provided request/response headers. Does not verify meta tag CSP in HTML content.",
            "matched_text": "Missing CSP",
        })

    # 2. Strict-Transport-Security (HSTS)
    if "strict-transport-security" not in headers:
        findings.append({
            "name": "Missing Strict-Transport-Security (HSTS)",
            "category": "Missing Security Headers",
            "severity": "Low",
            "detection_type": "Detected Indicator",
            "confidence": "High",
            "description": "HTTP Strict Transport Security (HSTS) header is missing. HSTS enforces HTTPS connections and protects against SSL stripping attacks.",
            "evidence": "Header 'Strict-Transport-Security' is absent.",
            "affected_target": "HTTP Security Headers",
            "impact": "Vulnerability to man-in-the-middle (MITM) downgrade attacks on unencrypted transport layers.",
            "detection_limitation": "Relevant primarily for production HTTPS domains and public endpoints.",
            "matched_text": "Missing HSTS",
        })

    # 3. X-Content-Type-Options
    x_content_type = headers.get("x-content-type-options", "")
    if not x_content_type or "nosniff" not in x_content_type.lower():
        findings.append({
            "name": "Missing X-Content-Type-Options Header",
            "category": "Missing Security Headers",
            "severity": "Low",
            "detection_type": "Detected Indicator",
            "confidence": "High",
            "description": "X-Content-Type-Options header is missing or does not specify 'nosniff'. This allows browsers to MIME-sniff responses away from the declared content type.",
            "evidence": f"X-Content-Type-Options: '{x_content_type or 'None'}' (Expected: 'nosniff').",
            "affected_target": "HTTP Security Headers",
            "impact": "MIME-confusion attacks where user-uploaded text/media files are executed as JavaScript by the browser.",
            "detection_limitation": "Static header inspection.",
            "matched_text": "Missing or invalid X-Content-Type-Options",
        })

    # 4. X-Frame-Options
    x_frame = headers.get("x-frame-options", "")
    if not x_frame or x_frame.lower() not in ["deny", "sameorigin"]:
        findings.append({
            "name": "Missing or Weak X-Frame-Options (Clickjacking Protection)",
            "category": "Missing Security Headers",
            "severity": "Low",
            "detection_type": "Detected Indicator",
            "confidence": "High",
            "description": "X-Frame-Options header is absent or not set to 'DENY' or 'SAMEORIGIN'.",
            "evidence": f"X-Frame-Options: '{x_frame or 'None'}'.",
            "affected_target": "HTTP Security Headers",
            "impact": "Application pages may be embedded in malicious iframes, enabling clickjacking attacks.",
            "detection_limitation": "Frame-ancestors directive in CSP may supersede X-Frame-Options in modern browsers.",
            "matched_text": "Missing X-Frame-Options",
        })

    # 5. Insecure Cookie Flags
    cookie_str = headers.get("cookie", "")
    set_cookie = headers.get("set-cookie", "")
    for c_source, c_val in [("Cookie", cookie_str), ("Set-Cookie", set_cookie)]:
        if c_val and ("session" in c_val.lower() or "auth" in c_val.lower() or "token" in c_val.lower()):
            if "httponly" not in c_val.lower():
                findings.append({
                    "name": "Session Cookie Missing HttpOnly Flag",
                    "category": "Missing Security Headers",
                    "severity": "Medium",
                    "detection_type": "Detected Indicator",
                    "confidence": "Medium",
                    "description": "Session or authentication cookie string lacks the HttpOnly directive.",
                    "evidence": f"Cookie string in '{c_source}' lacks HttpOnly directive.",
                    "affected_target": f"HTTP Header '{c_source}'",
                    "impact": "Session cookies can be accessed by client-side scripts in the event of XSS vulnerabilities.",
                    "detection_limitation": "Evaluated against supplied cookie string.",
                    "matched_text": "Missing HttpOnly",
                })
            if "secure" not in c_val.lower():
                findings.append({
                    "name": "Session Cookie Missing Secure Flag",
                    "category": "Missing Security Headers",
                    "severity": "Medium",
                    "detection_type": "Detected Indicator",
                    "confidence": "Medium",
                    "description": "Authentication cookie string lacks the Secure directive.",
                    "evidence": f"Cookie string in '{c_source}' lacks Secure flag.",
                    "affected_target": f"HTTP Header '{c_source}'",
                    "impact": "Cookies may be transmitted in cleartext over unencrypted HTTP connections.",
                    "detection_limitation": "Evaluated against supplied cookie string.",
                    "matched_text": "Missing Secure flag",
                })

    # 6. CORS Wildcard with credentials
    cors_origin = headers.get("access-control-allow-origin", "")
    cors_creds = headers.get("access-control-allow-credentials", "")
    if cors_origin == "*" and cors_creds.lower() == "true":
        findings.append({
            "name": "Insecure CORS Policy (Wildcard Origin with Credentials)",
            "category": "Missing Security Headers",
            "severity": "High",
            "detection_type": "Potential Vulnerability",
            "confidence": "High",
            "description": "Access-Control-Allow-Origin is configured as wildcard '*' alongside Access-Control-Allow-Credentials: true.",
            "evidence": "Access-Control-Allow-Origin: * with Access-Control-Allow-Credentials: true.",
            "affected_target": "HTTP Security Headers",
            "impact": "Arbitrary external domains may read authenticated private user data via cross-origin AJAX.",
            "detection_limitation": "Evaluated from header values provided in request/response envelope.",
            "matched_text": "CORS wildcard misconfiguration",
        })

    return findings
