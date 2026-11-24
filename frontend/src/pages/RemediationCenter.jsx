import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import {
  FileCheck2,
  ShieldCheck,
  Code,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const REMEDIATION_GUIDES = [
  {
    category: 'SQL Injection',
    title: 'Defensive SQL Query Parameterization',
    why_it_occurs:
      'Occurs when untrusted client inputs are concatenated directly into SQL command strings without parameter binding.',
    impact:
      'Complete unauthorized database dump, authentication bypass, data destruction, and potential OS command execution.',
    remediation:
      'Use parameterized queries (prepared statements) or ORMs for all database queries. Never format or concatenate strings into SQL statements.',
    prevention_techniques: [
      'Employ Prepared Statements with strictly bound parameter types.',
      'Utilize established ORMs like SQLAlchemy, Hibernate, or Entity Framework.',
      'Apply database least-privilege permissions (deny DROP, GRANT, and EXEC to web service accounts).',
      'Validate and whitelist sorting columns and table identifiers.',
    ],
    code_example: `# SECURE PYTHON PARAMETERIZED QUERY (SQLAlchemy / raw DB-API)
from sqlalchemy import text

def get_user_by_name(conn, username: str):
    # Parameter is treated as pure literal data, preventing syntax manipulation
    stmt = text("SELECT id, username, email FROM users WHERE username = :uname")
    return conn.execute(stmt, {"uname": username}).fetchone()`,
  },
  {
    category: 'Cross-Site Scripting',
    title: 'Context-Aware Output Encoding & CSP',
    why_it_occurs:
      'Web application reflects untrusted input directly into HTML without context-aware encoding or sanitizer validation.',
    impact:
      'Execution of arbitrary scripts in victim browsers, session cookie theft, unauthorized user impersonation, and site defacement.',
    remediation:
      'Apply context-aware output encoding (HTML body, attributes, JavaScript variables). Enforce strict Content Security Policy (CSP).',
    prevention_techniques: [
      'Use modern frontend frameworks (React, Vue) that auto-encode output by default.',
      'Deploy strict Content-Security-Policy (CSP) headers without unsafe-inline or unsafe-eval.',
      'Store sensitive session cookies with HttpOnly and Secure flags.',
      'Sanitize user-provided HTML with DOMPurify before rendering.',
    ],
    code_example: `// SECURE REACT COMPONENT RENDERING
import DOMPurify from 'dompurify';

// 1. React JSX auto-encodes strings safely:
export function UserComment({ text }) {
  return <p className="comment-text">{text}</p>;
}

// 2. If HTML is required, sanitize strictly:
export function RichHtmlViewer({ rawHtml }) {
  const clean = DOMPurify.sanitize(rawHtml, { ALLOWED_TAGS: ['b', 'i', 'p'] });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}`,
  },
  {
    category: 'Command Injection',
    title: 'Safe Process Execution Without OS Shells',
    why_it_occurs:
      'Passing unvalidated input directly to system shell interpreters (system(), popen(), or subprocess(shell=True)).',
    impact:
      'Total remote host takeover, reverse shell execution, internal network pivoting, and filesystem destruction.',
    remediation:
      'Avoid invoking the operating system shell. Use language runtime APIs, or pass arguments as an immutable array with shell=False.',
    prevention_techniques: [
      'Use built-in platform APIs (e.g. shutil, os.listdir) instead of spawning OS shell commands.',
      'When invoking external binaries, pass arguments as a list of strings with shell=False.',
      'Validate input against strict allow-lists (e.g. valid IP address or numeric identifier).',
      'Execute application processes under an unprivileged user account.',
    ],
    code_example: `# SECURE PYTHON PROCESS SPAWNING
import subprocess
import ipaddress

def ping_host_safely(ip_string: str):
    # Strict validation prevents argument injection
    validated_ip = ipaddress.ip_address(ip_string)

    # Invoked with shell=False; arguments passed as discrete array
    cmd = ["ping", "-c", "2", str(validated_ip)]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return result.stdout`,
  },
  {
    category: 'Path Traversal',
    title: 'Filesystem Path Canonicalization & Boundary Validation',
    why_it_occurs:
      'Assembling file access paths using user inputs without verifying that the resolved path stays within the base storage folder.',
    impact:
      'Arbitrary file disclosure (system credentials, /etc/passwd, configuration tokens, private source code).',
    remediation:
      'Resolve the canonical path using Path.resolve() and verify that it strictly starts with the designated safe root directory path.',
    prevention_techniques: [
      'Extract only the filename using os.path.basename before combining paths.',
      'Resolve paths to canonical absolute form and assert commonpath boundary.',
      'Store downloadable files in cloud object stores (S3, GCS) instead of local disks.',
      'Use indirect database IDs or UUIDs to map to stored assets.',
    ],
    code_example: `# SECURE PATH BOUNDARY CHECK IN PYTHON
from pathlib import Path
import os

BASE_DIR = Path("/var/app/data/uploads").resolve()

def get_safe_file(user_filename: str) -> Path:
    safe_name = os.path.basename(user_filename)
    full_path = (BASE_DIR / safe_name).resolve()

    if not str(full_path).startswith(str(BASE_DIR)):
        raise PermissionError("Access denied: Traversal sequence blocked")
    return full_path`,
  },
  {
    category: 'Insecure Direct Object Reference',
    title: 'Object-Level Authorization Enforcement',
    why_it_occurs:
      'Relying on client-supplied entity identifiers without verifying that the active session user has permission to access that specific record.',
    impact:
      'Horizontal or vertical privilege escalation; accessing other users invoices, profile data, or business transactions.',
    remediation:
      'Enforce object-level access controls at the database and business logic layer for every requested resource.',
    prevention_techniques: [
      'Always bind queries to the active session user ID (WHERE id = :id AND user_id = :session_user_id).',
      'Use unguessable random identifiers (UUIDv4) instead of sequential integers.',
      'Implement Role-Based Access Control (RBAC) middleware decorators.',
    ],
    code_example: `# SECURE OBJECT ACCESS IN FASTAPI / SQLALCHEMY
@router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, current_user = Depends(get_current_user)):
    # Always include user_id in the query filter
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id  # Prevents IDOR
    ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice`,
  },
  {
    category: 'Missing Security Headers',
    title: 'Browser Defensive HTTP Header Hardening',
    why_it_occurs:
      'Application frameworks defaulting to minimal HTTP responses without enabling browser defense mechanisms.',
    impact:
      'Increased exposure to clickjacking, MIME-confusion JavaScript execution, and downgrade attacks.',
    remediation:
      'Configure Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, and X-Frame-Options across all responses.',
    prevention_techniques: [
      'Configure CSP: default-src self; object-src none; base-uri self.',
      'Enable HSTS: Strict-Transport-Security: max-age=31536000; includeSubDomains.',
      'Set X-Content-Type-Options: nosniff.',
      'Set X-Frame-Options: DENY.',
    ],
    code_example: `# FASTAPI SECURITY HEADERS MIDDLEWARE
@app.middleware("http")
async def security_headers_middleware(request, call_next):
    resp = await call_next(request)
    resp.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self';"
    resp.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    return resp`,
  },
  {
    category: 'Sensitive Information Exposure',
    title: 'Header-Bound Authentication & Secret Sanitization',
    why_it_occurs:
      'Passing tokens, secrets, or passwords in GET query parameters or logging credentials in plaintext.',
    impact:
      'Tokens recorded in proxy logs, browser history, and Referer headers; credential leakage.',
    remediation:
      'Pass tokens strictly in the Authorization header or HttpOnly secure cookies. Strip server identification banners.',
    prevention_techniques: [
      'Never send credentials or JWTs in GET query parameters.',
      'Mask sensitive fields in application logging and exception handlers.',
      'Disable Server and X-Powered-By banners in web server configuration.',
    ],
    code_example: `# SECURE AUTHORIZATION TRANSMISSION
# Client Request Header:
headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json"
}
# NEVER: requests.get(f"/api/data?token={jwt_token}")`,
  },
];

export default function RemediationCenter() {
  const { setActiveFinding, updateStatus, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('SQL Injection');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [categoryFindings, setCategoryFindings] = useState([]);
  const [loadingFindings, setLoadingFindings] = useState(false);

  const activeGuide =
    REMEDIATION_GUIDES.find((g) => g.category === selectedCategory) || REMEDIATION_GUIDES[0];

  const fetchCategoryFindings = async () => {
    try {
      setLoadingFindings(true);
      const data = await api.getFindings({ category: selectedCategory });
      setCategoryFindings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFindings(false);
    }
  };

  useEffect(() => {
    fetchCategoryFindings();
  }, [selectedCategory]);

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    showToast('Code copied to clipboard.', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleStatusChange = async (findingId, newStatus) => {
    await updateStatus(findingId, newStatus);
    await fetchCategoryFindings();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
            Remediation Center
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Practical defensive guidelines, prevention techniques, and production-ready secure code examples.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-blue-200 text-[#2563EB] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Blue-Team Defensive Hardening</span>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {REMEDIATION_GUIDES.map((guide) => (
          <button
            key={guide.category}
            onClick={() => setSelectedCategory(guide.category)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === guide.category
                ? 'bg-[#2563EB] text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50'
            }`}
          >
            {guide.category}
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Comprehensive Guide & Code */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
                Defensive Architecture Blueprint
              </span>
              <h3 className="text-lg font-bold text-[#172554] mt-0.5">{activeGuide.title}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <h4 className="font-bold text-[#172554] mb-1">Root Cause / Why It Occurs</h4>
                <p className="text-[#64748B] leading-relaxed">{activeGuide.why_it_occurs}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-rose-200">
                <h4 className="font-bold text-rose-900 mb-1">Potential Security Impact</h4>
                <p className="text-rose-800 leading-relaxed">{activeGuide.impact}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Recommended Remediation Strategy
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#ECFDF5] p-4 rounded-xl border border-emerald-200">
                {activeGuide.remediation}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Defensive Prevention Techniques
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {activeGuide.prevention_techniques.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-[#2563EB]" />
                  <span>Secure Implementation Example</span>
                </h4>
                <button
                  onClick={() => handleCopyCode(activeGuide.code_example, 0)}
                  className="inline-flex items-center gap-1 text-xs text-[#2563EB] hover:text-blue-800 font-semibold cursor-pointer"
                >
                  {copiedIndex === 0 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 0 ? 'Copied' : 'Copy Example'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#0F172A] text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {activeGuide.code_example}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Active Findings in this Category with Status Controls */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#172554]">In-Scope Findings</h3>
                <p className="text-xs text-[#64748B]">{selectedCategory}</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-blue-200">
                {categoryFindings.length}
              </span>
            </div>

            {loadingFindings ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading findings...</div>
            ) : categoryFindings.length === 0 ? (
              <div className="text-center py-8 space-y-2 text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <p>No active {selectedCategory} findings in session.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryFindings.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setActiveFinding(f)}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-blue-300 hover:shadow-2xs transition-all bg-[#F8FAFC]/50 hover:bg-white cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-[#64748B]">{f.id}</span>
                      <SeverityBadge severity={f.severity} size="xs" />
                    </div>

                    <h5 className="text-xs font-bold text-[#172554] line-clamp-2">{f.name}</h5>

                    <div className="text-[11px] font-mono text-[#64748B] truncate">
                      {f.affected_target}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <StatusBadge status={f.remediation_status} />

                      {/* Quick Status Buttons */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {['Open', 'In Progress', 'Resolved'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(f.id, st)}
                            disabled={f.remediation_status === st}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors cursor-pointer disabled:opacity-40 ${
                              f.remediation_status === st
                                ? 'bg-[#2563EB] text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {st === 'In Progress' ? 'Prog' : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
