import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAlerts } from '../hooks/useAlerts';
import { useToast } from '../components/common/Toast';
import AttackChainGraph from '../components/attackchain/AttackChainGraph';

const AttackTimelinePage = () => {
  const { alertId: paramAlertId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryAlertId = searchParams.get('alertId');
  const navigate = useNavigate();
  const toast = useToast();
  const { getAlerts } = useAlerts();

  const [alertsList, setAlertsList] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // Active selected alert ID
  const selectedAlertId = paramAlertId || queryAlertId || '';

  const [activeChain, setActiveChain] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loadingChain, setLoadingChain] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  // 1. Fetch alerts list for the selector dropdown
  const loadAlertsList = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await getAlerts({ page: 1, size: 50 });
      const list = res?.alerts || [];
      setAlertsList(list);
      
      // If no alert ID is selected yet, pre-select the first alert if available
      if (!selectedAlertId && list.length > 0) {
        navigate(`/attack-timeline/${list[0].id}`, { replace: true });
      }
    } catch (err) {
      toast.error('Failed to load alerts list for selector.');
    } finally {
      setLoadingAlerts(false);
    }
  }, [getAlerts, selectedAlertId, navigate, toast]);

  useEffect(() => {
    loadAlertsList();
  }, [loadAlertsList]);

  // 2. Fetch attack chain for the selected alert with 15-second timeout safeguard
  const fetchChain = useCallback(async (idToFetch, isManual = false) => {
    if (!idToFetch) {
      setActiveChain(null);
      setLoadingChain(false);
      return;
    }

    if (isManual) {
      setIsRefreshing(true);
    } else {
      setLoadingChain(true);
    }
    setError(null);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 15-second timeout safeguard
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const res = await client.get(`/api/attack-chain/${idToFetch}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const chainData = res.data;
      setActiveChain(chainData);
      
      // Automatically select the first node in the chain if available
      if (chainData && chainData.nodes && chainData.nodes.length > 0) {
        setSelectedNode(chainData.nodes[0]);
      } else {
        setSelectedNode(null);
      }

      if (isManual) {
        toast.success(`Attack chain reconstructed for incident #${idToFetch}.`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        setError(`Request timed out (15s) while reconstructing attack chain for #${idToFetch}. Please try again.`);
      } else {
        setError(err.response?.data?.detail || err.message || `Failed to fetch attack chain for #${idToFetch}.`);
        if (isManual) toast.error('Failed to reconstruct graph.');
      }
      setActiveChain(null);
    } finally {
      setLoadingChain(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedAlertId) {
      fetchChain(selectedAlertId, false);
    } else {
      setActiveChain(null);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedAlertId, fetchChain]);

  const handleSelectChange = (e) => {
    const newId = e.target.value;
    if (newId) {
      navigate(`/attack-timeline/${newId}`);
    } else {
      navigate('/attack-timeline');
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto w-full text-left">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="font-sans text-[16px] font-bold text-slate-200 uppercase tracking-wide">
            Attack Chain Reconstruction & Timeline
          </h1>
          <p className="font-sans text-[11px] text-slate-400">
            Multi-stage attack path correlation across users, devices, servers, and IP endpoints.
          </p>
        </div>
        <button
          onClick={() => fetchChain(selectedAlertId, true)}
          disabled={isRefreshing || loadingChain || !selectedAlertId}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/10 text-slate-300 hover:text-accent font-mono text-[10px] transition-all cursor-pointer disabled:opacity-50 select-none backdrop-blur-sm shadow-sm"
        >
          <span className={`material-symbols-outlined text-[14px] ${isRefreshing ? 'animate-spin text-accent' : ''}`}>
            {isRefreshing ? 'sync' : 'refresh'}
          </span>
          <span>{isRefreshing ? 'Reconstructing...' : 'Reconstruct Graph'}</span>
        </button>
      </div>

      {/* Alert Selector Bar */}
      <div className="glass-panel-interactive p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 text-accent">
          <span className="material-symbols-outlined text-[18px]">travel_explore</span>
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-300 shrink-0">
            Target Incident:
          </span>
        </div>
        <select
          value={selectedAlertId}
          onChange={handleSelectChange}
          disabled={loadingAlerts}
          className="input-field flex-1 rounded-lg px-3 py-2 font-mono text-[11px] text-slate-200 bg-slate-900/80 border border-white/10 w-full focus:outline-none focus:border-teal-400"
        >
          {loadingAlerts ? (
            <option value="">Loading incident registry index...</option>
          ) : alertsList.length === 0 ? (
            <option value="">No incident alerts found in database</option>
          ) : (
            <>
              <option value="">-- Choose an Incident to Visualize Attack Chain --</option>
              {alertsList.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} | {a.attack} | {a.severity} | IP: {a.sourceIp} | {a.time || 'Recent'}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 border border-rose-500/40 bg-rose-500/10 text-rose-400 font-mono text-[11px] rounded-lg flex justify-between items-center backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => fetchChain(selectedAlertId, true)} 
            className="px-3 py-1 bg-rose-500 text-white rounded-md font-sans text-[10px] uppercase font-bold hover:bg-rose-600 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* States Handling */}
      {!selectedAlertId && !loadingAlerts ? (
        <div className="p-10 glass-panel text-center flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[36px] text-slate-500">hub</span>
          <h3 className="font-sans text-[13px] font-bold text-slate-200 uppercase tracking-wide">Select an Alert</h3>
          <p className="font-sans text-[11px] text-slate-400 max-w-md">
            Select an alert above from the registry index to reconstruct its multi-stage attack path.
          </p>
        </div>
      ) : loadingChain ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-2.5 glass-panel p-8">
          <span className="material-symbols-outlined text-[36px] text-accent animate-spin">hub</span>
          <span className="font-mono text-[11px] text-slate-300 uppercase tracking-wider">
            Reconstructing Multi-Stage Attack Path for Incident #{selectedAlertId}...
          </span>
          <span className="font-sans text-[9px] text-slate-500">15s timeout safeguard active</span>
        </div>
      ) : activeChain ? (
        <div className="space-y-4">
          {/* Active Campaign Info Header */}
          <div className="glass-panel-interactive p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="font-mono text-[9px] text-accent uppercase font-bold block">ACTIVE COMPROMISE CAMPAIGN</span>
              <h2 className="font-sans text-[14px] font-bold text-slate-100">{activeChain.title}</h2>
            </div>
            <div className="flex gap-2.5 font-mono text-[10px]">
              <div className="bg-slate-950/70 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-slate-400 block uppercase text-[8px]">Root Attacker IP</span>
                <span className="font-bold text-rose-400">{activeChain.root_ip}</span>
              </div>
              <div className="bg-slate-950/70 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-slate-400 block uppercase text-[8px]">Threat Score</span>
                <span className="font-bold text-rose-400">{activeChain.threat_score} / 100</span>
              </div>
            </div>
          </div>

          {/* Interactive Graph & Timeline Component */}
          <AttackChainGraph chain={activeChain} onSelectNode={setSelectedNode} />

          {/* Node Details Inspection Panel */}
          {selectedNode && (
            <div className="glass-panel-interactive border-teal-500/35 p-4 text-left space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] py-1">
                <div>
                  <span className="text-slate-400 block uppercase text-[9px]">Timestamp</span>
                  <span className="font-bold text-slate-200">{new Date(selectedNode.timestamp).toUTCString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px]">Source / Host IP</span>
                  <span className="font-bold text-rose-400">{selectedNode.ip}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px]">Hostname</span>
                  <span className="font-bold text-slate-200">{selectedNode.hostname}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px]">Username</span>
                  <span className="font-bold text-slate-200">{selectedNode.username}</span>
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


