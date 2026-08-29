import React from 'react';

const SeverityBadge = ({ severity }) => {
  const sev = (severity || '').toUpperCase();

  switch (sev) {
    case 'CRITICAL':
      return (
        <div className="border border-[#f85149]/30 bg-[#f85149]/10 text-[#f85149] px-1.5 py-[1px] rounded inline-flex items-center gap-[3px]">
          <span className="material-symbols-outlined text-[10px] text-[#f85149]">error</span>
          <span className="font-mono text-[9px] font-bold tracking-wider">CRIT</span>
        </div>
      );
    case 'HIGH':
      return (
        <div className="border border-[#d29922]/30 bg-[#d29922]/10 text-[#d29922] px-1.5 py-[1px] rounded inline-flex items-center">
          <span className="font-mono text-[9px] font-bold tracking-wider">HIGH</span>
        </div>
      );
    case 'MEDIUM':
      return (
        <div className="border border-[#8b949e]/30 bg-[#8b949e]/10 text-[#8b949e] px-1.5 py-[1px] rounded inline-flex items-center">
          <span className="font-mono text-[9px] font-bold tracking-wider">MED</span>
        </div>
      );
    case 'LOW':
    default:
      return (
        <div className="border border-[#6e7681]/30 bg-[#6e7681]/10 text-[#6e7681] px-1.5 py-[1px] rounded inline-flex items-center">
          <span className="font-mono text-[9px] font-bold tracking-wider">LOW</span>
        </div>
      );
  }
};

export default SeverityBadge;
