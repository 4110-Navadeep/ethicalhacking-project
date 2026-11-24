import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
  FileCode2,
} from 'lucide-react';

export default function AboutProject() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-blue-200 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Ethical Hacking Capstone Project</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
            Intelligent Web Application Vulnerability Triage and Risk Assessment Framework
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
            A comprehensive, academic Ethical Hacking platform designed to automate web application request inspection, classify security weakness indicators, calculate transparent composite risk scores (0-100), and present actionable defensive remediation blueprints.
          </p>
        </div>
      </div>

      {/* Core Objectives & Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#172554]">Deterministic Heuristic Triage</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Evaluates input parameters, HTTP headers, query strings, and payloads against OWASP Top 10 attack vectors using deterministic pattern-matching heuristics.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#172554]">Transparent Composite Risk Scoring</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Calculates composite 0-100 risk scores with mathematical rationales: Base Severity (40%), Impact (25%), Exploitability (25%), and Evidence Quality (10%).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-emerald-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#172554]">Zero-Database In-Memory Session</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            All findings, session metrics, and uploaded scan reports reside strictly in temporary Python memory with zero database footprint and no disk persistence.
          </p>
        </div>
      </div>

      {/* Safety & Ethical Demonstration Policy */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-[#172554]">
            Ethical Boundaries & Safe Analysis Guarantee
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          In strict compliance with academic ethical hacking standards and capstone guidelines, this framework is engineered as a defensive triage and risk analysis platform, not an offensive exploitation or port scanning engine:
        </p>

        <ul className="space-y-2.5 text-xs text-slate-700">
          <li className="flex items-start gap-2.5 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><b>No External Scanning:</b> The application never initiates unauthorized socket connections, port scans, or network requests to external third-party targets.</span>
          </li>
          <li className="flex items-start gap-2.5 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><b>No Payload Execution:</b> Submitted command strings, SQL payloads, and script tags are strictly parsed as text literals. No shell or eval calls are ever made.</span>
          </li>
          <li className="flex items-start gap-2.5 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><b>Classification Rigor:</b> Distinguishes between "Detected Indicator", "Potential Vulnerability", and "Confirmed Indicator", preventing false certainty.</span>
          </li>
        </ul>
      </div>

      {/* Single-Service Deployment Architecture */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-[#2563EB]" />
          <h3 className="text-sm font-bold text-[#172554]">
            Single-Service Architecture & Deployment Specification
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#172554] text-sm">
              <Server className="w-4 h-4 text-[#2563EB]" />
              <span>Unified Single Web Service</span>
            </div>
            <p className="text-[#64748B] leading-relaxed">
              FastAPI serves both the REST API endpoints (<code className="font-mono text-[#2563EB]">/api/*</code>) and the compiled production React frontend (<code className="font-mono text-[#2563EB]">frontend/dist</code>) from a single Render Web Service on one public website URL.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#172554] text-sm">
              <FileCode2 className="w-4 h-4 text-purple-600" />
              <span>SPA Route Fallback Guarantee</span>
            </div>
            <p className="text-[#64748B] leading-relaxed">
              FastAPI handles Single Page Application (SPA) routing seamlessly. Refreshing <code className="font-mono text-purple-600">/analyzer</code>, <code className="font-mono text-purple-600">/findings</code>, <code className="font-mono text-purple-600">/risk</code>, or <code className="font-mono text-purple-600">/remediation</code> safely returns <code className="font-mono">index.html</code> with zero 404 errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
