import React, { useState } from 'react';

const AttackChainGraph = ({ chain, onSelectNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!chain || !chain.nodes || chain.nodes.length === 0) {
    return (
      <div className="p-8 border border-dashed border-white/10 rounded-lg glass-panel text-center font-mono text-[11px] text-slate-400">
        No attack chain graph data available for this incident.
      </div>
    );
  }

  const nodes = chain.nodes || [];
  const isSingleStage = nodes.length === 1;

  const handleNodeClick = (node) => {
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node);
  };

  const getSeverityBadge = (sev) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL': return 'bg-rose-500/20 border border-rose-500/40 text-rose-400';
      case 'HIGH': return 'bg-amber-500/20 border border-amber-500/40 text-amber-400';
      case 'MEDIUM': return 'bg-teal-500/20 border border-teal-500/40 text-teal-300';
      default: return 'bg-slate-500/20 border border-slate-500/40 text-slate-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'User': return 'person';
      case 'Server': return 'dns';
      case 'Device': return 'devices';
      case 'IPs':
      case 'IP': return 'public';
      default: return 'warning';
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Single Stage Informative Banner */}
      {isSingleStage && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-300 font-mono text-[11px] backdrop-blur-md">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>This alert has a single detected stage ({nodes[0].stage} / {nodes[0].mitre_id}) — no multi-stage propagation detected across other endpoints.</span>
        </div>
      )}

      {/* Horizontal Interactive Timeline / Sequence */}
      <div className="glass-panel-interactive p-4 overflow-x-auto relative">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-sans text-[11px] font-bold text-accent uppercase tracking-wider">
            Attack Path Timeline & Progression
          </h3>
          <div className="flex items-center gap-1 font-mono text-[9px]">
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
              className="px-2 py-0.5 rounded bg-slate-900/60 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom out"
            >
              -
            </button>
            <span className="text-slate-400 px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
              className="px-2 py-0.5 rounded bg-slate-900/60 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-0.5 rounded bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white cursor-pointer ml-1"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>
        </div>

        <div 
          className="flex items-center gap-2 min-w-[700px] py-2 transition-transform duration-200 origin-top-left"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div
                  onClick={() => handleNodeClick(node)}
                  className={`flex-1 min-w-[220px] p-3.5 rounded-lg border transition-all cursor-pointer select-none backdrop-blur-md ${
                    isSelected 
                      ? 'border-teal-400 bg-teal-500/15 shadow-lg ring-1 ring-teal-400' 
                      : 'border-white/10 bg-slate-900/60 hover:bg-slate-800/60 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[8px] font-bold ${getSeverityBadge(node.severity)}`}>
                      {node.severity}
                    </span>
                    <span className="font-mono text-[9px] text-accent font-bold">
                      {node.mitre_id}
                    </span>
                  </div>
                  <div className="font-sans text-[11px] font-bold text-slate-100 mb-1.5">
                    {node.stage}
                  </div>
                  <div className="font-mono text-[9px] text-slate-400 space-y-0.5">
                    <div>IP: <span className="text-slate-200">{node.ip}</span></div>
                    <div>Host: <span className="text-slate-200">{node.hostname}</span></div>
                    <div>User: <span className="text-slate-200">{node.username}</span></div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-white/10 font-mono text-[8px] text-slate-500 text-right">
                    {new Date(node.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Directional Teal Arrow Connector */}
                {index < nodes.length - 1 && (
                  <div className="flex items-center justify-center px-1 text-accent animate-pulse shrink-0">
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* SVG Network Progression Graph Canvas */}
      <div className="glass-panel-interactive p-4 relative overflow-hidden">
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
          <h3 className="font-sans text-[11px] font-bold text-slate-200 uppercase tracking-wider">
            Network & Asset Node Progression Graph
          </h3>
          <span className="font-mono text-[9px] text-accent font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            {nodes.length} STAGE NODE(S)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 py-2">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className={`p-3.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 backdrop-blur-md ${
                  isSelected 
                    ? 'border-teal-400 bg-teal-500/15 ring-2 ring-teal-400/50' 
                    : 'border-white/10 bg-slate-900/60 hover:border-teal-500/40 hover:bg-slate-800/60'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-950/80 border border-teal-500/30 flex items-center justify-center text-accent shadow-inner">
                  <span className="material-symbols-outlined text-[18px]">
                    {getTypeIcon(node.type)}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-100 mt-1 truncate w-full">
                  {node.stage}
                </span>
                <span className="font-sans text-[8px] text-slate-400 uppercase font-semibold">
                  {node.mitre_id} ({node.severity})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttackChainGraph;

