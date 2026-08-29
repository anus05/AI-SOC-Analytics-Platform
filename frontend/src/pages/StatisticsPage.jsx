import React, { useEffect, useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const timeframeData = {
  '24h': {
    detectionAccuracy: 98.2,
    attackVectorDistribution: [
      { name: 'DDoS / Botnet', value: 60, color: '#00dbe7' },
      { name: 'SQL Injection', value: 20, color: '#ffb4ab' },
      { name: 'Malware / Ransomware', value: 10, color: '#ffd58c' },
      { name: 'Phishing attempts', value: 10, color: '#00f2ff' }
    ],
    topMaliciousIps: [
      { rank: '#1', ip: '192.168.1.104', hits: '1,205', country: 'Russia', level: 'Critical' },
      { rank: '#2', ip: '10.0.0.52', hits: '842', country: 'China', level: 'Critical' },
      { rank: '#3', ip: '172.16.254.1', hits: '350', country: 'Unknown', level: 'High' }
    ]
  },
  '7d': {
    detectionAccuracy: 96.4,
    attackVectorDistribution: [
      { name: 'DDoS / Botnet', value: 45, color: '#00dbe7' },
      { name: 'SQL Injection', value: 25, color: '#ffb4ab' },
      { name: 'Malware / Ransomware', value: 15, color: '#ffd58c' },
      { name: 'Phishing attempts', value: 15, color: '#00f2ff' }
    ],
    topMaliciousIps: [
      { rank: '#1', ip: '192.168.1.104', hits: '14,205', country: 'Russia', level: 'Critical' },
      { rank: '#2', ip: '10.0.0.52', hits: '9,842', country: 'China', level: 'Critical' },
      { rank: '#3', ip: '172.16.254.1', hits: '5,102', country: 'Unknown', level: 'High' },
      { rank: '#4', ip: '8.8.8.8', hits: '3,450', country: 'USA', level: 'High' }
    ]
  },
  '30d': {
    detectionAccuracy: 94.7,
    attackVectorDistribution: [
      { name: 'DDoS / Botnet', value: 40, color: '#00dbe7' },
      { name: 'SQL Injection', value: 30, color: '#ffb4ab' },
      { name: 'Malware / Ransomware', value: 20, color: '#ffd58c' },
      { name: 'Phishing attempts', value: 10, color: '#00f2ff' }
    ],
    topMaliciousIps: [
      { rank: '#1', ip: '192.168.1.104', hits: '58,900', country: 'Russia', level: 'Critical' },
      { rank: '#2', ip: '10.0.0.52', hits: '41,200', country: 'China', level: 'Critical' },
      { rank: '#3', ip: '172.16.254.1', hits: '22,400', country: 'Unknown', level: 'High' },
      { rank: '#4', ip: '8.8.8.8', hits: '15,800', country: 'USA', level: 'High' }
    ]
  }
};

const StatisticsPage = () => {
  const { getStatisticsData } = useAlerts();
  const [stats, setStats] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      setStats(null); // Show loading spinner during transition
      const data = await getStatisticsData();
      if (active) {
        const simulated = timeframeData[timeframe] || data;
        setStats(simulated);
      }
    };
    loadStats();
    return () => { active = false; };
  }, [getStatisticsData, timeframe]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="material-symbols-outlined text-[20px] text-accent animate-spin">sync</span>
      </div>
    );
  }

  const doughnutData = {
    labels: stats.attackVectorDistribution.map(item => item.name),
    datasets: [
      {
        data: stats.attackVectorDistribution.map(item => item.value),
        backgroundColor: stats.attackVectorDistribution.map(item => item.color),
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
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#11151c',
        titleColor: '#c9d1d9',
        bodyColor: '#c9d1d9',
        titleFont: { family: 'Inter', size: 10, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 11 },
        borderColor: '#22262f',
        borderWidth: 1,
        padding: 6,
        displayColors: true,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw}%`
        }
      }
    }
  };

  return (
    <div className="space-y-md">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
        <div>
          <h1 className="font-sans text-[16px] font-bold text-on-surface uppercase tracking-wide">
            Telemetry Statistics & Analysis
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant">
            Global threat profiles and performance efficiency metrics.
          </p>
        </div>

        {/* Timeframe selector tabs */}
        <div className="flex bg-surface border border-border rounded p-[2px]">
          {['24h', '7d', '30d'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded font-mono text-[10px] cursor-pointer select-none transition-all ${
                timeframe === t
                  ? 'bg-accent text-background font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-sm">
        {/* Circular Accuracy Gauge (4/12 cols) */}
        <div className="col-span-1 md:col-span-4 bg-surface border border-border rounded p-md flex flex-col items-center justify-center min-h-[220px] card-hover">
          <h2 className="font-sans text-[10px] text-on-surface-variant font-bold self-start uppercase tracking-wider">
            Detection Accuracy
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
                strokeDashoffset={263.8 - (263.8 * stats.detectionAccuracy) / 100} 
                strokeWidth="6"
                strokeLinecap="square"
                className="transition-all duration-500 ease-out"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[22px] text-accent font-bold">
                {stats.detectionAccuracy}
                <span className="text-[12px] font-normal">%</span>
              </span>
              <span className="font-sans text-[8px] text-on-surface-variant tracking-wider uppercase mt-px">True Positive Rate</span>
            </div>
          </div>
        </div>

        {/* Attack Vector Doughnut Chart (8/12 cols) */}
        <div className="col-span-1 md:col-span-8 bg-surface border border-border rounded p-md min-h-[220px] flex flex-col card-hover">
          <h2 className="font-sans text-[10px] text-on-surface-variant font-bold mb-sm uppercase tracking-wider">
            Attack Vector Distribution
          </h2>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-md">
            <div className="w-32 h-32 relative shrink-0">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>

            <div className="space-y-[4px] w-full max-w-xs text-left">
              {stats.attackVectorDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b border-border/40 pb-[2px]">
                  <div className="flex items-center gap-sm">
                    <span className="w-2 h-2 shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="font-sans text-[11px] text-on-surface">{item.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-accent font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Malicious Source IPs (12/12 cols - Fix Bug 3: Align table columns) */}
        <div className="col-span-1 md:col-span-12 bg-surface border border-border rounded overflow-hidden card-hover">
          <div className="px-md py-sm border-b border-border bg-[#161b22]/50">
            <h2 className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
              Top Malicious Source IP Address Ranges
            </h2>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="font-sans text-[9px] text-on-surface-variant border-b border-border bg-[#11151c] uppercase tracking-wider">
                  <th className="p-2 text-left font-bold">Rank</th>
                  <th className="p-2 text-left font-bold">IP Address</th>
                  <th className="p-2 text-right font-bold">Incident Hits</th>
                  <th className="p-2 text-left font-bold">Geographic Source</th>
                  <th className="p-2 text-left font-bold">Threat Risk</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] text-on-surface divide-y divide-border/60">
                {stats.topMaliciousIps.map((ipRow, idx) => {
                  const isCritical = ipRow.level.toUpperCase() === 'CRITICAL';
                  const isHigh = ipRow.level.toUpperCase() === 'HIGH';
                  const levelColor = isCritical ? 'text-[#f85149] border-[#f85149]/30 bg-[#f85149]/10' : isHigh ? 'text-[#d29922] border-[#d29922]/30 bg-[#d29922]/10' : 'text-[#8b949e] border-[#22262f] bg-[#22262f]/30';
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
                          {ipRow.level.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
