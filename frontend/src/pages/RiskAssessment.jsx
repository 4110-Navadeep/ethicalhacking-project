import React from 'react';
import { useApp } from '../context/AppContext';
import SeverityBadge from '../components/SeverityBadge';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import {
  SlidersHorizontal,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  ArrowRight,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function RiskAssessment() {
  const { dashboardData, setActiveFinding } = useApp();

  const stats = dashboardData || {
    total_findings: 0,
    average_risk_score: 0,
    max_risk_score: 0,
    risk_distribution: [],
    priority_findings: [],
    severity_distribution: [],
  };

  const riskTiers = [
    {
      name: 'Critical Risk',
      range: '85 - 100',
      color: 'border-rose-200 bg-[#FEF2F2] text-rose-800',
      desc: 'Immediate exploitation potential causing full database or host compromise.',
      count: stats.risk_distribution?.find((r) => r.range.includes('Critical'))?.count || 0,
    },
    {
      name: 'High Risk',
      range: '65 - 84',
      color: 'border-orange-200 bg-orange-50 text-orange-800',
      desc: 'Significant security threat requiring swift defensive prioritization.',
      count: stats.risk_distribution?.find((r) => r.range.includes('High'))?.count || 0,
    },
    {
      name: 'Medium Risk',
      range: '40 - 64',
      color: 'border-amber-200 bg-[#FFFBEB] text-amber-800',
      desc: 'Defensive weaknesses or chained attack prerequisites.',
      count: stats.risk_distribution?.find((r) => r.range.includes('Medium'))?.count || 0,
    },
    {
      name: 'Low Risk',
      range: '0 - 39',
      color: 'border-blue-200 bg-[#EFF6FF] text-blue-800',
      desc: 'Informational indicators, banner disclosures, or hardening enhancements.',
      count: stats.risk_distribution?.find((r) => r.range.includes('Low'))?.count || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
            Risk Assessment & Prioritization
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Deterministic rule-based risk scoring (0-100) and prioritized remediation action queue.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold bg-white p-2.5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div>
            <span className="text-[#64748B] block text-[10px]">AVG RISK SCORE</span>
            <span className="text-sm font-bold text-[#172554]">{stats.average_risk_score}/100</span>
          </div>
          <div className="w-px h-8 bg-[#E2E8F0]" />
          <div>
            <span className="text-[#64748B] block text-[10px]">MAX RISK SCORE</span>
            <span className="text-sm font-bold text-rose-600">{stats.max_risk_score}/100</span>
          </div>
        </div>
      </div>

      {/* Transparent Scoring Methodology Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-blue-100 shadow-card space-y-3.5">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#2563EB]" />
          <h3 className="text-sm font-bold text-[#172554]">
            Transparent Risk Scoring Metric Formulation
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Rather than relying on unverified CVSS claims, this capstone framework calculates a deterministic composite triage score normalized between 0 and 100:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="font-bold text-[#172554] flex justify-between">
              <span>1. Base Severity</span>
              <span className="text-[#2563EB] font-mono">Max 40 pts</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Critical (40), High (30), Medium (20), Low (10), Informational (5).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="font-bold text-[#172554] flex justify-between">
              <span>2. Impact Potential</span>
              <span className="text-[#2563EB] font-mono">Max 25 pts</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              RCE/Full DB (25), Data/Privilege (22), Client XSS (18), Info leak (10).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="font-bold text-[#172554] flex justify-between">
              <span>3. Exploitability Vector</span>
              <span className="text-[#2563EB] font-mono">Max 25 pts</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              URL query/Path (25), Body payload (18), Header injection (12).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="font-bold text-[#172554] flex justify-between">
              <span>4. Evidence Quality</span>
              <span className="text-[#2563EB] font-mono">Max 10 pts</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Potential Vulnerability (10), Deterministic (8), Heuristic (5).
            </p>
          </div>
        </div>
      </div>

      {/* Risk Tiers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskTiers.map((tier, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${tier.color} shadow-xs space-y-1.5`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">{tier.name}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-current shadow-2xs">
                {tier.range}
              </span>
            </div>
            <div className="text-2xl font-extrabold">{tier.count} Finding{tier.count !== 1 ? 's' : ''}</div>
            <p className="text-[11px] opacity-80 leading-relaxed">{tier.desc}</p>
          </div>
        ))}
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card">
          <h3 className="text-sm font-bold text-[#172554] mb-1">Risk Score Tier Distribution</h3>
          <p className="text-xs text-[#64748B] mb-4">Volume of active findings within each risk scoring tier</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.risk_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val} findings`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28}>
                  {stats.risk_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity vs Triage Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card">
          <h3 className="text-sm font-bold text-[#172554] mb-1">Baseline Severity Breakdown</h3>
          <p className="text-xs text-[#64748B] mb-4">Initial severity classifications feeding into composite scoring</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.severity_distribution.filter((d) => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="count"
                  nameKey="name"
                >
                  {stats.severity_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  formatter={(val) => <span className="text-xs text-slate-600 font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Prioritized Findings Queue Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#172554]">
              Immediate Prioritization Action Queue
            </h3>
            <p className="text-xs text-[#64748B]">
              Sorted by risk score descending to guide immediate remediation order
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold text-[11px] tracking-wider">
                <th className="pb-3">Priority</th>
                <th className="pb-3">Vulnerability</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Risk Score</th>
                <th className="pb-3">Risk Derivation Rationale</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.priority_findings.map((f, idx) => (
                <tr
                  key={f.id}
                  onClick={() => setActiveFinding(f)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3 font-bold text-[#64748B]">#{idx + 1}</td>
                  <td className="py-3 font-semibold text-[#172554] max-w-[200px] truncate">
                    {f.name}
                  </td>
                  <td className="py-3">
                    <SeverityBadge severity={f.severity} size="xs" />
                  </td>
                  <td className="py-3">
                    <RiskBadge score={f.risk_score} category={f.risk_category} />
                  </td>
                  <td className="py-3 text-[11px] text-[#64748B] font-mono max-w-sm truncate">
                    {f.risk_rationale}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={f.remediation_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
