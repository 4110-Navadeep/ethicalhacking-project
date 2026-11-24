import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  SearchCode,
  FileText,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Activity,
  Info,
  Clock,
  FileUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Dashboard() {
  const { dashboardData, loading, setActiveFinding, loadSampleData } = useApp();

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-[#E2E8F0]"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-[#E2E8F0]"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white rounded-2xl border border-[#E2E8F0]"></div>
          <div className="h-72 bg-white rounded-2xl border border-[#E2E8F0]"></div>
        </div>
      </div>
    );
  }

  const stats = dashboardData || {
    total_findings: 0,
    critical_count: 0,
    high_count: 0,
    medium_count: 0,
    resolved_count: 0,
    average_risk_score: 0,
    severity_distribution: [],
    category_distribution: [],
    status_distribution: [],
    risk_distribution: [],
    recent_findings: [],
    priority_findings: [],
  };

  const hasData = stats.total_findings > 0;

  return (
    <div className="space-y-6">
      {/* Top Header Section as requested */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
            Security Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Monitor vulnerabilities, assess security risks and prioritize remediation activities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/analyzer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <SearchCode className="w-4 h-4" />
            <span>Analyze Request</span>
          </Link>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-[#172554] hover:bg-slate-50 border border-[#E2E8F0] transition-all shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#2563EB]" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Findings"
          value={stats.total_findings}
          subtitle="Identified in session"
          icon={Layers}
          variant="blue"
        />
        <StatCard
          title="Critical Vulnerabilities"
          value={stats.critical_count}
          subtitle="Action required"
          icon={ShieldAlert}
          variant="rose"
          badgeText="Critical"
        />
        <StatCard
          title="High-Risk Findings"
          value={stats.high_count}
          subtitle="Severe security risk"
          icon={AlertCircle}
          variant="orange"
        />
        <StatCard
          title="Medium-Risk Findings"
          value={stats.medium_count}
          subtitle="Defensive weaknesses"
          icon={AlertTriangle}
          variant="amber"
        />
        <StatCard
          title="Resolved Findings"
          value={stats.resolved_count}
          subtitle={`${Math.round((stats.resolved_count / (stats.total_findings || 1)) * 100)}% remediation rate`}
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="p-10 sm:p-14 rounded-2xl bg-white border border-[#E2E8F0] text-center space-y-4 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-[#172554]">
              No Active Findings in Memory
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Start by analyzing an HTTP request, pasting raw HTTP payloads, or load the pre-configured academic demonstration dataset to review live charts.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={loadSampleData}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Load Sample Findings
            </button>
            <Link
              to="/analyzer"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Open Request Analyzer
            </Link>
          </div>
        </div>
      )}

      {hasData && (
        <>
          {/* Charts Grid: 4 Dedicated Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Severity Distribution (Donut Chart) */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#172554]">Severity Distribution</h3>
                  <p className="text-xs text-[#64748B]">Breakdown across standard vulnerability severity levels</p>
                </div>
                <span className="text-xs font-semibold text-[#172554] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                  {stats.total_findings} Total
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.severity_distribution.filter((d) => d.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                    >
                      {stats.severity_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} findings`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => <span className="text-xs text-slate-600 font-medium">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Vulnerability Categories (Horizontal Bar Chart) */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#172554]">Vulnerability Categories</h3>
                  <p className="text-xs text-[#64748B]">Prevalence across classified vulnerability families</p>
                </div>
                <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md border border-blue-100">
                  {stats.category_distribution.length} Types
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.category_distribution.slice(0, 6)}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11, fill: '#172554' }}
                      tickFormatter={(val) => (val.length > 15 ? `${val.slice(0, 15)}...` : val)}
                    />
                    <Tooltip
                      formatter={(val) => [`${val} findings`, 'Detected']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                      }}
                    />
                    <Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Remediation Progress */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#172554]">Remediation Progress</h3>
                  <p className="text-xs text-[#64748B]">Status breakdown: Open, In Progress, and Resolved</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-[#ECFDF5] border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  {stats.resolved_count} Resolved
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.status_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                    <Tooltip
                      formatter={(val) => [`${val} findings`, 'Count']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                      {stats.status_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Risk Distribution (Tiers) */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#172554]">Risk Distribution</h3>
                  <p className="text-xs text-[#64748B]">Findings classified by composite risk scoring bands</p>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-[#EFF6FF] border border-blue-200 px-2.5 py-0.5 rounded-md">
                  Avg {stats.average_risk_score}/100
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.risk_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                    <Tooltip
                      formatter={(val) => [`${val} findings`, 'Count']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
                      {stats.risk_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Priority Queue: Top 5 Highest-Risk Findings */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FEF2F2] text-rose-600">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172554]">
                    Priority Vulnerability Queue
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Top findings ranked by composite triage risk score (0-100)
                  </p>
                </div>
              </div>

              <Link
                to="/findings"
                className="text-xs font-semibold text-[#2563EB] hover:text-blue-800 inline-flex items-center gap-1"
              >
                <span>View All Findings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold text-[11px] tracking-wider">
                    <th className="pb-3">Vulnerability</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Severity</th>
                    <th className="pb-3">Risk Score</th>
                    <th className="pb-3">Remediation Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.priority_findings.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => setActiveFinding(f)}
                    >
                      <td className="py-3 font-semibold text-[#172554] max-w-xs truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-[#64748B]">{f.id}</span>
                          <span>{f.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-[#64748B]">{f.category}</td>
                      <td className="py-3">
                        <SeverityBadge severity={f.severity} size="xs" />
                      </td>
                      <td className="py-3">
                        <RiskBadge score={f.risk_score} category={f.risk_category} />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={f.remediation_status} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveFinding(f);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              to="/analyzer"
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-blue-300 hover:shadow-card-hover transition-all group flex items-start gap-3"
            >
              <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <SearchCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#172554] group-hover:text-[#2563EB] transition-colors">
                  Analyze Request
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Inspect raw or manual HTTP payloads
                </p>
              </div>
            </Link>

            <Link
              to="/analyzer?tab=upload"
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-blue-300 hover:shadow-card-hover transition-all group flex items-start gap-3"
            >
              <div className="p-2.5 rounded-xl bg-[#F5F3FF] text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FileUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#172554] group-hover:text-purple-600 transition-colors">
                  Import Scan Report
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Ingest JSON vulnerability scans
                </p>
              </div>
            </Link>

            <Link
              to="/findings"
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-blue-300 hover:shadow-card-hover transition-all group flex items-start gap-3"
            >
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#172554] group-hover:text-orange-600 transition-colors">
                  View Findings
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Explore categorized findings table
                </p>
              </div>
            </Link>

            <Link
              to="/risk"
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-blue-300 hover:shadow-card-hover transition-all group flex items-start gap-3"
            >
              <div className="p-2.5 rounded-xl bg-[#FFFBEB] text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#172554] group-hover:text-amber-600 transition-colors">
                  View Risk Matrix
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Review 0-100 scoring metrics
                </p>
              </div>
            </Link>

            <Link
              to="/reports"
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-blue-300 hover:shadow-card-hover transition-all group flex items-start gap-3"
            >
              <div className="p-2.5 rounded-xl bg-[#ECFDF5] text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#172554] group-hover:text-emerald-600 transition-colors">
                  Generate PDF
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Download executive summary PDF
                </p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
