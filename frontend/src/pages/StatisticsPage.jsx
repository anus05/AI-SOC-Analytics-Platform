import React, { useEffect, useState, useCallback } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { useToast } from '../components/common/Toast';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const StatisticsPage = () => {
  const { getStatisticsData, loading } = useAlerts();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      setError(null);
      const data = await getStatisticsData();
      setStats(data);
      if (isManual) toast.success("Telemetry statistics updated from PostgreSQL.");
    } catch (err) {
      setError(err.message || "Failed to load telemetry statistics.");
      toast.error(err.message || "Telemetry statistics fetch error.");
    } finally {
      setIsRefreshing(false);
    }
  }, [getStatisticsData, toast]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => {
      loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-sm">
        <span className="material-symbols-outlined text-[32px] text-accent animate-spin">sync</span>
        <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">
          Querying PostgreSQL Telemetry Statistics...
        </span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-4 border border-[#f85149]/40 bg-[#f85149]/10 rounded flex flex-col items-center text-center gap-sm my-8 max-w-lg mx-auto">
        <span className="material-symbols-outlined text-[32px] text-[#f85149]">error</span>
        <h2 className="font-sans text-[14px] font-bold text-[#f85149]">Telemetry Statistics Unavailable</h2>
        <p className="font-mono text-[11px] text-on-surface-variant">{error}</p>
        <button
          onClick={() => loadStats(true)}
          className="mt-2 px-4 py-1.5 bg-[#f85149] text-white font-sans text-[11px] font-bold rounded uppercase tracking-wider hover:bg-[#da3633] transition-colors cursor-pointer"
        >
          Retry Database Fetch
        </button>
      </div>
    );
  }

  const attackDistribution = stats?.attackVectorDistribution || [];
  const doughnutData = {
    labels: attackDistribution.map(item => item.name),
    datasets: [
      {
        data: attackDistribution.map(item => item.value),
        backgroundColor: attackDistribution.map(item => item.color),
        borderColor: '#11151c',
        borderWidth: 1.5,
        hoverOffset: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#11151c',
        titleColor: '#c9d1d9',
        bodyColor: '#c9d1d9',
        titleFont: { family: 'Inter', size: 10, weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        borderColor: '#22262f',
        borderWidth: 1,
        padding: 6,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw}%`
        }
      }
    }
  };

  const weeklyTrend = stats?.weeklyTrend || [];
  const barData = {
    labels: weeklyTrend.map(w => w.day),
    datasets: [
      {
        label: 'Detections',
        data: weeklyTrend.map(w => w.count),
        backgroundColor: '#58a6ff',
        borderRadius: 2,
        barThickness: 16
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#11151c',
        titleColor: '#c9d1d9',
        bodyColor: '#c9d1d9',
        titleFont: { family: 'Inter', size: 10, weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono', size: 10 },
        borderColor: '#22262f',
        borderWidth: 1,
        padding: 6
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8b949e', font: { family: 'JetBrains Mono', size: 9 } }
      },
      y: {
        grid: { color: 'rgba(34, 38, 47, 0.4)' },
        ticks: { color: '#8b949e', font: { family: 'JetBrains Mono', size: 9 } }
      }
    }
  };

  return (
    <div className="space-y-md">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
        <div>
          <h1 className="font-sans text-[16px] font-bold text-on-surface uppercase tracking-wide">
            Telemetry Statistics & Threat Analytics
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant">
            PostgreSQL query results for threat vectors, MITRE ATT&CK techniques, and malicious IP ranges.
          </p>
        </div>
        <button
          onClick={() => loadStats(true)}
          disabled={isRefreshing || loading}
          className="flex items-center gap-xs px-3 py-1.5 rounded bg-surface border border-border text-on-surface hover:text-accent font-mono text-[10px] transition-all cursor-pointer disabled:opacity-50 select-none"
        >
          <span className={`material-symbols-outlined text-[14px] ${isRefreshing ? 'animate-spin text-accent' : ''}`}>
            refresh
          </span>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Statistics'}</span>
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-sm">
        {/* Detection Accuracy Gauge */}
        <div className="col-span-1 md:col-span-4 bg-surface border border-border rounded p-md flex flex-col items-center justify-center min-h-[220px] card-hover">
          <h2 className="font-sans text-[10px] text-on-surface-variant font-bold self-start uppercase tracking-wider">
            Model Precision & Confidence
          </h2>
          
          <div className="relative w-32 h-32 flex items-center justify-center mt-sm">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="42" stroke="#22262f" strokeWidth="6"></circle>
              <circle 
                cx="50" 
                cy="50" 
                fill="none" 
                r="42" 
                stroke="#58a6ff" 
                strokeDasharray="263.8" 
                strokeDashoffset={263.8 - (263.8 * (stats?.detectionAccuracy || 0)) / 100} 
                strokeWidth="6"
                strokeLinecap="square"
                className="transition-all duration-500 ease-out"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[22px] text-accent font-bold">
                {stats?.detectionAccuracy ?? 0}
                <span className="text-[12px] font-normal">%</span>
              </span>
              <span className="font-sans text-[8px] text-on-surface-variant tracking-wider uppercase mt-px">Detection Accuracy</span>
            </div>
          </div>
        </div>

        {/* Attack Vector Doughnut Chart */}
        <div className="col-span-1 md:col-span-8 bg-surface border border-border rounded p-md min-h-[220px] flex flex-col card-hover">
          <h2 className="font-sans text-[10px] text-on-surface-variant font-bold mb-sm uppercase tracking-wider">
            Attack Vector Distribution (Real Database Data)
          </h2>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-md">
            <div className="w-32 h-32 relative shrink-0">
              {attackDistribution.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-on-surface-variant">
                  No data
                </div>
              )}
            </div>

            <div className="space-y-[4px] w-full max-w-xs text-left">
              {attackDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b border-border/40 pb-[2px]">
                  <div className="flex items-center gap-sm">
                    <span className="w-2 h-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-sans text-[11px] text-on-surface">{item.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-accent font-bold">
                    {item.value}% ({item.count} alerts)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Detection Trend Chart */}
        <div className="col-span-1 md:col-span-6 bg-surface border border-border rounded p-md min-h-[220px] flex flex-col card-hover">
          <h2 className="font-sans text-[10px] text-on-surface-variant font-bold mb-sm uppercase tracking-wider">
            Weekly Detection Trend (Last 7 Days)
          </h2>
          <div className="flex-1 min-h-[140px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* MITRE ATT&CK Distribution */}
        <div className="col-span-1 md:col-span-6 bg-surface border border-border rounded p-md min-h-[220px] flex flex-col card-hover">
          <h2 className="font-sans text-[10px] text-on-surface-variant font-bold mb-sm uppercase tracking-wider">
            MITRE ATT&CK Technique Breakdown
          </h2>
          <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
            {stats?.mitreDistribution && stats.mitreDistribution.length > 0 ? (
              stats.mitreDistribution.map((m, idx) => (
                <div key={idx} className="p-2 bg-[#0d1117] border border-border/50 rounded flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[11px] text-accent font-bold block">{m.technique}</span>
                    <span className="font-sans text-[10px] text-on-surface-variant">{m.count} incident occurrences</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-on-surface bg-surface px-2 py-0.5 rounded border border-border">
                    {m.percentage}%
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center font-mono text-[10px] text-on-surface-variant">
                No MITRE technique distribution recorded.
              </div>
            )}
          </div>
        </div>

        {/* Top Malicious Source IPs */}
        <div className="col-span-1 md:col-span-12 bg-surface border border-border rounded overflow-hidden card-hover">
          <div className="px-md py-sm border-b border-border bg-[#161b22]/50 flex justify-between items-center">
            <h2 className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
              Top Malicious Source IP Address Ranges
            </h2>
            <span className="font-mono text-[9px] text-on-surface-variant">
              TOTAL ALERTS: {stats?.totalAlerts || 0}
            </span>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="font-sans text-[9px] text-on-surface-variant border-b border-border bg-[#11151c] uppercase tracking-wider">
                  <th className="p-2 text-left font-bold">Rank</th>
                  <th className="p-2 text-left font-bold">IP Address</th>
                  <th className="p-2 text-right font-bold">Incident Hits</th>
                  <th className="p-2 text-left font-bold">Source Classification</th>
                  <th className="p-2 text-left font-bold">Max Severity Risk</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] text-on-surface divide-y divide-border/60">
                {stats?.topMaliciousIps && stats.topMaliciousIps.length > 0 ? (
                  stats.topMaliciousIps.map((ipRow, idx) => {
                    const isCritical = (ipRow.level || '').toUpperCase() === 'CRITICAL';
                    const isHigh = (ipRow.level || '').toUpperCase() === 'HIGH';
                    const levelColor = isCritical 
                      ? 'text-[#f85149] border-[#f85149]/30 bg-[#f85149]/10' 
                      : isHigh 
                      ? 'text-[#d29922] border-[#d29922]/30 bg-[#d29922]/10' 
                      : 'text-[#8b949e] border-[#22262f] bg-[#22262f]/30';
                    const isZebra = idx % 2 === 1;
                    
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-[#161b22]/60 transition-colors ${
                          isZebra ? 'bg-[#161b22]/20' : 'bg-surface'
                        }`}
                      >
                        <td className="p-2 text-left font-bold text-on-surface-variant">{ipRow.rank}</td>
                        <td className={`p-2 text-left font-bold ${isCritical ? 'text-[#f85149]' : 'text-accent'}`}>{ipRow.ip}</td>
                        <td className="p-2 text-right font-semibold">{ipRow.hits}</td>
                        <td className="p-2 text-left text-on-surface-variant font-sans">{ipRow.country}</td>
                        <td className="p-2 text-left">
                          <span className={`px-2 py-[2px] border rounded text-[9px] font-mono font-bold ${levelColor}`}>
                            {(ipRow.level || 'LOW').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center font-mono text-[11px] text-on-surface-variant">
                      No malicious source IPs logged in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
