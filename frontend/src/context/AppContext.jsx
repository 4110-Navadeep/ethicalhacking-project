import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFinding, setActiveFinding] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const handleLoadSample = async () => {
    try {
      setLoading(true);
      await api.loadSampleFindings();
      await refreshDashboard();
      showToast('Loaded realistic academic sample findings.', 'success');
    } catch (err) {
      showToast(err.message || 'Error loading samples.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = async () => {
    try {
      setLoading(true);
      await api.clearSession();
      await refreshDashboard();
      showToast('Temporary in-memory session reset successfully.', 'info');
    } catch (err) {
      showToast(err.message || 'Error clearing session.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (findingId, newStatus) => {
    try {
      const updated = await api.updateFindingStatus(findingId, newStatus);
      // Update in active modal if currently open
      if (activeFinding && activeFinding.id === findingId) {
        setActiveFinding(updated);
      }
      await refreshDashboard();
      showToast(`Status updated to ${newStatus}.`, 'success');
      return updated;
    } catch (err) {
      showToast(err.message || 'Error updating status.', 'error');
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        dashboardData,
        loading,
        error,
        refreshDashboard,
        activeFinding,
        setActiveFinding,
        toasts,
        showToast,
        removeToast,
        loadSampleData: handleLoadSample,
        clearSessionData: handleClearSession,
        updateStatus: handleUpdateStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
