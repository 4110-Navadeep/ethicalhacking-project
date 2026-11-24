import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  SearchCode,
  ShieldAlert,
  SlidersHorizontal,
  FileCheck2,
  FileText,
  GraduationCap,
  X,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { dashboardData } = useApp();
  const totalFindings = dashboardData?.total_findings ?? 0;
  const criticalFindings = dashboardData?.critical_count ?? 0;

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Request Analyzer', path: '/analyzer', icon: SearchCode },
    {
      name: 'Vulnerability Findings',
      path: '/findings',
      icon: ShieldAlert,
      badge: totalFindings > 0 ? totalFindings : null,
      badgeColor: criticalFindings > 0 ? 'bg-[#FEF2F2] text-rose-700 border border-rose-200' : 'bg-[#EFF6FF] text-blue-700 border border-blue-200',
    },
    { name: 'Risk Assessment', path: '/risk', icon: SlidersHorizontal },
    { name: 'Remediation Center', path: '/remediation', icon: FileCheck2 },
    { name: 'Scan Reports', path: '/reports', icon: FileText },
    { name: 'About Project', path: '/about', icon: GraduationCap },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-[#E2E8F0] flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/15">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-[#172554] text-base tracking-tight flex items-center gap-1.5">
                VulnTriage
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#EFF6FF] text-[#2563EB] border border-blue-200 uppercase tracking-wider">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#64748B]">Triage & Risk Framework</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Framework Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold border border-blue-200/60 shadow-2xs'
                      : 'text-slate-600 hover:text-[#172554] hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-blue-600" />
                  <span>{item.name}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* In-Memory Session Info Box */}
        <div className="p-3.5 m-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-slate-600">
          <div className="flex items-center gap-2 mb-1 font-semibold text-[#172554]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Single-Service Mode</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            FastAPI serves the React bundle directly. Ephemeral in-memory session (zero database).
          </p>
        </div>
      </aside>
    </>
  );
}
