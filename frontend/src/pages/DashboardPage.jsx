import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../hooks/useAlerts';
import StatCard from '../components/common/StatCard';
import AlertsOverTimeChart from '../components/charts/AlertsOverTimeChart';
import AttackTypeChart from '../components/charts/AttackTypeChart';

const DashboardPage = () => {
  const { getDashboardData, performScan, loading, error } = useAlerts();
  const navigate = useNavigate();

  const [dbData, setDbData] = useState(null);
  const [scanTarget, setScanTarget] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const data = await getDashboardData();
      if (active) {
        setDbData(data);
      }
    };
    loadData();
    return () => { active = false; };
  }, [getDashboardData]);

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!scanTarget) return;
    setScanning(true);
    setScanResult(null);

    const result = await performScan(scanTarget);
    setScanning(false);
    setScanResult(result);
    setScanTarget('');
  };

  const getAlertSeverityColor = (severity) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return 'bg-[#f85149]';
      case 'HIGH': return 'bg-[#d29922]';
      case 'MEDIUM': return 'bg-[#8b949e]';
      case 'LOW':
      default: return 'bg-[#6e7681]';
    }
  };

  const isDataLoading = loading && !dbData;
  const totalAlertsVal = dbData ? dbData.totalAlerts.toLocaleString() : '---';
  const totalAlertsDiffVal = dbData ? dbData.totalAlertsDiff : null;
  const highSeverityVal = dbData ? dbData.highSeverity : '---';
  const threatScoreVal = dbData ? `${dbData.threatScore}/100` : '---';
  const detectionsTodayVal = dbData ? dbData.detectionsToday : '---';
  const alertsTrendVal = dbData ? dbData.alertsTrend : null;
  const attackTypesVal = dbData ? dbData.attackTypes : null;
  const recentAlertsVal = dbData ? dbData.recentAlerts : [];

  return (
    <div className="space-y-sm">
      {/* Dashboard Page Headers */}
      <div className="flex flex-col mb-2">
        <h1 className="font-sans text-[16px] font-bold text-on-surface uppercase tracking-wide">
          Security Operations Dashboard
        </h1>
        <p className="font-sans text-[11px] text-on-surface-variant">
          Global threat telemetry overview & real-time vulnerability auditor.
        </p>
      </div>

      {/* Connection Warning Banner */}
      {error && (
        <div className="p-2 border border-severity-high/30 bg-severity-high/10 text-severity-high font-mono text-[10px] rounded flex justify-between items-center gap-sm animate-fade-in">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[14px]">wifi_off</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-sm">
        {/* Stat Cards 2x2 Area - Reflow to 1 col on mobile, 2 col on tablet/desktop */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <StatCard 
            title="Total Alerts" 
            value={totalAlertsVal} 
            diff={totalAlertsDiffVal} 
            icon="monitoring" 
            showSparkline={true}
            loading={isDataLoading}
          />
          <StatCard 
            title="High-Severity" 
            value={highSeverityVal} 
            pulse={dbData ? "medium" : null} 
            icon="warning" 
            iconColor="text-[#d29922]"
            loading={isDataLoading}
          />
          <StatCard 
            title="Threat Score" 
            value={threatScoreVal} 
            pulse={dbData ? "critical" : null} 
            icon="policy" 
            iconColor="text-[#f85149]"
            valueColor="text-[#f85149]"
            loading={isDataLoading}
          />
          <StatCard 
            title="Detections Today" 
            value={detectionsTodayVal} 
            icon="radar"
            loading={isDataLoading}
          />
        </div>

        {/* Trends Section - Area Chart */}
        <div className="lg:col-span-7 bg-surface border border-border rounded p-3 flex flex-col min-h-[190px] relative overflow-hidden card-hover">
          <div className="flex justify-between items-center mb-sm">
            <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider">Alerts over Time</h2>
            <span className="font-mono text-[9px] text-on-surface-variant">LAST 24H</span>
          </div>
          <div className="flex-1 min-h-[120px]">
            <AlertsOverTimeChart dataPoints={alertsTrendVal} loading={isDataLoading} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-sm">
        {/* Attack Types Bar Chart */}
        <div className="lg:col-span-6 bg-surface border border-border rounded p-3 flex flex-col justify-between card-hover">
          <h2 className="font-sans text-[10px] font-bold text-on-surface mb-sm uppercase tracking-wider">Attack Types Summary</h2>
          <div className="flex-grow">
            <AttackTypeChart dataPoints={attackTypesVal} totalAlerts={dbData?.totalAlerts} loading={isDataLoading} />
          </div>
        </div>

        {/* Recent Alerts List */}
        <div className="lg:col-span-6 bg-surface border border-border rounded overflow-hidden flex flex-col card-hover">
          <div className="px-3 py-2 border-b border-border flex justify-between items-center bg-[#161b22]/30">
            <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider">Recent Incident Logs</h2>
            <button 
              onClick={() => navigate('/alerts')}
              className="font-sans text-[9px] font-bold text-accent uppercase hover:text-white transition-colors cursor-pointer select-none"
            >
              View Logs
            </button>
          </div>
          <div className="flex-grow divide-y divide-border/60 max-h-[180px] overflow-y-auto">
            {isDataLoading ? (
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
            ) : (
              recentAlertsVal.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => navigate(`/alerts/${alert.id}`)}
                  className="px-3 py-1.5 hover:bg-[#161b22]/50 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${getAlertSeverityColor(alert.severity)}`}></div>
                    <div>
                      <div className="font-mono text-[11px] text-on-surface group-hover:text-accent transition-colors font-bold">
                        {alert.title}
                      </div>
                      <div className="font-mono text-[10px] text-on-surface-variant">
                        Target: {alert.target}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] text-on-surface-variant whitespace-nowrap">
                    {alert.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Network Vulnerability Scanner Section */}
      <div className="bg-surface border border-border rounded p-3 card-hover">
        <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider mb-1">AI Threat & Security Scanner</h2>
        <p className="font-sans text-[11px] text-on-surface-variant mb-3 max-w-2xl">
          Instantly scan specific host endpoints, subnets, or IP domains to query threat vectors and detect credential sprays, port sweeps, or anomalies.
        </p>

        <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-sm max-w-xl">
          <input 
            type="text"
            value={scanTarget}
            onChange={(e) => setScanTarget(e.target.value)}
            disabled={scanning}
            placeholder="e.g. 192.168.1.0/24 or auth.internal.corp"
            className="input-field flex-1 rounded px-3 py-1.5 disabled:opacity-50"
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
                <span>Auditing Target...</span>
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
          <div className="mt-3 p-3 rounded bg-[#0d1117] border border-border text-left">
            <div className="flex items-center gap-sm mb-2 text-accent border-b border-border/40 pb-[4px]">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                Scan Report: {scanResult.target} ({scanResult.status.toUpperCase()})
              </span>
            </div>
            {scanResult.alerts_found > 0 ? (
              <div className="space-y-sm">
                <p className="font-sans text-[11px] text-[#f85149] font-bold">
                  Warning: Found {scanResult.alerts_found} threat indicators during network scan:
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
