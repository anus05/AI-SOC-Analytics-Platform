import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlerts } from '../hooks/useAlerts';
import { useToast } from '../components/common/Toast';
import AlertDetail from '../components/alerts/AlertDetail';
import AICopilotPanel from '../components/copilot/AICopilotPanel';
import ExplainableScoreCard from '../components/alerts/ExplainableScoreCard';

const AlertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAlertDetail, updateAlertStatus, loading } = useAlerts();
  const toast = useToast();
  
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(null);
  const [showCopilot, setShowCopilot] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setError(null);
      const data = await getAlertDetail(id);
      setAlert(data);
    } catch (err) {
      setError(err.message || `Incident alert #${id} not found.`);
      toast.error(err.message || "Failed to load incident detail.");
    }
  }, [id, getAlertDetail, toast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleUpdateStatus = async (alertId, newStatus) => {
    if (!alert) return;
    const originalStatus = alert.status;

    setAlert(prev => prev ? { ...prev, status: newStatus } : null);
    try {
      const updated = await updateAlertStatus(alertId, newStatus);
      if (updated) {
        setAlert(updated);
        toast.success(`Marked incident #${alertId} as ${newStatus.toUpperCase()}`);
      } else {
        setAlert(prev => prev ? { ...prev, status: originalStatus } : null);
        toast.error(`Failed to update alert status in database.`);
      }
    } catch (err) {
      setAlert(prev => prev ? { ...prev, status: originalStatus } : null);
      toast.error(err.message || `Server connection timed out.`);
    }
  };

  if (loading && !alert) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-sm">
        <span className="material-symbols-outlined text-[28px] text-accent animate-spin">sync</span>
        <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">
          Querying Incident #{id} from PostgreSQL...
        </span>
      </div>
    );
  }

  if (error && !alert) {
    return (
      <div className="p-6 border border-[#f85149]/40 bg-[#f85149]/10 rounded flex flex-col items-center text-center gap-sm my-8 max-w-lg mx-auto">
        <span className="material-symbols-outlined text-[32px] text-[#f85149]">report</span>
        <h2 className="font-sans text-[14px] font-bold text-[#f85149]">Incident Not Found</h2>
        <p className="font-mono text-[11px] text-on-surface-variant">{error}</p>
        <button
          onClick={() => navigate('/alerts')}
          className="mt-2 px-4 py-1.5 bg-surface border border-border text-on-surface hover:text-accent font-sans text-[11px] font-bold rounded uppercase tracking-wider transition-colors cursor-pointer"
        >
          Back to Registry Logs
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-[1200px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/10 pb-3">
        <div className="flex flex-col">
          <h1 className="font-sans text-[15px] font-bold text-slate-200 uppercase tracking-wide">
            Incident Diagnosis Canvas
          </h1>
          <p className="font-sans text-[11px] text-slate-400">
            Detailed telemetry audit and MITRE ATT&CK recommendation for incident #{id}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {alert && (
            <button
              onClick={() => navigate(`/attack-timeline/${alert.id}`)}
              className="flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold tracking-wider py-1.5 px-3 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-accent hover:border-teal-500/40 cursor-pointer select-none backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-[14px]">hub</span>
              <span>View Attack Chain</span>
            </button>
          )}
          <button
            onClick={() => setShowCopilot(!showCopilot)}
            className={`flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold tracking-wider py-1.5 px-3 rounded-lg border cursor-pointer select-none transition-all backdrop-blur-sm ${
              showCopilot 
                ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-xs' 
                : 'bg-slate-900/60 border-white/10 text-slate-300 hover:text-accent hover:border-teal-500/40'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">psychology</span>
            <span>{showCopilot ? 'Close AI Copilot' : 'AI Investigate'}</span>
          </button>
          <button 
            onClick={() => navigate('/alerts')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-accent transition-colors self-start font-mono text-[9px] uppercase font-bold tracking-wider py-1.5 px-3 bg-slate-900/60 rounded-lg border border-white/10 cursor-pointer select-none backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Back to Registry</span>
          </button>
        </div>
      </div>

      <AlertDetail 
        alert={alert} 
        onUpdateStatus={handleUpdateStatus} 
        onBack={() => navigate('/alerts')} 
      />

      {/* AI Investigation Section */}
      {showCopilot && alert && (
        <div className="space-y-3 animate-fade-in">
          <ExplainableScoreCard alertId={alert.id} initialScore={alert.threatScore || 85} />
          <AICopilotPanel alertId={alert.id} onClose={() => setShowCopilot(false)} />
        </div>
      )}
    </div>
  );
};

export default AlertDetailPage;

