import React, { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import { useToast } from '../components/common/Toast';
import AttackChainGraph from '../components/attackchain/AttackChainGraph';

const AttackTimelinePage = () => {
  const toast = useToast();
  const [chains, setChains] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/api/attack-chain');
      setChains(res.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch attack chains.');
      toast.error('Failed to load attack chain telemetry.');
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchChains();
  }, [fetchChains]);

  const activeChain = chains[0] || null;

  return (
    <div className="space-y-md max-w-[1600px] mx-auto w-full text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
        <div>
          <h1 className="font-sans text-[16px] font-bold text-on-surface uppercase tracking-wide">
            Attack Chain Reconstruction & Timeline
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant">
            Multi-stage attack path correlation across users, devices, servers, and IP endpoints.
          </p>
        </div>
        <button
          onClick={fetchChains}
          className="flex items-center gap-xs px-3 py-1.5 rounded bg-surface border border-border text-on-surface hover:text-accent font-mono text-[10px] transition-all cursor-pointer select-none"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          <span>Reconstruct Graph</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 border border-[#f85149]/40 bg-[#f85149]/10 text-[#f85149] font-mono text-[11px] rounded flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchChains} className="px-2 py-0.5 bg-[#f85149] text-white rounded font-sans text-[10px] uppercase font-bold">
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-sm">
          <span className="material-symbols-outlined text-[32px] text-accent animate-spin">hub</span>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">
            Reconstructing Multi-Stage Attack Path...
          </span>
        </div>
      ) : activeChain ? (
        <div className="space-y-md">
          {/* Active Campaign Info Header */}
          <div className="bg-surface border border-border rounded p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
            <div>
              <span className="font-mono text-[9px] text-accent uppercase font-bold block">ACTIVE COMPROMISE CAMPAIGN</span>
              <h2 className="font-sans text-[14px] font-bold text-on-surface">{activeChain.title}</h2>
            </div>
            <div className="flex gap-sm font-mono text-[10px]">
              <div className="bg-[#0d1117] px-2.5 py-1 rounded border border-border">
                <span className="text-on-surface-variant block uppercase text-[8px]">Root Attacker IP</span>
                <span className="font-bold text-[#f85149]">{activeChain.root_ip}</span>
              </div>
              <div className="bg-[#0d1117] px-2.5 py-1 rounded border border-border">
                <span className="text-on-surface-variant block uppercase text-[8px]">Threat Score</span>
                <span className="font-bold text-[#f85149]">{activeChain.threat_score} / 100</span>
              </div>
            </div>
          </div>

          {/* Interactive Graph & Timeline Component */}
          <AttackChainGraph chain={activeChain} onSelectNode={setSelectedNode} />

          {/* Node Details Inspection Panel */}
          {selectedNode && (
            <div className="bg-surface border border-accent/40 rounded p-4 text-left space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-[18px]">info</span>
                  <h3 className="font-sans text-[12px] font-bold text-accent uppercase">
                    Stage Detail: {selectedNode.stage}
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-accent font-bold">
                  {selectedNode.mitre_id}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm font-mono text-[11px] py-1">
                <div>
                  <span className="text-on-surface-variant block uppercase text-[9px]">Timestamp</span>
                  <span className="font-bold text-on-surface">{new Date(selectedNode.timestamp).toUTCString()}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block uppercase text-[9px]">Source / Host IP</span>
                  <span className="font-bold text-[#f85149]">{selectedNode.ip}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block uppercase text-[9px]">Hostname</span>
                  <span className="font-bold text-on-surface">{selectedNode.hostname}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block uppercase text-[9px]">Username</span>
                  <span className="font-bold text-on-surface">{selectedNode.username}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default AttackTimelinePage;
