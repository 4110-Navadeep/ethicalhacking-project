from typing import Dict, Any

REMEDIATION_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "SQL Injection": {
        "title": "SQL Injection Remediation Guidance",
        "description": "SQL Injection arises when untrusted client inputs are directly concatenated or formatted into backend SQL query strings without sanitization or parameter binding.",
        "why_it_occurs": "The database interpreter fails to distinguish between data values supplied by the user and control code intended by the developer.",
        "impact": "Full database bypass, data exfiltration of passwords, credit cards, user tables, arbitrary data modification, or administrative privilege escalation.",
        "recommended_remediation": "Mandate parameterized queries (prepared statements) or Object-Relational Mappers (ORMs) across all database interaction layers. Never concatenate strings into SQL commands.",
        "prevention_techniques": [
            "Use parameterized SQL queries (Prepared Statements) with strict type bindings.",
            "Employ mature ORMs (e.g., SQLAlchemy, Hibernate, Entity Framework) using proper query building.",
            "Enforce least-privilege principles on database user accounts (deny DROP, GRANT, and EXEC permissions to web accounts).",
            "Apply strict input validation with allow-lists (whitelisting) for table/column names.",
            "Disable detailed database error messages in production responses."
        ],
        "secure_coding_example": """# SECURE PYTHON EXAMPLE (Using SQLAlchemy / Parameterized Queries)
from sqlalchemy import text
from app.database import engine

def get_user_profile(user_input: str):
    # Parameterized query: User input is bound safely as a data literal, NOT SQL code
    query = text("SELECT id, username, email FROM users WHERE username = :name")
    with engine.connect() as conn:
        result = conn.execute(query, {"name": user_input})
        return result.fetchone()""",
    },
    "Cross-Site Scripting": {
        "title": "Cross-Site Scripting (XSS) Remediation Guidance",
        "description": "Cross-Site Scripting occurs when unvalidated or unescaped user-supplied input is embedded directly into web pages rendered by a victim's browser.",
        "why_it_occurs": "The browser interprets untrusted strings as executable HTML markup, inline JavaScript, or event handler attributes.",
        "impact": "Account takeover via session cookie extraction, unauthorized actions performed on behalf of victim users, site defacement, and credential phishing.",
        "recommended_remediation": "Apply context-aware output encoding (HTML, JavaScript, Attribute, CSS contexts) before rendering user data. Implement a strong Content Security Policy (CSP).",
        "prevention_techniques": [
            "Use modern reactive frameworks (React, Vue, Angular) that auto-encode content by default (avoid dangerouslySetInnerHTML).",
            "Deploy a restrictive Content-Security-Policy (CSP) that disables 'unsafe-inline' and 'unsafe-eval'.",
            "Store session identifiers in 'HttpOnly' and 'Secure' cookies to prevent JavaScript access.",
            "Sanitize any required rich text markup using battle-tested sanitizers like DOMPurify.",
            "Validate and sanitize input on the server side using strict character allowlists."
        ],
        "secure_coding_example": """// SECURE JAVASCRIPT / REACT EXAMPLE
import DOMPurify from 'dompurify';

// Safe rendering in React automatically encodes plain text:
function SafeUserComment({ commentText }) {
  // Plain text is safely auto-escaped by React JSX:
  return <div className="comment-body">{commentText}</div>;
}

// If HTML formatting MUST be supported, sanitize thoroughly:
function SafeHtmlContent({ untrustedHtml }) {
  const cleanHtml = DOMPurify.sanitize(untrustedHtml, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'] });
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}""",
    },
    "Command Injection": {
        "title": "Command Injection Remediation Guidance",
        "description": "Command injection occurs when untrusted input is passed to system shell execution APIs without strict sanitization or argument separation.",
        "why_it_occurs": "Shell metacharacters (;, |, &&, backticks, redirection) allow an attacker to append arbitrary OS commands executed with the privileges of the web process.",
        "impact": "Total remote operating system compromise, reverse shell access, internal network pivot, and host file destruction.",
        "recommended_remediation": "Avoid invoking operating system shells entirely. Use native language runtime APIs, or invoke subprocesses passing arguments as an immutable array with shell=False.",
        "prevention_techniques": [
            "Replace shell execution with built-in programming language libraries (e.g., use os.listdir or shutil instead of calling 'ls' or 'rm').",
            "If external binaries must be called, use subprocess.run with shell=False and pass arguments as a list of strings.",
            "Validate all inputs against an uncompromising whitelist of expected values (e.g., alphanumeric only).",
            "Run application containers and services under a dedicated non-root, unprivileged system user with minimal filesystem rights."
        ],
        "secure_coding_example": """# SECURE PYTHON SUBPROCESS EXAMPLE
import subprocess
import ipaddress

def ping_host_safely(target_ip_str: str):
    # 1. Strictly validate the input before using
    try:
        ip = ipaddress.ip_address(target_ip_str)
    except ValueError:
        raise ValueError("Invalid IP address format")

    # 2. Never invoke shell=True. Pass executable and arguments as an array.
    # Metacharacters like ';', '|', '&&' are treated as literal arguments, not shell commands.
    command = ["ping", "-c", "2", str(ip)]
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    return result.stdout""",
    },
    "Path Traversal": {
        "title": "Path Traversal Remediation Guidance",
        "description": "Path Traversal (directory traversal) vulnerabilities occur when file system paths are assembled using untrusted input without resolving canonical absolute paths.",
        "why_it_occurs": "Sequences such as '../' or encoded variants allow traversal outside the intended application base directory into system root directories.",
        "impact": "Arbitrary file disclosure (passwords, private SSH keys, database credentials, server configuration files) or arbitrary file upload/overwrite.",
        "recommended_remediation": "Normalize and resolve canonical paths using filesystem APIs. Verify that the resolved absolute path starts strictly within the designated safe root directory.",
        "prevention_techniques": [
            "Use os.path.realpath / Path.resolve() to resolve canonical absolute paths.",
            "Verify that the target path starts strictly with the base directory path (e.g., os.path.commonpath check).",
            "Extract only the basename (os.path.basename) or use an indirect lookup table / database primary key instead of file paths.",
            "Store uploaded or downloadable files in isolated cloud object storage (e.g., S3/GCS buckets) rather than the local filesystem."
        ],
        "secure_coding_example": """# SECURE PYTHON PATH CANONICALIZATION EXAMPLE
import os
from pathlib import Path

BASE_STORAGE_DIR = Path("/var/app/safe_storage").resolve()

def get_safe_file_path(user_supplied_filename: str) -> Path:
    # 1. Strip directory traversal characters using basename
    safe_name = os.path.basename(user_supplied_filename)
    
    # 2. Build and resolve canonical absolute path
    resolved_path = (BASE_STORAGE_DIR / safe_name).resolve()
    
    # 3. Security boundary check: ensure resolved path is inside safe directory
    if not str(resolved_path).startswith(str(BASE_STORAGE_DIR)):
        raise PermissionError("Access denied: Path traversal detected")
        
    return resolved_path""",
    },
    "Insecure Direct Object Reference": {
        "title": "Insecure Direct Object Reference (IDOR) Remediation Guidance",
        "description": "IDOR occurs when an application exposes a direct reference to an internal implementation object (database ID, account number) without verifying user authorization.",
        "why_it_occurs": "The server relies on the client providing an ID without checking whether the authenticated session user actually owns or is permitted to access that specific entity.",
        "impact": "Unauthorized access to other users' private accounts, financial transactions, medical records, invoices, or administrative modification.",
        "recommended_remediation": "Enforce object-level access control on every request. Implement indirect reference maps or session-scoped database queries that include the active user ID.",
        "prevention_techniques": [
            "Enforce tenant and user-level authorization checks at the data layer for every single request.",
            "Bind database queries to the authenticated session context (e.g., WHERE id = :id AND user_id = :session_user_id).",
            "Use cryptographically secure unguessable identifiers (UUIDv4) instead of sequential integers.",
            "Implement Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) decorators on API endpoints."
        ],
        "secure_coding_example": """# SECURE FASTAPI / PYTHON OBJECT-LEVEL ACCESS CONTROL
from fastapi import APIRouter, Depends, HTTPException, status
from app.models import User, Invoice

router = APIRouter()

@router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, current_user: User = Depends(get_current_authenticated_user)):
    # Crucial: Always filter by the authenticated user's ID, not just the requested invoice_id
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id  # Prevents IDOR
    ).first()

    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    return invoice""",
    },
    "Missing Security Headers": {
        "title": "HTTP Security Headers Remediation Guidance",
        "description": "Missing defensive HTTP headers leaves web applications vulnerable to client-side attacks such as MIME-sniffing, clickjacking, and cross-site scripting.",
        "why_it_occurs": "Web servers and application frameworks often default to minimal headers without enabling modern browser defense mechanisms.",
        "impact": "MIME-confusion exploits, iframe clickjacking, SSL stripping, and increased exploitability of client-side bugs.",
        "recommended_remediation": "Configure standard security headers across web server configurations (Nginx, Apache) or application middleware (FastAPI, Express).",
        "prevention_techniques": [
            "Set 'Content-Security-Policy' with restrictive default-src 'self' directives.",
            "Set 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'.",
            "Set 'X-Content-Type-Options: nosniff' on all responses.",
            "Set 'X-Frame-Options: DENY' or use CSP 'frame-ancestors 'none''.",
            "Configure cookies with 'Secure; HttpOnly; SameSite=Strict' flags.",
            "Set 'Referrer-Policy: strict-origin-when-cross-origin'."
        ],
        "secure_coding_example": """# FASTAPI SECURITY HEADERS MIDDLEWARE EXAMPLE
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; object-src 'none';"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response""",
    },
    "Sensitive Information Exposure": {
        "title": "Sensitive Information Exposure Remediation Guidance",
        "description": "Sensitive Information Exposure occurs when secrets, credentials, tokens, or system internal architecture are disclosed in HTTP requests, headers, or error responses.",
        "why_it_occurs": "Passing secrets in query parameters, logging requests indiscriminately, or displaying unhandled stack traces and software banners in production.",
        "impact": "Account takeover, token hijacking from proxy logs or browser histories, and targeted exploitation of discovered software components.",
        "recommended_remediation": "Transmit sensitive credentials strictly in the Authorization header or secure HTTP-only cookies via encrypted HTTPS. Mask secrets and sanitize server banners.",
        "prevention_techniques": [
            "Never transmit API keys, passwords, or session tokens in URL query strings.",
            "Strip server identification banners (Server, X-Powered-By) in web server configurations.",
            "Disable debug mode and detailed stack traces in production environments.",
            "Use environment variables or secure key vaults for database credentials; never leak connection strings.",
            "Implement standardized generic error responses for client endpoints."
        ],
        "secure_coding_example": """# SECURE AUTHENTICATION HEADER TRANSMISSION (Client / Server)
# Client-side: Pass credentials safely in the Authorization header over HTTPS
headers = {
    "Authorization": f"Bearer {auth_token}",
    "Content-Type": "application/json"
}
# NEVER: requests.get(f"https://api.example.com/data?token={auth_token}")

# Server-side: Disable framework banner in FastAPI / Uvicorn:
# uvicorn main:app --server-header=False --date-header=False""",
    },
    "Input Validation": {
        "title": "Input Validation & Sanitization Guidance",
        "description": "Input validation ensures that incoming application data conforms to expected formats, character sets, and types before processing.",
        "why_it_occurs": "Relying on client-side validation alone or accepting arbitrary unstructured input formats.",
        "impact": "Buffer overflows, prototype pollution, data corruption, and downstream logic errors.",
        "recommended_remediation": "Apply schema-based validation using Pydantic, Zod, or Joi on all request payloads. Validate types, lengths, and expected character regexes.",
        "prevention_techniques": [
            "Use strict schema validation libraries (e.g. Pydantic in Python, Zod in TypeScript).",
            "Validate length, numeric bounds, and character whitelists for every field.",
            "Freeze object prototypes in JavaScript environments to prevent prototype pollution (Object.freeze(Object.prototype)).",
            "Reject unexpected properties in JSON request bodies."
        ],
        "secure_coding_example": """# SECURE PYDANTIC SCHEMA VALIDATION EXAMPLE
from pydantic import BaseModel, Field, EmailStr

class UserRegistrationSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_-]+$")
    email: EmailStr
    age: int = Field(..., ge=18, le=120)

    class Config:
        extra = "forbid"  # Reject any unexpected or prototype-mutating fields""",
    },
}


def get_remediation_for_finding(category: str, finding_name: str = "") -> Dict[str, Any]:
    """
    Returns structured remediation details and code examples based on category.
    """
    # Match category directly or by keyword
    for key, data in REMEDIATION_KNOWLEDGE_BASE.items():
        if key.lower() in category.lower() or category.lower() in key.lower():
            return data

    # Default fallback remediation
    return {
        "title": f"Security Remediation for {category}",
        "description": "General security remediation guidance for identified web application indicator.",
        "why_it_occurs": "Untrusted input handling or non-compliant configuration within the application stack.",
        "impact": "Potential compromise of system confidentiality, integrity, or availability.",
        "recommended_remediation": "Apply defense-in-depth principles: validate all inputs, encode all outputs, and enforce strict authorization.",
        "prevention_techniques": [
            "Implement strict input validation against positive allow-lists.",
            "Enforce least-privilege access controls.",
            "Keep libraries and framework dependencies updated.",
            "Perform regular automated and manual code reviews."
        ],
        "secure_coding_example": """# SECURE CODING PRACTICE
# 1. Validate inputs with strict schemas
# 2. Never trust client-supplied identity or permissions
# 3. Keep error messages generic in production""",
    }
