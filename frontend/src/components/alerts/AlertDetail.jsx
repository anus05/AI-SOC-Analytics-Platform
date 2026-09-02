import React, { useState } from 'react';

const AlertDetail = ({ alert, onUpdateStatus, onBack }) => {
  const [copied, setCopied] = useState(false);

  if (!alert) {
    return (
      <div className="bg-[#11151c] border border-border rounded p-4 flex flex-col items-center justify-center min-h-[300px] text-center">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 mb-2">
          security_update_warning
        </span>
        <h3 className="font-sans text-[12px] font-bold text-on-surface uppercase tracking-wide">Select an incident</h3>
        <p className="font-sans text-[11px] text-on-surface-variant max-w-xs mt-1">
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
      case 'MEDIUM': return { text: 'text-[#58a6ff]', border: 'border-[#58a6ff]/30 bg-[#58a6ff]/10' };
      case 'LOW':
      default: return { text: 'text-[#8b949e]', border: 'border-[#8b949e]/30 bg-[#8b949e]/10' };
    }
  };

  const sevStyle = getSeverityStyles(alert.severity);

  return (
    <div className="flex flex-col gap-sm">
      {/* Mobile-only Back Header */}
      {onBack && (
        <div className="flex items-center gap-xs pb-xs md:hidden">
          <button 
            onClick={onBack}
            className="flex items-center gap-xs text-on-surface-variant hover:text-accent transition-colors py-1 px-2 rounded cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider">Alert Logs</span>
          </button>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-sm">
        {/* Left Column: Severity & Threat Score cards */}
        <div className="md:col-span-4 flex flex-col gap-sm">
          {/* Threat Score Card */}
          <div className="bg-surface border border-border rounded p-3 flex flex-col justify-between relative overflow-hidden card-hover">
            <div className="flex justify-between items-start z-10">
              <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Threat Score</span>
              <div className={`w-2.5 h-2.5 rounded-full ${alert.threatScore >= 80 ? 'bg-[#f85149] animate-ping' : alert.threatScore >= 50 ? 'bg-[#d29922]' : 'bg-accent'}`}></div>
            </div>
            <div className="mt-4 z-10 flex items-baseline gap-xs">
              <span className={`font-mono text-[28px] font-bold tracking-tight ${alert.threatScore >= 80 ? 'text-[#f85149]' : alert.threatScore >= 50 ? 'text-[#d29922]' : 'text-accent'}`}>
                {alert.threatScore}
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant">/ 100</span>
            </div>
          </div>

          {/* Severity Classification */}
          <div className="bg-surface border border-border rounded p-3 card-hover">
            <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase block mb-1">Severity level</span>
            <div className="flex items-center gap-xs mb-2">
              <span className={`material-symbols-outlined text-[16px] ${sevStyle.text}`}>
                {alert.threatScore >= 80 ? 'warning' : alert.threatScore >= 50 ? 'report' : 'info'}
              </span>
              <span className={`font-mono text-[11px] font-bold uppercase tracking-wider ${sevStyle.text}`}>
                {alert.severity} INCIDENT
              </span>
            </div>

            <div className="pt-2 border-t border-border/40 space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-sans text-on-surface-variant font-bold uppercase">Status</span>
                <span className="font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/30 uppercase">
                  {alert.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-sans text-on-surface-variant font-bold uppercase">Detector</span>
                <span className="font-mono text-on-surface font-semibold">
                  {alert.attack}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-sans text-on-surface-variant font-bold uppercase">MITRE Tech</span>
                <span className="font-mono text-accent font-bold">
                  {alert.technique}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="bg-surface border border border-accent/40 rounded p-3 card-hover">
            <div className="flex items-center gap-xs text-accent mb-1.5">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              <span className="font-sans text-[9px] font-bold uppercase tracking-wider">SOAR Recommendation</span>
            </div>
            <p className="font-sans text-[11px] text-on-surface leading-snug">
              {alert.recommendation}
            </p>
          </div>
        </div>

        {/* Right Column: Connection details and log console */}
        <div className="md:col-span-8 flex flex-col gap-sm">
          {/* Metadata details */}
          <div className="bg-surface border border-border rounded p-3 card-hover">
            <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase mb-2 tracking-wide">Connection Metadata</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex flex-col">
                <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Alert ID</span>
                <span className="font-mono text-[11px] text-on-surface font-semibold">#{alert.id}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">User Account</span>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[12px] text-on-surface-variant">person</span>
                  <span className="font-mono text-[11px] text-on-surface">{alert.username}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Source IP</span>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[12px] text-[#f85149]">public</span>
                  <span className="font-mono text-[11px] text-[#f85149] font-bold">{alert.sourceIp}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Destination Host</span>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[12px] text-accent">dns</span>
                  <span className="font-mono text-[11px] text-on-surface">{alert.destination}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw security logs */}
          <div className="bg-surface border border-border rounded overflow-hidden flex flex-col card-hover">
            <div className="bg-[#161b22]/50 px-3 py-1.5 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[12px]">terminal</span>
                <span className="font-sans text-[9px] font-bold uppercase tracking-wider">Raw Security Log</span>
              </div>
              <button 
                onClick={handleCopyLog} 
                className="text-accent hover:text-white transition-colors cursor-pointer flex items-center gap-xs select-none"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span className="font-mono text-[9px] font-bold">{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <div className="p-3 bg-[#0d1117] overflow-x-auto max-h-48 overflow-y-auto">
              <pre className="font-mono text-[10px] text-on-surface-variant leading-normal text-left select-text">
                <code>{JSON.stringify(alert.rawLog, null, 2)}</code>
              </pre>
            </div>
          </div>

          {/* Action response panel */}
          <div className="flex flex-wrap gap-xs justify-end border-t border-border pt-3 mt-1">
            <button
              onClick={() => onUpdateStatus(alert.id, 'Dismissed')}
              className="font-sans text-[11px] font-bold text-on-surface-variant hover:text-accent py-1 px-3 rounded transition-colors cursor-pointer border border-transparent flex items-center justify-center gap-xs select-none"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              DISMISS
            </button>
            <button
              onClick={() => onUpdateStatus(alert.id, 'FalsePositive')}
              className="font-sans text-[11px] font-bold border border-border text-on-surface-variant hover:border-[#8b949e] hover:text-on-surface py-1 px-3 rounded transition-colors cursor-pointer flex items-center justify-center gap-xs select-none bg-background"
            >
              <span className="material-symbols-outlined text-[14px]">rule</span>
              FALSE POSITIVE
            </button>
            <button
              onClick={() => onUpdateStatus(alert.id, 'Escalated')}
              className="font-sans text-[11px] font-bold bg-[#1f242c] border border-accent text-accent hover:bg-[#30363d] hover:text-white py-1 px-4 rounded transition-all cursor-pointer flex items-center justify-center gap-xs select-none"
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
