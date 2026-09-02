import React, { useState, useEffect } from 'react';
import client from '../../api/client';

const AICopilotPanel = ({ alertId, onClose }) => {
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedActions, setCheckedActions] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchInvestigation = async () => {
      if (!alertId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await client.post(`/api/copilot/investigate/${alertId}`);
        if (isMounted) {
          setInvestigation(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to generate AI investigation.');
          setLoading(false);
        }
      }
    };
    fetchInvestigation();
    return () => { isMounted = false; };
  }, [alertId]);

  const toggleAction = (idx) => {
    setCheckedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getThreatColor = (level) => {
    switch ((level || '').toUpperCase()) {
      case 'CRITICAL': return 'text-[#f85149] bg-[#f85149]/10 border-[#f85149]/30';
      case 'HIGH': return 'text-[#d29922] bg-[#d29922]/10 border-[#d29922]/30';
      case 'MEDIUM': return 'text-[#58a6ff] bg-[#58a6ff]/10 border-[#58a6ff]/30';
      default: return 'text-[#8b949e] bg-[#8b949e]/10 border-[#8b949e]/30';
    }
  };

  return (
    <div className="bg-[#0d1117] border border-accent/40 rounded shadow-xl p-4 w-full flex flex-col gap-sm animate-fade-in relative text-left">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-[20px] animate-pulse">psychology</span>
          <h3 className="font-sans text-[13px] font-bold text-accent uppercase tracking-wider">
            AI Investigation Copilot
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 gap-sm">
          <span className="material-symbols-outlined text-[28px] text-accent animate-spin">sync</span>
          <span className="font-mono text-[11px] text-accent font-bold tracking-wider uppercase animate-pulse">
            Generating Investigation...
          </span>
          <span className="font-sans text-[10px] text-on-surface-variant">
            Analyzing telemetry features, MITRE mapping, and attack intent...
          </span>
        </div>
      ) : error ? (
        <div className="p-3 bg-[#f85149]/10 border border-[#f85149]/30 rounded text-[#f85149] font-mono text-[11px]">
          {error}
        </div>
      ) : investigation ? (
        <div className="space-y-sm text-left">
          {/* Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-xs bg-surface p-2.5 rounded border border-border/60 font-mono text-[10px]">
            <div>
              <span className="text-on-surface-variant block uppercase text-[8px]">Attack</span>
              <span className="font-bold text-on-surface">{investigation.attack}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block uppercase text-[8px]">MITRE</span>
              <span className="font-bold text-accent">{investigation.mitre_technique}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block uppercase text-[8px]">Confidence</span>
              <span className="font-bold text-[#3fb950]">{investigation.confidence_score}%</span>
            </div>
            <div>
              <span className="text-on-surface-variant block uppercase text-[8px]">Threat Level</span>
              <span className={`font-bold px-1.5 py-px rounded border ${getThreatColor(investigation.threat_level)}`}>
                {investigation.threat_level}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div>
            <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
              Summary
            </span>
            <p className="font-sans text-[11px] text-on-surface leading-snug bg-surface p-2 rounded border border-border/40">
              {investigation.summary}
            </p>
          </div>

          {/* What & Why Happened */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <div className="bg-surface p-2.5 rounded border border-border/40">
              <span className="font-sans text-[10px] font-bold text-accent uppercase tracking-wider block mb-1">
                What Happened
              </span>
              <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">
                {investigation.what_happened}
              </p>
            </div>
            <div className="bg-surface p-2.5 rounded border border-border/40">
              <span className="font-sans text-[10px] font-bold text-[#d29922] uppercase tracking-wider block mb-1">
                Why It Happened
              </span>
              <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">
                {investigation.why_happened}
              </p>
            </div>
          </div>

          {/* Possible Impact */}
          <div>
            <span className="font-sans text-[10px] font-bold text-[#f85149] uppercase tracking-wider block mb-1">
              Possible Impact & Attacker Goal
            </span>
            <div className="flex flex-wrap gap-xs">
              {(investigation.possible_impact || []).map((imp, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] font-mono text-[9px] font-bold">
                  • {imp}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Actions Checkboxes */}
          <div>
            <span className="font-sans text-[10px] font-bold text-[#3fb950] uppercase tracking-wider block mb-1">
              Recommended Actions
            </span>
            <div className="space-y-1">
              {(investigation.recommended_actions || []).map((act, i) => (
                <div
                  key={i}
                  onClick={() => toggleAction(i)}
                  className={`p-2 rounded border transition-all cursor-pointer flex items-center gap-sm font-sans text-[11px] select-none ${
                    checkedActions[i]
                      ? 'bg-[#238636]/20 border-[#238636] text-[#3fb950] line-through'
                      : 'bg-surface border-border hover:border-accent text-on-surface'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[14px] ${checkedActions[i] ? 'text-[#3fb950]' : 'text-on-surface-variant'}`}>
                    {checkedActions[i] ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst Summary */}
          <div className="bg-[#161b22] p-3 rounded border border-accent/30 text-left">
            <span className="font-sans text-[10px] font-bold text-accent uppercase tracking-wider block mb-1">
              Analyst Summary
            </span>
            <p className="font-sans text-[11px] text-on-surface leading-relaxed italic">
              "{investigation.analyst_summary}"
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AICopilotPanel;
