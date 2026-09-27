import React from 'react';

const SeverityBadge = ({ severity }) => {
  const sev = (severity || '').toUpperCase();

  switch (sev) {
    case 'CRITICAL':
      return (
        <div className="border border-[#f85149]/40 bg-[#f85149]/15 text-[#f85149] px-2 py-[2px] rounded-md inline-flex items-center gap-[3px] backdrop-blur-sm shadow-xs">
          <span className="material-symbols-outlined text-[10px] text-[#f85149]">error</span>
          <span className="font-mono text-[9px] font-bold tracking-wider">CRIT</span>
        </div>
      );
    case 'HIGH':
      return (
        <div className="border border-[#d29922]/40 bg-[#d29922]/15 text-[#d29922] px-2 py-[2px] rounded-md inline-flex items-center backdrop-blur-sm shadow-xs">
          <span className="font-mono text-[9px] font-bold tracking-wider">HIGH</span>
        </div>
      );
    case 'MEDIUM':
      return (
        <div className="border border-[#8b949e]/40 bg-[#8b949e]/15 text-[#8b949e] px-2 py-[2px] rounded-md inline-flex items-center backdrop-blur-sm shadow-xs">
          <span className="font-mono text-[9px] font-bold tracking-wider">MED</span>
        </div>
      );
    case 'LOW':
    default:
      return (
        <div className="border border-[#6e7681]/40 bg-[#6e7681]/15 text-[#6e7681] px-2 py-[2px] rounded-md inline-flex items-center backdrop-blur-sm shadow-xs">
          <span className="font-mono text-[9px] font-bold tracking-wider">LOW</span>
        </div>
      );
  }
};

export default SeverityBadge;

