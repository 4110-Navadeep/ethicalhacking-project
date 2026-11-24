const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.message || errorMsg;
    } catch (e) {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse(res);
  },

  // Dashboard Stats
  async getDashboard() {
    const res = await fetch(`${API_BASE_URL}/api/dashboard`);
    return handleResponse(res);
  },

  // Findings
  async getFindings(filters = {}) {
    const params = new URLSearchParams();
    if (filters.severity && filters.severity !== 'All') params.append('severity', filters.severity);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.source && filters.source !== 'All') params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/findings${queryString}`);
    return handleResponse(res);
  },

  async getFindingById(id) {
    const res = await fetch(`${API_BASE_URL}/api/findings/${id}`);
    return handleResponse(res);
  },

  async updateFindingStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/api/findings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async loadSampleFindings() {
    const res = await fetch(`${API_BASE_URL}/api/findings/sample`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Analyzers
  async analyzeRaw(raw_request) {
    const res = await fetch(`${API_BASE_URL}/api/analyze/raw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_request }),
    });
    return handleResponse(res);
  },

  async analyzeManual(payload) {
    const res = await fetch(`${API_BASE_URL}/api/analyze/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async importReport(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/import-report`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Session
  async clearSession() {
    const res = await fetch(`${API_BASE_URL}/api/session`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async getSessionStatus() {
    const res = await fetch(`${API_BASE_URL}/api/session/status`);
    return handleResponse(res);
  },

  // Export
  async exportJson() {
    const res = await fetch(`${API_BASE_URL}/api/reports/export/json`);
    const data = await handleResponse(res);
    
    // Download directly via blob
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VulnTriage_Export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return data;
  },

  async downloadPdf() {
    const res = await fetch(`${API_BASE_URL}/api/reports/export/pdf`);
    if (!res.ok) {
      let errMsg = 'Failed to generate PDF report';
      try {
        const err = await res.json();
        errMsg = err.detail || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VulnTriage_Summary_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
};
