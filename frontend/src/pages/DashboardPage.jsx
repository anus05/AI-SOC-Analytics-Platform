import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../hooks/useAlerts';
import { useToast } from '../components/common/Toast';
import StatCard from '../components/common/StatCard';
import AlertsOverTimeChart from '../components/charts/AlertsOverTimeChart';
import AttackTypeChart from '../components/charts/AttackTypeChart';
import LogUploaderModal from '../components/common/LogUploaderModal';
import SOARActionModal from '../components/soar/SOARActionModal';

const DashboardPage = () => {
  const { getDashboardData, performScan, loading } = useAlerts();
  const toast = useToast();
  const navigate = useNavigate();

  const [dbData, setDbData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [scanTarget, setScanTarget] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modals state
  const [isLogUploadOpen, setIsLogUploadOpen] = useState(false);
  const [isSoarModalOpen, setIsSoarModalOpen] = useState(false);
  const [soarTarget, setSoarTarget] = useState('185.199.108.153');

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      setFetchError(null);
      const data = await getDashboardData();
      setDbData(data);
      if (isManual) toast.success("Dashboard telemetry synchronized with PostgreSQL.");
    } catch (err) {
      setFetchError(err.message || "Failed to load dashboard metrics.");
      toast.error(err.message || "Dashboard sync error.");
    } finally {
      setIsRefreshing(false);
    }
  }, [getDashboardData, toast]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!scanTarget) return;
    setScanning(true);
    setScanResult(null);

    try {
      toast.info(`Executing ML & threat auditor scan for target: ${scanTarget}...`);
      const result = await performScan(scanTarget);
      setScanning(false);
      setScanResult(result);
      setScanTarget('');
      toast.success(`Scan completed. ${result.alerts_found || 0} alert(s) detected and stored to PostgreSQL.`);
      loadData();
    } catch (err) {
      setScanning(false);
      toast.error(err.message || "Scan failed.");
    }
  };

  const getAlertSeverityColor = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL': return 'bg-[#f85149]';
      case 'HIGH': return 'bg-[#d29922]';
      case 'MEDIUM': return 'bg-[#58a6ff]';
      case 'LOW':
      default: return 'bg-[#8b949e]';
    }
  };

  const isInitialLoading = loading && !dbData;

  return (
    <div className="space-y-sm">
      {/* Modals */}
      <LogUploaderModal
        isOpen={isLogUploadOpen}
        onClose={() => setIsLogUploadOpen(false)}
        onUploadSuccess={() => loadData(true)}
      />
      <SOARActionModal
        isOpen={isSoarModalOpen}
        onClose={() => setIsSoarModalOpen(false)}
        target={soarTarget}
      />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-sm">
        <div>
          <h1 className="font-sans text-[16px] font-bold text-on-surface uppercase tracking-wide">
            Security Operations Dashboard
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant">
            Live telemetry & automated ML threat detection from PostgreSQL.
          </p>
        </div>
        <div className="flex items-center gap-xs">
          <button
            onClick={() => setIsLogUploadOpen(true)}
            className="flex items-center gap-xs px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] hover:bg-cyan-500/20 transition-all cursor-pointer font-bold select-none"
          >
            <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
            <span>Ingest Security Logs</span>
          </button>
          <button
            onClick={() => {
              setSoarTarget("185.199.108.153");
              setIsSoarModalOpen(true);
            }}
            className="flex items-center gap-xs px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] hover:bg-amber-500/20 transition-all cursor-pointer font-bold select-none"
          >
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span>SOAR Orchestrator</span>
          </button>
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing || loading}
            className="flex items-center gap-xs px-3 py-1.5 rounded bg-surface border border-border text-on-surface hover:text-accent font-mono text-[10px] transition-all cursor-pointer disabled:opacity-50 select-none"
          >
            <span className={`material-symbols-outlined text-[14px] ${isRefreshing ? 'animate-spin text-accent' : ''}`}>
              refresh
            </span>
            <span>{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Connection / Synchronization Error Banner */}
      {fetchError && (
        <div className="p-3 border border-[#f85149]/40 bg-[#f85149]/10 text-[#f85149] font-mono text-[11px] rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm animate-fade-in">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">wifi_off</span>
            <span>{fetchError}</span>
          </div>
          <button
            onClick={() => loadData(true)}
            className="px-3 py-1 rounded bg-[#f85149] text-white font-sans text-[10px] font-bold uppercase tracking-wider hover:bg-[#da3633] transition-colors cursor-pointer select-none"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Bento Grid Layout - Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-sm">
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <StatCard 
            title="Total Alerts" 
            value={dbData ? dbData.totalAlerts.toLocaleString() : '---'} 
            diff={dbData ? dbData.totalAlertsDiff : null} 
            icon="monitoring" 
            showSparkline={true}
            loading={isInitialLoading}
          />
          <StatCard 
            title="High-Severity" 
            value={dbData ? (dbData.criticalAlerts + dbData.highSeverity) : '---'} 
            pulse={dbData && (dbData.criticalAlerts + dbData.highSeverity) > 0 ? "medium" : null} 
            icon="warning" 
            iconColor="text-[#d29922]"
            loading={isInitialLoading}
          />
          <StatCard 
            title="Average Threat Score" 
            value={dbData ? `${dbData.threatScore}/100` : '---'} 
            pulse={dbData && dbData.threatScore >= 70 ? "critical" : null} 
            icon="policy" 
            iconColor="text-[#f85149]"
            valueColor="text-[#f85149]"
            loading={isInitialLoading}
          />
          <StatCard 
            title="Today's Detections" 
            value={dbData ? dbData.detectionsToday : '---'} 
            icon="radar"
            loading={isInitialLoading}
          />
        </div>

        {/* Alerts Over Time Chart */}
        <div className="lg:col-span-7 bg-surface border border-border rounded p-3 flex flex-col min-h-[190px] relative overflow-hidden card-hover">
          <div className="flex justify-between items-center mb-sm">
            <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider">
              Alerts over Time (Last 24 Hours)
            </h2>
            <span className="font-mono text-[9px] text-on-surface-variant">DB REALTIME</span>
          </div>
          <div className="flex-1 min-h-[120px]">
            <AlertsOverTimeChart dataPoints={dbData?.alertsTrend} loading={isInitialLoading} />
          </div>
        </div>
      </div>

      {/* Charts & Recent Incidents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-sm">
        {/* Attack Types Chart */}
        <div className="lg:col-span-6 bg-surface border border-border rounded p-3 flex flex-col justify-between card-hover">
          <div className="flex justify-between items-center mb-sm">
            <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider">
              Attack Types Summary
            </h2>
            <span className="font-mono text-[9px] text-accent font-bold">
              TOP: {dbData?.topAttackType || 'N/A'}
            </span>
          </div>
          <div className="flex-grow">
            <AttackTypeChart dataPoints={dbData?.attackTypes} totalAlerts={dbData?.totalAlerts} loading={isInitialLoading} />
          </div>
        </div>

        {/* Recent Incident Logs Table */}
        <div className="lg:col-span-6 bg-surface border border-border rounded overflow-hidden flex flex-col card-hover">
          <div className="px-3 py-2 border-b border-border flex justify-between items-center bg-[#161b22]/30">
            <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider">
              Recent Incident Logs
            </h2>
            <button 
              onClick={() => navigate('/alerts')}
              className="font-sans text-[9px] font-bold text-accent uppercase hover:text-white transition-colors cursor-pointer select-none"
            >
              View All Logs ({dbData?.totalAlerts || 0})
            </button>
          </div>
          <div className="flex-grow divide-y divide-border/60 max-h-[190px] overflow-y-auto">
            {isInitialLoading ? (
              [...Array(5)].map((_, idx) => (
                <div key={idx} className="px-3 py-2 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-sm flex-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                    <div className="space-y-1 flex-1">
                      <div className="h-3 w-1/3 bg-[#22262f] rounded"></div>
                      <div className="h-2.5 w-1/4 bg-[#22262f]/70 rounded"></div>
                    </div>
                  </div>
                  <div className="h-2.5 w-10 bg-[#22262f]/60 rounded"></div>
                </div>
              ))
            ) : !dbData?.recentAlerts || dbData.recentAlerts.length === 0 ? (
              <div className="p-4 text-center text-on-surface-variant font-mono text-[11px]">
                No incident logs stored in PostgreSQL database.
              </div>
            ) : (
              dbData.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => navigate(`/alerts/${alert.id}`)}
                  className="px-3 py-2 hover:bg-[#161b22]/50 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-sm">
                    <div className={`w-2 h-2 rounded-full ${getAlertSeverityColor(alert.severity)}`}></div>
                    <div>
                      <div className="font-mono text-[11px] text-on-surface group-hover:text-accent transition-colors font-bold">
                        {alert.title}
                      </div>
                      <div className="font-mono text-[10px] text-on-surface-variant">
                        IP: {alert.sourceIp} | Target: {alert.target}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <div>
                      <span className="font-mono text-[9px] text-on-surface-variant block">
                        {alert.time}
                      </span>
                      <span className="font-mono text-[9px] text-accent font-bold">
                        Score: {alert.threatScore}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSoarTarget(alert.sourceIp);
                        setIsSoarModalOpen(true);
                      }}
                      className="px-2 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/20"
                    >
                      SOAR
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Network Vulnerability Scanner Section */}
      <div className="bg-surface border border-border rounded p-3 card-hover">
        <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider mb-1">
          Live Security & ML Model Threat Scanner
        </h2>
        <p className="font-sans text-[11px] text-on-surface-variant mb-3 max-w-2xl">
          Trigger live log parsing, rule-based threat detectors, and Random Forest ML prediction pipeline (`best_model.pkl`) to identify and store threats in PostgreSQL.
        </p>

        <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-sm max-w-xl">
          <input 
            type="text"
            value={scanTarget}
            onChange={(e) => setScanTarget(e.target.value)}
            disabled={scanning}
            placeholder="e.g. 192.168.1.0/24 or auth.internal.corp"
            className="input-field flex-1 rounded px-3 py-1.5 disabled:opacity-50 font-mono text-[11px]"
            required
          />
          <button
            type="submit"
            disabled={scanning || loading}
            className="btn-primary rounded py-1.5 px-4 font-sans font-bold text-[10px] uppercase tracking-wider transition-all flex justify-center items-center gap-xs cursor-pointer select-none active:scale-95 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                <span>Running ML Pipeline...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px]">radar</span>
                <span>Trigger Live Scan</span>
              </>
            )}
          </button>
        </form>

        {scanResult && (
          <div className="mt-3 p-3 rounded bg-[#0d1117] border border-border text-left animate-fade-in">
            <div className="flex items-center gap-sm mb-2 text-accent border-b border-border/40 pb-[4px]">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                Scan Report: {scanResult.target} ({scanResult.status.toUpperCase()})
              </span>
            </div>
            {scanResult.alerts_found > 0 ? (
              <div className="space-y-sm">
                <p className="font-sans text-[11px] text-[#f85149] font-bold">
                  Warning: Found {scanResult.alerts_found} threat indicators during log scan:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-xs">
                  {scanResult.details.map((detail, idx) => (
                    <div key={idx} className="p-2 bg-surface border border-[#f85149]/30 rounded">
                      <span className="font-mono text-[10px] text-[#f85149] block font-bold">{detail.type.toUpperCase()}</span>
                      <span className="font-sans text-[11px] text-on-surface-variant">{detail.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="font-sans text-[11px] text-accent">
                Diagnostics clear. No network anomalies detected on the target.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
