import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Activity,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Menu,
  Database,
  ChevronRight,
  User,
  X,
  Bell,
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const { dashboardData, loadSampleData, clearSessionData } = useApp();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const pageMeta = {
    '/': { title: 'Security Overview', section: 'Dashboard' },
    '/analyzer': { title: 'HTTP Request Analyzer', section: 'Triage Workspace' },
    '/findings': { title: 'Vulnerability Findings', section: 'Findings Management' },
    '/risk': { title: 'Risk Assessment & Prioritization', section: 'Risk Matrix' },
    '/remediation': { title: 'Remediation Center', section: 'Defensive Blue Team' },
    '/reports': { title: 'Scan Reports & PDF Export', section: 'Compliance & Reports' },
    '/about': { title: 'About Capstone Project', section: 'Documentation' },
  };

  const currentMeta = pageMeta[location.pathname] || {
    title: 'Vulnerability Triage',
    section: 'Framework',
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 py-3 transition-all">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Breadcrumbs / Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  VulnTriage
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span>{currentMeta.section}</span>
              </div>
              {/* Page Title */}
              <h1 className="text-base sm:text-lg font-bold text-[#172554] tracking-tight leading-none mt-0.5">
                {currentMeta.title}
              </h1>
            </div>
          </div>

          {/* Right: Health Indicator, Action Buttons, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* System Health Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>System Healthy</span>
              <span className="text-emerald-400 font-light">|</span>
              <span className="text-[11px] text-emerald-700">In-Memory Active</span>
            </div>

            {/* Load Sample Findings Button */}
            <button
              onClick={loadSampleData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-blue-100 border border-blue-200 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Preload academic demonstration findings"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Load Sample Data</span>
              <span className="sm:hidden">Samples</span>
            </button>

            {/* Clear Session */}
            <button
              onClick={() => setShowClearModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-rose-700 hover:bg-[#FEF2F2] border border-[#E2E8F0] hover:border-rose-200 transition-all cursor-pointer"
              title="Clear all temporary in-memory findings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Session</span>
            </button>

            {/* Help / Guide button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#172554] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Framework Methodology & Guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* User Profile Placeholder */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                CR
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-[#172554] leading-tight">Capstone Reviewer</div>
                <div className="text-[10px] text-[#64748B] font-medium leading-none">Security Analyst</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Clear Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={async () => {
          await clearSessionData();
          setShowClearModal(false);
        }}
        title="Reset Temporary Session Data?"
        message="This action will clear all current in-memory vulnerability findings and reset dashboard metrics to zero. Since no database is connected, cleared findings cannot be recovered unless re-analyzed or reloaded."
        confirmText="Clear Session"
        confirmVariant="danger"
      />

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-[#172554] text-base">
                  Vulnerability Triage Framework Guide
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-3 rounded-xl bg-[#EFF6FF] border border-blue-100 text-blue-900">
                <p className="font-semibold text-blue-950 mb-1">
                  🎓 Academic Ethical Hacking Capstone Project
                </p>
                <p className="text-xs leading-relaxed">
                  This framework demonstrates automated, safe, rule-based web application input triage, severity categorization, risk prioritization, and remediation guidance.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#172554] mb-1">🔒 Pure In-Memory Session Architecture:</h4>
                <p className="text-xs">
                  Runs without any database (No SQL, No NoSQL, No SQLite, No external storage). All uploaded requests and findings exist temporarily in active server memory only.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#172554] mb-1">🛡️ Safe Local Analysis Guarantee:</h4>
                <p className="text-xs">
                  Does <b>NOT</b> execute payloads, attack external systems, or exploit targets. It analyzes input patterns using deterministic security heuristics.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#172554] mb-1">📊 Composite Risk Scoring Formula:</h4>
                <p className="text-xs font-mono bg-slate-50 p-2 rounded border border-slate-200">
                  Risk Score = Base Severity (max 40) + Impact (max 25) + Exploitability (max 25) + Evidence Quality (max 10)
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
