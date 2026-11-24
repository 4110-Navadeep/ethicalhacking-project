# Intelligent Web Application Vulnerability Triage and Risk Assessment Framework

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_Vite-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Render](https://img.shields.io/badge/Deployment-Single--Service_Render_Ready-46E3B7?style=flat&logo=render&logoColor=black)](https://render.com)
[![Database](https://img.shields.io/badge/Database-None_(Pure_In--Memory)-slate)](https://en.wikipedia.org/wiki/In-memory_database)

An enterprise-grade, academic Ethical Hacking capstone platform designed to streamline web application vulnerability triage, risk scoring, prioritization, and defensive remediation planning.

---

## 📌 1. Project Overview & Capstone Objective

Modern security teams and penetration testers often face high volumes of raw HTTP traffic, endpoint findings, and scanner output. This project provides an **Intelligent Web Application Vulnerability Triage and Risk Assessment Framework** that:
- Inspects and parses web application inputs and raw HTTP requests.
- Classifies vulnerability indicators across OWASP Top 10 categories (SQLi, XSS, Command Injection, Path Traversal, IDOR, Security Headers, and Sensitive Information Exposure).
- Calculates a transparent, composite **Risk Score (0 to 100)** without black-box ambiguity.
- Prioritizes findings in an immediate action queue.
- Delivers defensive blue-team remediation guidelines and production-ready code examples.
- Generates on-the-fly executive **PDF Summary Reports** and **JSON exports** entirely in memory.

### 🛡️ Ethical & Safe Analysis Guarantee
This project is strictly a **defensive triage and heuristic analysis platform**, not an unrestricted offensive exploitation tool:
- **No External Scanning:** Does not initiate unauthorized port scans, socket connections, or attacks against external systems.
- **No Payload Execution:** Submitted commands or scripts are never executed or evaluated on the host system.
- **Classification Rigor:** Explicitly distinguishes between *Detected Indicator*, *Potential Vulnerability*, and *Confirmed Indicator*.

---

## 🔒 2. Zero-Database Architecture (In-Memory Session)

To satisfy strict privacy, academic laboratory isolation, and zero-storage principles:
- **No Database Is Used:** No MySQL, PostgreSQL, MongoDB, SQLite, Firebase, or Supabase.
- **In-Memory Data Structures:** All analyzed requests, temporary findings, and status changes are stored exclusively in Python memory during the active application process.
- **Session Lifespan:** Refreshing or restarting the backend web service resets the temporary state.
- **Zero Disk Residue:** Uploaded JSON files and generated PDF reports are processed in RAM and streamed directly to the client browser.

---

## 🚀 3. Single-Service Combined Architecture

Unlike legacy setups requiring two separate services, this application is deployed as **ONE unified Render Web Service** on **ONE public URL**:
- **FastAPI Production Engine:** Serves all REST API endpoints under `/api/*` and dynamically serves the production-compiled React frontend (`frontend/dist`) at the root `/`.
- **SPA Routing Support:** Single Page Application (SPA) routing is handled natively. Refreshing `/analyzer`, `/findings`, `/risk`, `/remediation`, or `/reports` seamlessly returns `index.html` with zero 404 errors.
- **Preserved API Documentation:** Interactive Swagger documentation remains available at `/docs` for backend review.

---

## 🎨 4. Design System & UI/UX

Engineered with a **modern cybersecurity SaaS light aesthetic** avoiding cliché dark/neon-green hacker stereotypes:
- **Primary Background:** Clean white (`#FFFFFF`) and soft slate blue-gray (`#F8FAFC`).
- **Headings & Typography:** Deep navy typography (`#172554`) paired with Inter and JetBrains Mono fonts.
- **Severity & Status Palette:** Soft Red (`#FEF2F2` / `#EF4444`), Warm Orange (`#FFF7ED` / `#F97316`), Soft Amber (`#FFFBEB` / `#F59E0B`), Professional Blue (`#EFF6FF` / `#2563EB`), and Soft Green (`#ECFDF5` / `#10B981`).
- **Interactive Visualizations:** Powered by Recharts (Donut chart for severity, horizontal bar charts for vulnerability categories, bar charts for status and risk distribution).

---

## 📂 5. Project Directory Structure

```text
ETHICAL HACKING PROJECT/
├── run.py                             # Root one-command local orchestrator
├── render.yaml                        # Single-service Render Blueprint specification
├── README.md
├── .gitignore
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app, single-service SPA serving & API
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py             # Pydantic v2 data models & validation
│   │   ├── analyzers/
│   │   │   ├── __init__.py
│   │   │   ├── request_parser.py      # Raw HTTP & manual request parser
│   │   │   ├── sqli_analyzer.py       # SQL Injection heuristic analyzer
│   │   │   ├── xss_analyzer.py        # Cross-Site Scripting analyzer
│   │   │   ├── cmdi_analyzer.py       # Command Injection analyzer
│   │   │   ├── traversal_analyzer.py  # Path Traversal analyzer
│   │   │   ├── idor_analyzer.py       # Insecure Direct Object Reference analyzer
│   │   │   ├── header_analyzer.py     # HTTP Security Headers analyzer
│   │   │   ├── info_disclosure_analyzer.py # Sensitive Info Exposure analyzer
│   │   │   └── engine.py              # Central triage orchestration engine
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── session_store.py       # Thread-safe in-memory session manager
│   │   │   ├── risk_scorer.py         # 0-100 transparent risk scoring calculator
│   │   │   ├── remediation_service.py # Blue-team guidance & code examples
│   │   │   ├── sample_data.py         # 8 academic demonstration sample findings
│   │   │   └── report_generator.py    # ReportLab in-memory PDF generator
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── analyzer_routes.py     # /api/analyze/raw, /manual, /import-report
│   │       ├── findings_routes.py     # /api/findings, /sample, /{id}/status
│   │       ├── dashboard_routes.py    # /api/dashboard
│   │       ├── report_routes.py       # /api/reports/export/json, /pdf
│   │       └── session_routes.py      # /api/session (DELETE to clear memory)
│   ├── requirements.txt               # Python backend dependencies
│   └── run.py                         # Standalone backend runner
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx             # Top bar with status pill & quick action buttons
    │   │   ├── Sidebar.jsx            # Responsive navigation with finding count badges
    │   │   ├── SeverityBadge.jsx      # Severity level visual badges
    │   │   ├── RiskBadge.jsx          # Risk score pills (0-100) & tier colors
    │   │   ├── StatusBadge.jsx        # Open / In Progress / Resolved badges
    │   │   ├── StatCard.jsx           # Dashboard metric summary cards
    │   │   ├── FindingDetailModal.jsx # Multi-tab technical detail inspector
    │   │   ├── ConfirmationModal.jsx  # Reusable confirmation dialogs
    │   │   └── Toast.jsx              # Floating alert notifications
    │   ├── pages/
    │   │   ├── Dashboard.jsx          # Dynamic overview & 4 Recharts graphs
    │   │   ├── RequestAnalyzer.jsx    # Raw HTTP, manual builder & file import
    │   │   ├── VulnerabilityFindings.jsx # Table & Card view findings manager
    │   │   ├── RiskAssessment.jsx     # Scoring formula & prioritized queue
    │   │   ├── RemediationCenter.jsx  # Defensive guides, secure code & status switcher
    │   │   ├── ScanReports.jsx        # PDF and JSON document export & import
    │   │   └── AboutProject.jsx       # Academic context & architecture overview
    │   ├── context/
    │   │   └── AppContext.jsx         # Global session state & actions
    │   ├── services/
    │   │   └── api.js                 # Unified API client (relative URLs)
    │   ├── App.jsx                    # React Router routes & main layout
    │   ├── index.css                  # Tailwind styling & typography
    │   └── main.jsx
    ├── dist/                          # Production build served by FastAPI
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## ⚡ 6. One-Command Local Development

You do **not** need to open separate terminal windows. A single root script starts both the FastAPI backend and the Vite frontend simultaneously:

### Step 1: Install Dependencies (First Time Only)
```powershell
# 1. Install backend Python dependencies
pip install -r backend/requirements.txt

# 2. Install frontend npm packages
cd frontend
npm install
cd ..
```

### Step 2: Run Both Services with One Command
From the root directory:
```powershell
python run.py
```

### Expected Terminal Output:
```text
Starting FastAPI backend service...
Starting Vite frontend development server...

========================================
INTELLIGENT WEB APPLICATION VULNERABILITY
TRIAGE AND RISK ASSESSMENT FRAMEWORK
========================================

Backend:
http://localhost:8000

Frontend:
http://localhost:5173

API Documentation:
http://localhost:8000/docs

Status:
Frontend and backend running.

Open the frontend URL to use the application.

========================================
Press Ctrl+C to stop both servers.
```

### Step 3: Stopping the Application
Press **`Ctrl+C`** in the terminal. The script intercepts the interrupt, terminates both the Vite process tree and the Uvicorn server, and exits cleanly without leaving orphaned processes.

---

## 🧮 7. Transparent Risk Scoring Formula

Instead of claiming unverified CVSS scores, the framework calculates a clearly documented composite metric (0 to 100):

$$\text{Risk Score} = \text{Base Severity (max 40)} + \text{Impact Potential (max 25)} + \text{Exploitability Vector (max 25)} + \text{Evidence Quality (max 10)}$$

| Component | Weight | Criteria |
| :--- | :---: | :--- |
| **Base Severity** | **40 pts** | Critical (40), High (30), Medium (20), Low (10), Informational (5) |
| **Impact Potential** | **25 pts** | RCE / DB Compromise (25), Data Leak / Privilege Escalation (22), Client XSS / IDOR (18), Security Headers (10) |
| **Exploitability Vector** | **25 pts** | URL Query Parameter / Direct Path (25), Request Body (18), HTTP Header (12) |
| **Evidence Quality** | **10 pts** | Potential Vulnerability with High Confidence (10), Deterministic Pattern (8), Heuristic Indicator (5) |

### Risk Tiers
- **Critical Risk:** `85 - 100` (Immediate active response required)
- **High Risk:** `65 - 84` (Severe threat to system security)
- **Medium Risk:** `40 - 64` (Defensive weakness requiring remediation)
- **Low Risk:** `0 - 39` (Informational or defense-in-depth enhancement)

---

## ☁️ 8. Single-Service Render Deployment Instructions

The entire project is deployed as **ONE Render Web Service**. No separate static site service is needed.

### Method A: Automated Deployment via `render.yaml` (Recommended)
1. Commit and push your code to your GitHub repository.
2. Log in to [Render](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Select your GitHub repository.
5. Render detects `render.yaml` and deploys the unified web service automatically.
6. Once deployed, open your assigned URL (e.g. `https://vulntriage-framework.onrender.com`).

---

### Method B: Manual Service Creation on Render
1. In the Render Dashboard, click **New +** ➔ **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name:** `vulntriage-framework`
   - **Runtime:** `Python 3`
   - **Region:** `Oregon (US West)` (or closest region)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / root)*
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command:**
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Health Check Path:**
     ```text
     /api/health
     ```
4. Environment Variables:
   - `PYTHON_VERSION`: `3.11.9`
   - `NODE_VERSION`: `20.11.0`
5. Click **Create Web Service**.
6. Render builds the React application, compiles it into `frontend/dist`, installs backend requirements, and launches FastAPI.
7. Open the single public URL provided by Render (e.g., `https://vulntriage-framework.onrender.com`). The React homepage will render directly!

---

## 🌐 9. Production Routing Verification

When deployed on Render, the following URLs behave as expected:

| URL Path | Response Type | Behavior |
| :--- | :--- | :--- |
| **`/`** | HTML (`index.html`) | Opens the actual React application homepage |
| **`/analyzer`** | HTML (`index.html`) | Opens the Request Analyzer (SPA route, no 404 on refresh) |
| **`/findings`** | HTML (`index.html`) | Opens the Vulnerability Findings management page |
| **`/risk`** | HTML (`index.html`) | Opens the Risk Assessment & Prioritization page |
| **`/remediation`** | HTML (`index.html`) | Opens the Defensive Remediation Center |
| **`/reports`** | HTML (`index.html`) | Opens the PDF and JSON Scan Reports page |
| **`/api/health`** | JSON | Backend health check monitoring endpoint |
| **`/api/dashboard`** | JSON | Dynamic dashboard metrics and distribution stats |
| **`/api/findings`** | JSON | Filterable findings list |
| **`/docs`** | HTML / Swagger | Interactive OpenAPI backend documentation |

---

## 🧪 10. Demonstration Walkthrough (Capstone Review)

1. **Security Overview Dashboard:** Review dynamic summary cards, the 4 interactive charts (Severity Donut, Category Bars, Remediation Progress, Risk Tiers), and the Top Priority Queue.
2. **Request Analyzer:**
   - Test one of the 5 built-in presets (e.g. *SQL Injection*, *Cross-Site Scripting*, *Path Traversal*).
   - Review live method and URL parsing preview.
   - Click **Analyze Request** to observe heuristic matching, classification type, risk score, and technical evidence.
3. **Vulnerability Findings:**
   - Toggle between **Table View** and **Card Grid View**.
   - Filter by severity or search keywords (`UNION`, `passwd`, `token`).
   - Click any finding to inspect the 4-tab Detail Inspector (Overview, Evidence, Risk Assessment, Remediation).
   - Change finding status (`Open` ➔ `In Progress` ➔ `Resolved`). Observe the dashboard updating dynamically.
4. **Risk Assessment:**
   - Review the mathematical 0-100 formulation breakdown.
   - Inspect the prioritized action queue sorted by risk score descending.
5. **Remediation Center:**
   - Browse blue-team guides for SQLi, XSS, CMDi, Path Traversal, IDOR, and Security Headers.
   - Inspect syntax-highlighted secure coding implementations and copy code to clipboard.
6. **Scan Reports:**
   - Click **Download PDF Report** to test on-the-fly Python ReportLab document generation.
   - Click **Export Findings (JSON)** to test standard data serialization.
   - Click **Reset Session Data** to test in-memory data purging.
   - Click **Load Sample Data** to reload the complete demonstration dataset.

---

## ⚠️ 11. Known Limitations

- **Temporary In-Memory Storage:** In accordance with project requirements, no database is utilized. Findings and status updates exist in temporary Python memory and reset upon service restart or when clearing the session.
- **Heuristic Pattern Matching:** This platform performs static syntax and signature analysis. Conclusive verification of certain vulnerabilities (such as blind SQLi or multi-tenant IDOR) requires live backend database interaction.
- **Upload File Limits:** Uploaded JSON scan reports are capped at 5 MB to prevent memory exhaustion in serverless or container environments.

---

## 👨‍💻 Capstone Author & License

Developed as an **Ethical Hacking Capstone Project**. Released under the MIT License for educational and research purposes.
