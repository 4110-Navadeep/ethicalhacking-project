import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  FileText,
  Download,
  Upload,
  FileCode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Shield,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function ScanReports() {
  const { dashboardData, showToast, refreshDashboard, clearSessionData } = useApp();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const stats = dashboardData || {
    total_findings: 0,
    critical_count: 0,
    high_count: 0,
    medium_count: 0,
    low_count: 0,
    average_risk_score: 0,
  };

  const hasFindings = stats.total_findings > 0;

  const handleDownloadPdf = async () => {
    if (!hasFindings) {
      showToast('No findings available in current session to generate a report.', 'error');
      return;
    }
    try {
      setDownloadingPdf(true);
      await api.downloadPdf();
      showToast('PDF Triage Report downloaded successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Error generating PDF report.', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleExportJson = async () => {
    if (!hasFindings) {
      showToast('No findings available in session to export.', 'error');
      return;
    }
    try {
      setExportingJson(true);
      await api.exportJson();
      showToast('JSON report data exported successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Error exporting JSON findings.', 'error');
    } finally {
      setExportingJson(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
            Scan Reports & Documentation
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Export in-memory triage statistics, classified findings, and risk prioritization metrics into PDF or JSON.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowClearModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-700 hover:bg-[#FEF2F2] border border-rose-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session Data</span>
          </button>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172554]">
              Executive PDF Summary Report
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Generates a formal, printable PDF triage document containing executive risk metrics, severity charts, prioritized finding queues, technical evidence, and defense recommendations. Compiled dynamically via Python ReportLab in memory.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              {stats.total_findings} finding{stats.total_findings !== 1 ? 's' : ''} in active scope
            </span>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || !hasFindings}
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* JSON Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-purple-600 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172554]">
              Standard JSON Data Export
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Export raw in-memory session findings in structured JSON schema. Ideal for integration with external SIEM, ticket systems, or security data pipelines.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              Standardized Schema v1.0
            </span>

            <button
              onClick={handleExportJson}
              disabled={exportingJson || !hasFindings}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {exportingJson ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exporting JSON...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Findings (JSON)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current Session Scope Summary Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
        <h3 className="text-sm font-bold text-[#172554]">Active Session Scope Breakdown</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[#64748B] block mb-0.5">Total Findings</span>
            <span className="text-xl font-extrabold text-[#172554]">{stats.total_findings}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-rose-200">
            <span className="text-rose-700 block mb-0.5 font-semibold">Critical Threats</span>
            <span className="text-xl font-extrabold text-rose-700">{stats.critical_count}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200">
            <span className="text-orange-700 block mb-0.5 font-semibold">High Severity</span>
            <span className="text-xl font-extrabold text-orange-700">{stats.high_count}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-blue-200">
            <span className="text-blue-700 block mb-0.5 font-semibold">Average Risk Score</span>
            <span className="text-xl font-extrabold text-[#2563EB]">{stats.average_risk_score}/100</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-slate-600 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <b>In-Memory Architecture Guarantee:</b> Findings are compiled directly from temporary Python memory. No temporary reports or uploaded scan files are saved permanently to server storage or disk databases.
          </p>
        </div>
      </div>

      {/* Clear Session Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={async () => {
          await clearSessionData();
          setShowClearModal(false);
        }}
        title="Reset Temporary Session Data?"
        message="This action will clear all current in-memory vulnerability findings and reset report metrics to zero."
        confirmText="Clear Session"
        confirmVariant="danger"
      />
    </div>
  );
}
