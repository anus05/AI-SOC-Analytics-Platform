import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlerts } from '../hooks/useAlerts';
import AlertDetail from '../components/alerts/AlertDetail';

const AlertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAlertDetail, updateAlertStatus, loading } = useAlerts();
  
  const [alert, setAlert] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: string }

  useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      const data = await getAlertDetail(id);
      if (active) {
        setAlert(data);
      }
    };
    loadDetail();
    return () => { active = false; };
  }, [id, getAlertDetail]);

  const showToast = (type, text) => {
    setToast({ type, text });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  };

  const handleUpdateStatus = async (alertId, newStatus) => {
    if (!alert) return;
    const originalStatus = alert.status;

    // 1. Optimistic Update
    setAlert(prev => prev ? { ...prev, status: newStatus } : null);
    showToast('success', `Optimistic Update: Marking ${newStatus.toUpperCase()}`);

    try {
      // 2. Perform PUT Request
      const success = await updateAlertStatus(alertId, newStatus);
      if (success) {
        showToast('success', `Successfully marked incident as ${newStatus.toUpperCase()}`);
      } else {
        // Revert on failure response
        setAlert(prev => prev ? { ...prev, status: originalStatus } : null);
        showToast('error', `Status update rejected by filter rules.`);
      }
    } catch (err) {
      // Revert on network connection crash
      setAlert(prev => prev ? { ...prev, status: originalStatus } : null);
      showToast('error', `Server connection timed out. Reverting changes.`);
    }
  };

  if (loading && !alert) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="material-symbols-outlined text-[20px] text-accent animate-spin">sync</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sm max-w-[1200px] mx-auto w-full">
      {/* Toast Notification alert */}
      {toast && (
        <div className={`fixed top-16 right-4 border font-mono text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded shadow-md z-50 flex items-center gap-xs animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-surface border-accent text-accent' 
            : 'bg-surface border-[#f85149] text-[#f85149]'
        }`}>
          <span className="material-symbols-outlined text-[14px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Orientation & Affordances */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm border-b border-border/40 pb-2">
        <div className="flex flex-col">
          <h1 className="font-sans text-[15px] font-bold text-on-surface uppercase tracking-wide">
            Incident Diagnosis Canvas
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant">
            Triaging workspace for incident #{id}.
          </p>
        </div>
        <button 
          onClick={() => navigate('/alerts')}
          className="flex items-center gap-xs text-on-surface-variant hover:text-accent transition-colors self-start font-mono text-[9px] uppercase font-bold tracking-wider py-1 px-2.5 bg-[#11151c] rounded border border-border"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          <span>Back to Registry</span>
        </button>
      </div>

      <AlertDetail 
        alert={alert} 
        onUpdateStatus={handleUpdateStatus} 
        onBack={() => navigate('/alerts')} 
      />
    </div>
  );
};

export default AlertDetailPage;
