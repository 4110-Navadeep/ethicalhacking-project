import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import FindingDetailModal from './components/FindingDetailModal';

// Pages
import Dashboard from './pages/Dashboard';
import RequestAnalyzer from './pages/RequestAnalyzer';
import VulnerabilityFindings from './pages/VulnerabilityFindings';
import RiskAssessment from './pages/RiskAssessment';
import RemediationCenter from './pages/RemediationCenter';
import ScanReports from './pages/ScanReports';
import AboutProject from './pages/AboutProject';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeFinding, setActiveFinding } = useApp();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analyzer" element={<RequestAnalyzer />} />
            <Route path="/findings" element={<VulnerabilityFindings />} />
            <Route path="/risk" element={<RiskAssessment />} />
            <Route path="/remediation" element={<RemediationCenter />} />
            <Route path="/reports" element={<ScanReports />} />
            <Route path="/about" element={<AboutProject />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Finding Detail Modal */}
      {activeFinding && (
        <FindingDetailModal
          finding={activeFinding}
          onClose={() => setActiveFinding(null)}
        />
      )}

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
