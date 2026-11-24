import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import {
  SearchCode,
  FileCode,
  Upload,
  Play,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Info,
  ArrowRight,
  Loader2,
  FileUp,
  RotateCcw,
  Eye,
  Sliders,
} from 'lucide-react';

export default function RequestAnalyzer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshDashboard, showToast, setActiveFinding } = useApp();

  const initialTab = searchParams.get('tab') === 'upload' ? 'upload' : 'raw';
  const [activeTab, setActiveTab] = useState(initialTab); // 'raw' | 'manual' | 'upload'
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  // Raw Tab State
  const [rawRequest, setRawRequest] = useState(
    `GET /api/v1/products?category=electronics' UNION SELECT id, username, password_hash FROM admin_users-- HTTP/1.1\nHost: portal.university-lab.internal\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nAccept: application/json`
  );

  // Manual Tab State
  const [manualMethod, setManualMethod] = useState('GET');
  const [manualUrl, setManualUrl] = useState('/profile/feedback?msg=<script>alert(document.cookie)</script>');
  const [manualHeaders, setManualHeaders] = useState([
    { key: 'Host', value: 'portal.university-lab.internal' },
    { key: 'User-Agent', value: 'Mozilla/5.0' },
  ]);
  const [manualQueryParams, setManualQueryParams] = useState([
    { key: 'msg', value: "<script>alert(document.cookie)</script>" },
  ]);
  const [manualBody, setManualBody] = useState('');

  // Upload Tab State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sample Presets
  const samplePresets = [
    {
      name: 'SQL Injection',
      desc: 'UNION query extraction payload',
      type: 'raw',
      content: `GET /search?q=test' UNION SELECT username, password_hash, email FROM users-- HTTP/1.1\nHost: target-app.local\nUser-Agent: Mozilla/5.0\nAccept: text/html`,
    },
    {
      name: 'Cross-Site Scripting (XSS)',
      desc: 'Reflected script & DOM payload',
      type: 'raw',
      content: `POST /comments HTTP/1.1\nHost: target-app.local\nContent-Type: application/x-www-form-urlencoded\n\nauthor=alice&content=<img src=x onerror=alert('XSS')>`,
    },
    {
      name: 'Path Traversal',
      desc: 'System file /etc/passwd retrieval',
      type: 'raw',
      content: `GET /download?file=../../../../etc/passwd HTTP/1.1\nHost: target-app.local\nUser-Agent: SecurityTestEngine`,
    },
    {
      name: 'Command Injection',
      desc: 'Shell metacharacters & cat command',
      type: 'raw',
      content: `POST /api/diagnostics/ping HTTP/1.1\nHost: target-app.local\nContent-Type: application/json\n\n{"ip": "127.0.0.1; whoami && cat /etc/passwd"}`,
    },
    {
      name: 'Sensitive Info Exposure',
      desc: 'JWT and DB credentials in query string',
      type: 'raw',
      content: `GET /auth/verify?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDN synchronization&db_pass=AdminSecret2026! HTTP/1.1\nHost: target-app.local\nServer: Apache/2.4.41 (Ubuntu)`,
    },
  ];

  const handleApplyPreset = (preset) => {
    setActiveTab(preset.type);
    setRawRequest(preset.content);
    showToast(`Loaded "${preset.name}" preset into analyzer.`, 'info');
  };

  const handleClearRaw = () => {
    setRawRequest('');
    showToast('Input editor cleared.', 'info');
  };

  // Parse summary preview from raw text
  const getRawPreview = () => {
    if (!rawRequest.trim()) return { method: 'N/A', url: 'N/A', headerCount: 0, hasBody: false };
    const lines = rawRequest.trim().split('\n');
    const firstLine = lines[0] || '';
    const tokens = firstLine.split(' ');
    const method = tokens[0] || 'GET';
    const url = tokens[1] || '/';
    const parts = rawRequest.split(/\r?\n\r?\n/);
    const headerLines = parts[0] ? parts[0].split('\n').slice(1) : [];
    const hasBody = parts.length > 1 && Boolean(parts[1].trim());
    return {
      method,
      url,
      headerCount: headerLines.filter((l) => l.includes(':')).length,
      hasBody,
    };
  };

  const preview = getRawPreview();

  // Run Analysis
  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setResults(null);

      let response = null;

      if (activeTab === 'raw') {
        if (!rawRequest.trim()) {
          showToast('Please provide an HTTP request to analyze.', 'error');
          return;
        }
        response = await api.analyzeRaw(rawRequest);
      } else if (activeTab === 'manual') {
        if (!manualUrl.trim()) {
          showToast('Please provide a target URL or endpoint path.', 'error');
          return;
        }

        const headersObj = {};
        manualHeaders.forEach((h) => {
          if (h.key.trim()) headersObj[h.key.trim()] = h.value;
        });

        const queryObj = {};
        manualQueryParams.forEach((q) => {
          if (q.key.trim()) queryObj[q.key.trim()] = q.value;
        });

        response = await api.analyzeManual({
          method: manualMethod,
          url: manualUrl,
          headers: headersObj,
          query_params: queryObj,
          body: manualBody,
        });
      }

      if (response) {
        setResults(response);
        await refreshDashboard();
        showToast(
          `Analysis complete: ${response.total_detected} security indicators identified.`,
          response.total_detected > 0 ? 'success' : 'info'
        );
      }
    } catch (err) {
      showToast(err.message || 'Error executing request analysis.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) {
      showToast('Please select a JSON scan report file first.', 'error');
      return;
    }

    if (!file.name.endsWith('.json')) {
      showToast('Invalid file format. Only .json vulnerability scan reports are accepted.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit.', 'error');
      return;
    }

    try {
      setAnalyzing(true);
      const res = await api.importReport(file);
      await refreshDashboard();
      setUploadStatus(res);
      showToast(res.message || 'Scan report imported successfully.', 'success');
      setSelectedFile(null);
    } catch (err) {
      showToast(err.message || 'Failed to parse scan report file.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
            Request Analyzer
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Submit HTTP requests, paste raw payloads or import scan reports for heuristic triage.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full bg-[#ECFDF5] text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safe Local Inspection (Zero Exploitation)</span>
          </span>
        </div>
      </div>

      {/* Preset Quick Fill Buttons */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172554] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Sample Demonstration Presets</span>
          </div>
          <span className="text-[11px] text-[#64748B] hidden sm:inline">
            Click to auto-populate request inputs
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="p-2.5 text-left rounded-xl bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-blue-200 border border-[#E2E8F0] transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-[#172554] group-hover:text-[#2563EB] truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-[#64748B] truncate mt-0.5">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Mode Selector & Editor Container */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'raw'
                ? 'border-[#2563EB] text-[#2563EB] font-bold bg-white rounded-t-lg'
                : 'border-transparent text-[#64748B] hover:text-[#172554]'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Raw HTTP Request</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-[#2563EB] text-[#2563EB] font-bold bg-white rounded-t-lg'
                : 'border-transparent text-[#64748B] hover:text-[#172554]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Manual Request Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#2563EB] text-[#2563EB] font-bold bg-white rounded-t-lg'
                : 'border-transparent text-[#64748B] hover:text-[#172554]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>JSON Scan Report Import</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 sm:p-6">
          {/* TAB 1: RAW HTTP REQUEST */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              {/* Method and URL Live Preview Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#64748B] font-medium">Parsed:</span>
                    <span className="font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {preview.method}
                    </span>
                    <span className="font-mono text-[#172554] font-medium truncate max-w-xs sm:max-w-md">
                      {preview.url}
                    </span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-[#64748B] hidden sm:inline">
                    {preview.headerCount} Header{preview.headerCount !== 1 ? 's' : ''}
                  </span>
                  {preview.hasBody && (
                    <span className="text-emerald-700 font-semibold hidden sm:inline">
                      • Payload body attached
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearRaw}
                    className="text-xs font-semibold text-[#64748B] hover:text-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Editor</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Styled Textarea */}
              <div className="relative rounded-2xl border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-[#0F172A] shadow-inner">
                <textarea
                  value={rawRequest}
                  onChange={(e) => setRawRequest(e.target.value)}
                  rows={11}
                  className="w-full p-4 font-mono text-xs sm:text-sm text-emerald-400 bg-transparent resize-y outline-hidden leading-relaxed"
                  placeholder="GET /search?q=test HTTP/1.1&#10;Host: example.com&#10;User-Agent: Mozilla/5.0"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL REQUEST BUILDER */}
          {activeTab === 'manual' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-bold text-[#172554] block mb-1">HTTP Method</label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white font-semibold text-[#172554] focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="font-bold text-[#172554] block mb-1">Target URL / Endpoint</label>
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="/api/v1/users?id=1"
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono text-[#172554] focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Query Parameters Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#172554]">Query Parameters</label>
                  <button
                    type="button"
                    onClick={() => setManualQueryParams([...manualQueryParams, { key: '', value: '' }])}
                    className="text-[#2563EB] hover:text-blue-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Param
                  </button>
                </div>

                <div className="space-y-2">
                  {manualQueryParams.map((q, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Key (e.g. q)"
                        value={q.key}
                        onChange={(e) => {
                          const updated = [...manualQueryParams];
                          updated[i].key = e.target.value;
                          setManualQueryParams(updated);
                        }}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-mono text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={q.value}
                        onChange={(e) => {
                          const updated = [...manualQueryParams];
                          updated[i].value = e.target.value;
                          setManualQueryParams(updated);
                        }}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setManualQueryParams(manualQueryParams.filter((_, idx) => idx !== i))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Headers Builder */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#172554]">HTTP Headers</label>
                  <button
                    type="button"
                    onClick={() => setManualHeaders([...manualHeaders, { key: '', value: '' }])}
                    className="text-[#2563EB] hover:text-blue-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Header
                  </button>
                </div>

                <div className="space-y-2">
                  {manualHeaders.map((hdr, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Header Key (e.g. Authorization)"
                        value={hdr.key}
                        onChange={(e) => {
                          const updated = [...manualHeaders];
                          updated[i].key = e.target.value;
                          setManualHeaders(updated);
                        }}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-mono text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={hdr.value}
                        onChange={(e) => {
                          const updated = [...manualHeaders];
                          updated[i].value = e.target.value;
                          setManualHeaders(updated);
                        }}
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setManualHeaders(manualHeaders.filter((_, idx) => idx !== i))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Body */}
              <div>
                <label className="font-bold text-[#172554] block mb-1">
                  Request Body (JSON / Form / Raw)
                </label>
                <textarea
                  value={manualBody}
                  onChange={(e) => setManualBody(e.target.value)}
                  rows={4}
                  placeholder='{"username": "admin", "query": "..."}'
                  className="w-full p-3 font-mono text-xs rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all text-center space-y-3 ${
                  isDragging
                    ? 'border-[#2563EB] bg-[#EFF6FF]'
                    : 'border-[#E2E8F0] hover:border-blue-300 bg-[#F8FAFC]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto shadow-xs">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#172554]">
                    Drag & Drop Vulnerability Scan Report
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1">
                    Accepts structured scan reports in JSON format (Maximum file size: 5 MB).
                  </p>
                </div>

                <input
                  type="file"
                  id="scan-report-input"
                  accept=".json,application/json"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="scan-report-input"
                  className="inline-block px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#172554] hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                >
                  Browse Files
                </label>

                {selectedFile && (
                  <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs text-[#2563EB] font-semibold max-w-sm mx-auto shadow-xs">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleFileUpload()}
                    disabled={analyzing}
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Import and Triage Report</span>
                  </button>
                </div>
              )}

              {uploadStatus && (
                <div className="p-4 rounded-xl bg-[#ECFDF5] border border-emerald-200 text-emerald-900 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{uploadStatus.message}</span>
                  </p>
                  <p className="text-emerald-700">{uploadStatus.session_notice}</p>
                </div>
              )}
            </div>
          )}

          {/* Analyze Request Action Button */}
          {activeTab !== 'upload' && (
            <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>Deterministic heuristic inspection against OWASP Top 10 attack vectors.</span>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-card-hover cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Request Heuristics...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Analyze Request</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results Display */}
      {results && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5 sm:p-6 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-base font-bold text-[#172554]">
                  Triage Analysis Results
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5 font-mono">
                Analyzed Target: <span className="font-semibold text-[#172554]">{results.target_summary}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-blue-200">
                {results.total_detected} Security Indicator{results.total_detected !== 1 ? 's' : ''} Identified
              </span>
              <button
                onClick={() => navigate('/findings')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172554] transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View in Findings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {results.findings.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-[#172554]">No Common Vulnerability Indicators Detected</h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                No high-confidence SQL Injection, XSS, Command Injection, or Path Traversal signatures were matched in this input payload.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {results.findings.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setActiveFinding(f)}
                  className="p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] hover:border-blue-300 hover:shadow-card-hover transition-all bg-[#F8FAFC]/50 hover:bg-white cursor-pointer space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                        {f.id}
                      </span>
                      <h4 className="text-sm font-bold text-[#172554]">{f.name}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {f.detection_type}
                      </span>
                      <SeverityBadge severity={f.severity} size="xs" />
                      <RiskBadge score={f.risk_score} category={f.risk_category} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>

                  <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] space-y-1">
                    <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Matched Evidence / Indicator Pattern:
                    </div>
                    <pre className="font-mono text-xs text-rose-700 bg-rose-50/50 p-2 rounded-lg border border-rose-100 overflow-x-auto whitespace-pre-wrap">
                      {f.evidence}
                    </pre>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="font-mono text-[11px] text-[#64748B] truncate max-w-md">
                      Affected: {f.affected_target}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFinding(f);
                      }}
                      className="text-xs font-semibold text-[#2563EB] hover:text-blue-800 cursor-pointer"
                    >
                      Inspect Evidence & Defensive Remediation →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
