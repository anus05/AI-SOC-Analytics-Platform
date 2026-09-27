import React, { useState } from 'react';

const AlertDetail = ({ alert, onUpdateStatus, onBack }) => {
  const [copied, setCopied] = useState(false);

  if (!alert) {
    return (
      <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <span className="material-symbols-outlined text-[32px] text-slate-500 mb-2">
          security_update_warning
        </span>
        <h3 className="font-sans text-[12px] font-bold text-slate-200 uppercase tracking-wide">Select an incident</h3>
        <p className="font-sans text-[11px] text-slate-400 max-w-xs mt-1">
          Select any alert from the registry index logs to initiate diagnostic auditing.
        </p>
      </div>
    );
  }

  const handleCopyLog = () => {
    navigator.clipboard.writeText(JSON.stringify(alert.rawLog, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityStyles = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL': return { text: 'text-[#f85149]', border: 'border-[#f85149]/30 bg-[#f85149]/10' };
      case 'HIGH': return { text: 'text-[#d29922]', border: 'border-[#d29922]/30 bg-[#d29922]/10' };
      case 'MEDIUM': return { text: 'text-accent', border: 'border-teal-500/30 bg-teal-500/10' };
      case 'LOW':
      default: return { text: 'text-[#8b949e]', border: 'border-[#8b949e]/30 bg-[#8b949e]/10' };
    }
  };

  const sevStyle = getSeverityStyles(alert.severity);

  return (
    <div className="flex flex-col gap-3">
      {/* Mobile-only Back Header */}
      {onBack && (
        <div className="flex items-center gap-2 pb-1 md:hidden">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-400 hover:text-accent transition-colors py-1 px-2.5 rounded-md cursor-pointer bg-slate-900/60 border border-white/10"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider">Alert Logs</span>
          </button>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left Column: Severity & Threat Score cards */}
        <div className="md:col-span-4 flex flex-col gap-3">
          {/* Threat Score Card */}
          <div className="glass-panel-interactive p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
              <span className="font-sans text-[9px] font-bold text-slate-400 uppercase tracking-wider">Threat Score</span>
              <div className={`w-2.5 h-2.5 rounded-full ${alert.threatScore >= 80 ? 'bg-rose-500 animate-ping' : alert.threatScore >= 50 ? 'bg-amber-400' : 'bg-teal-400'}`}></div>
            </div>
            <div className="mt-4 z-10 flex items-baseline gap-1.5">
              <span className={`font-mono text-[30px] font-bold tracking-tight ${alert.threatScore >= 80 ? 'text-rose-400' : alert.threatScore >= 50 ? 'text-amber-400' : 'text-accent'}`}>
                {alert.threatScore}
              </span>
              <span className="font-mono text-[10px] text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Severity Classification */}
          <div className="glass-panel-interactive p-4">
            <span className="font-sans text-[9px] font-bold text-slate-400 uppercase block mb-1">Severity level</span>
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className={`material-symbols-outlined text-[16px] ${sevStyle.text}`}>
                {alert.threatScore >= 80 ? 'warning' : alert.threatScore >= 50 ? 'report' : 'info'}
              </span>
              <span className={`font-mono text-[11px] font-bold uppercase tracking-wider ${sevStyle.text}`}>
                {alert.severity} INCIDENT
              </span>
            </div>

            <div className="pt-2.5 border-t border-white/10 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-sans text-slate-400 font-bold uppercase">Status</span>
                <span className="font-mono font-bold text-accent bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30 uppercase">
                  {alert.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-sans text-slate-400 font-bold uppercase">Detector</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {alert.attack}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-sans text-slate-400 font-bold uppercase">MITRE Tech</span>
                <span className="font-mono text-accent font-bold">
                  {alert.technique}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="glass-panel-interactive border-teal-500/35 p-4">
            <div className="flex items-center gap-1.5 text-accent mb-2">
              <span className="material-symbols-outlined text-[15px]">psychology</span>
              <span className="font-sans text-[9px] font-bold uppercase tracking-wider">SOAR Recommendation</span>
            </div>
            <p className="font-sans text-[11px] text-slate-200 leading-snug">
              {alert.recommendation}
            </p>
          </div>
        </div>

        {/* Right Column: Connection details and log console */}
        <div className="md:col-span-8 flex flex-col gap-3">
          {/* Metadata details */}
          <div className="glass-panel-interactive p-4">
            <h2 className="font-sans text-[10px] font-bold text-slate-300 uppercase mb-3 tracking-wide">Connection Metadata</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex flex-col">
                <span className="font-sans text-[9px] font-bold text-slate-400 uppercase tracking-wider">Alert ID</span>
                <span className="font-mono text-[11px] text-slate-200 font-semibold">#{alert.id}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[9px] font-bold text-slate-400 uppercase tracking-wider">User Account</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-slate-400">person</span>
                  <span className="font-mono text-[11px] text-slate-200">{alert.username}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[9px] font-bold text-slate-400 uppercase tracking-wider">Source IP</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-rose-400">public</span>
                  <span className="font-mono text-[11px] text-rose-400 font-bold">{alert.sourceIp}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[9px] font-bold text-slate-400 uppercase tracking-wider">Destination Host</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-accent">dns</span>
                  <span className="font-mono text-[11px] text-slate-200">{alert.destination}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw security logs */}
          <div className="glass-panel overflow-hidden flex flex-col">
            <div className="bg-slate-950/60 px-4 py-2 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="material-symbols-outlined text-[13px]">terminal</span>
                <span className="font-sans text-[9px] font-bold uppercase tracking-wider">Raw Security Log</span>
              </div>
              <button 
                onClick={handleCopyLog} 
                className="text-accent hover:text-white transition-colors cursor-pointer flex items-center gap-1 select-none"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span className="font-mono text-[9px] font-bold">{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950/80 overflow-x-auto max-h-48 overflow-y-auto">
              <pre className="font-mono text-[10px] text-slate-300 leading-normal text-left select-text">
                <code>{JSON.stringify(alert.rawLog, null, 2)}</code>
              </pre>
            </div>
          </div>

          {/* Action response panel */}
          <div className="flex flex-wrap gap-2 justify-end border-t border-white/10 pt-3 mt-1">
            <button
              onClick={() => onUpdateStatus(alert.id, 'Dismissed')}
              className="font-sans text-[11px] font-bold text-slate-400 hover:text-slate-100 py-1.5 px-3 rounded.md transition-colors cursor-pointer border border-transparent flex items-center justify-center gap-1 select-none"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              DISMISS
            </button>
            <button
              onClick={() => onUpdateStatus(alert.id, 'FalsePositive')}
              className="font-sans text-[11px] font-bold border border-white/10 text-slate-300 hover:border-white/20 hover:text-white py-1.5 px-3 rounded.md transition-colors cursor-pointer flex items-center justify-center gap-1 select-none bg-slate-900/60 backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-[14px]">rule</span>
              FALSE POSITIVE
            </button>
            <button
              onClick={() => onUpdateStatus(alert.id, 'Escalated')}
              className="font-sans text-[11px] font-bold bg-teal-500/15 border border-teal-500/40 text-accent hover:bg-teal-500/25 hover:text-teal-200 py-1.5 px-4 rounded.md transition-all cursor-pointer flex items-center justify-center gap-1 select-none shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">upload</span>
              ESCALATE TIER 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetail;

