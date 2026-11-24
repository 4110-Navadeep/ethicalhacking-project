import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SeverityBadge from './SeverityBadge';
import RiskBadge from './RiskBadge';
import StatusBadge from './StatusBadge';
import {
  X,
  Shield,
  Copy,
  Check,
  Code,
  AlertTriangle,
  Lightbulb,
  Layers,
  Clock,
  Terminal,
} from 'lucide-react';

export default function FindingDetailModal({ finding, onClose }) {
  const { updateStatus } = useApp();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'evidence' | 'risk' | 'remediation'
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!finding) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await updateStatus(finding.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const remediation = finding.remediation_details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] max-w-3xl w-full max-h-[90vh] flex flex-col text-slate-800 animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-start justify-between gap-4 bg-[#F8FAFC]">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                {finding.id}
              </span>
              <SeverityBadge severity={finding.severity} />
              <RiskBadge score={finding.risk_score} category={finding.risk_category} />
              {finding.is_sample && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-blue-200">
                  DEMO DATA
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-bold text-[#172554] tracking-tight">
              {finding.name}
            </h2>

            <p className="text-xs text-[#64748B]">
              Target: <span className="font-mono text-[#172554] font-medium">{finding.affected_target}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#172554] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] px-5 gap-4 bg-white text-xs font-semibold text-[#64748B] overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#2563EB] text-[#2563EB] font-bold'
                : 'border-transparent hover:text-[#172554]'
            }`}
          >
            1. Overview
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-[#2563EB] text-[#2563EB] font-bold'
                : 'border-transparent hover:text-[#172554]'
            }`}
          >
            2. Evidence
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'risk'
                ? 'border-[#2563EB] text-[#2563EB] font-bold'
                : 'border-transparent hover:text-[#172554]'
            }`}
          >
            3. Risk Assessment
          </button>
          <button
            onClick={() => setActiveTab('remediation')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'remediation'
                ? 'border-[#2563EB] text-[#2563EB] font-bold'
                : 'border-transparent hover:text-[#172554]'
            }`}
          >
            4. Remediation
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Technical Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  {finding.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white">
                  <span className="text-[#64748B] font-medium block mb-0.5">Vulnerability Category</span>
                  <span className="font-semibold text-[#172554] text-sm">{finding.category}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white">
                  <span className="text-[#64748B] font-medium block mb-0.5">Detection Source</span>
                  <span className="font-semibold text-[#172554] text-sm">{finding.detection_source}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white">
                  <span className="text-[#64748B] font-medium block mb-0.5">Classification Type</span>
                  <span className="font-semibold text-[#172554] text-sm">{finding.detection_type}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white">
                  <span className="text-[#64748B] font-medium block mb-0.5">Detection Confidence</span>
                  <span className="font-semibold text-[#172554] text-sm">{finding.confidence}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Detection Limitations & Scope
                </h4>
                <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{finding.detection_limitation}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    Matched Pattern / Payload Evidence
                  </h4>
                  <button
                    onClick={() => handleCopy(finding.evidence)}
                    className="inline-flex items-center gap-1 text-xs text-[#2563EB] hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Evidence'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-[#0F172A] text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {finding.evidence}
                </pre>
              </div>

              {finding.request_snippet && (
                <div>
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    HTTP Request Context
                  </h4>
                  <pre className="p-4 rounded-xl bg-[#0F172A] text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                    {finding.request_snippet}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RISK ASSESSMENT */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#172554] uppercase tracking-wider">
                    Assigned Triage Risk Score
                  </span>
                  <RiskBadge score={finding.risk_score} category={finding.risk_category} />
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      finding.risk_score >= 85
                        ? 'bg-rose-500'
                        : finding.risk_score >= 65
                        ? 'bg-orange-500'
                        : finding.risk_score >= 40
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${finding.risk_score}%` }}
                  />
                </div>

                <div className="p-3 rounded-lg bg-white border border-[#E2E8F0] space-y-1 mt-3">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    Mathematical Scoring Derivation:
                  </div>
                  <p className="text-xs text-[#172554] leading-relaxed font-mono">
                    {finding.risk_rationale}
                  </p>
                </div>
              </div>

              {remediation.impact && (
                <div>
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Security Impact Analysis
                  </h4>
                  <p className="text-sm text-rose-900 leading-relaxed bg-[#FEF2F2] p-4 rounded-xl border border-rose-200">
                    {remediation.impact}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REMEDIATION */}
          {activeTab === 'remediation' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Recommended Defensive Remediation
                </h4>
                <p className="text-sm text-emerald-900 leading-relaxed bg-[#ECFDF5] p-4 rounded-xl border border-emerald-200">
                  {finding.remediation_summary}
                </p>
              </div>

              {remediation.prevention_techniques && (
                <div>
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Defensive Prevention Techniques
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {remediation.prevention_techniques.map((tech, i) => (
                      <li key={i} className="flex items-start gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {remediation.secure_coding_example && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Defensive Implementation Example
                    </h4>
                    <button
                      onClick={() => handleCopy(remediation.secure_coding_example)}
                      className="inline-flex items-center gap-1 text-xs text-[#2563EB] hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#0F172A] text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                    {remediation.secure_coding_example}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer: Remediation Status Controls */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#172554]">Status:</span>
            <StatusBadge status={finding.remediation_status} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] mr-1 hidden sm:inline">Set Status:</span>
            {['Open', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                disabled={updating || finding.remediation_status === st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${
                  finding.remediation_status === st
                    ? 'bg-[#2563EB] text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-[#E2E8F0]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
