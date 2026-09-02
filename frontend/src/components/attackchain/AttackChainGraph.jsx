import React, { useState } from 'react';

const AttackChainGraph = ({ chain, onSelectNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  if (!chain || !chain.nodes || chain.nodes.length === 0) {
    return (
      <div className="p-8 border border-dashed border-border rounded bg-surface text-center font-mono text-[11px] text-on-surface-variant">
        No attack chain graph data available.
      </div>
    );
  }

  const nodes = chain.nodes || [];

  const handleNodeClick = (node) => {
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node);
  };

  const getSeverityBadge = (sev) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL': return 'bg-[#f85149] text-white';
      case 'HIGH': return 'bg-[#d29922] text-black';
      case 'MEDIUM': return 'bg-[#58a6ff] text-black';
      default: return 'bg-[#8b949e] text-black';
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
    <div className="flex flex-col gap-md text-left">
      {/* Horizontal Interactive Timeline / Sequence */}
      <div className="bg-surface border border-border rounded p-4 overflow-x-auto">
        <h3 className="font-sans text-[11px] font-bold text-accent uppercase tracking-wider mb-3">
          Attack Path Timeline & Sequence
        </h3>
        <div className="flex items-center gap-xs min-w-[900px] py-2">
          {nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div
                  onClick={() => handleNodeClick(node)}
                  className={`flex-1 p-3 rounded border transition-all cursor-pointer select-none card-hover ${
                    isSelected 
                      ? 'border-accent bg-[#1f242c] ring-1 ring-accent' 
                      : 'border-border bg-[#11151c] hover:border-accent/60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`px-1.5 py-px rounded font-mono text-[8px] font-bold ${getSeverityBadge(node.severity)}`}>
                      {node.severity}
                    </span>
                    <span className="font-mono text-[9px] text-accent font-bold">
                      {node.mitre_id}
                    </span>
                  </div>
                  <div className="font-sans text-[11px] font-bold text-on-surface mb-1">
                    {node.stage}
                  </div>
                  <div className="font-mono text-[9px] text-on-surface-variant space-y-0.5">
                    <div>IP: <span className="text-on-surface">{node.ip}</span></div>
                    <div>Host: <span className="text-on-surface">{node.hostname}</span></div>
                    <div>User: <span className="text-on-surface">{node.username}</span></div>
                  </div>
                  <div className="mt-2 pt-1 border-t border-border/40 font-mono text-[8px] text-on-surface-variant/60 text-right">
                    {new Date(node.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Animated Arrow Connector */}
                {index < nodes.length - 1 && (
                  <div className="flex items-center justify-center px-1 text-accent animate-pulse">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* SVG Attack Graph Visualization */}
      <div className="bg-[#0d1117] border border-border rounded p-4 relative overflow-hidden">
        <div className="flex justify-between items-center mb-3 border-b border-border/40 pb-2">
          <h3 className="font-sans text-[11px] font-bold text-on-surface uppercase tracking-wider">
            Network & Asset Node Progression Graph
          </h3>
          <span className="font-mono text-[9px] text-accent font-bold">
            ANIMATED GRAPH FLOW
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-sm py-4">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isSelected 
                    ? 'border-accent bg-[#1f242c] ring-2 ring-accent' 
                    : 'border-border bg-surface hover:border-accent'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#11151c] border border-accent/40 flex items-center justify-center text-accent">
                  <span className="material-symbols-outlined text-[18px]">
                    {getTypeIcon(node.type)}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-on-surface mt-1 truncate w-full">
                  {node.stage}
                </span>
                <span className="font-sans text-[8px] text-on-surface-variant uppercase">
                  {node.type}
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
