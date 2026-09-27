import React, { useState, useEffect } from 'react';

const AlertFilters = ({ searchTerm, onSearchChange, activeFilter, onFilterChange }) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  // Keep local search in sync if search is cleared from the parent
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const filterChips = [
    { key: 'ALL', label: 'All Alerts' },
    { key: 'CRITICAL', label: 'Critical' },
    { key: 'HIGH', label: 'High' },
    { key: 'MEDIUM', label: 'Medium' },
    { key: 'LOW', label: 'Low' },
    { key: 'BRUTE FORCE', label: 'Brute Force' },
    { key: 'MALWARE', label: 'Malware' }
  ];

  return (
    <div className="flex flex-col gap-2 sticky top-13 z-40 bg-slate-950/40 backdrop-blur-md pb-2 pt-2">
      {/* Search Input */}
      <div className="relative w-full group">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
          search
        </span>
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full bg-slate-900/70 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 font-mono text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all backdrop-blur-md"
          placeholder="Filter logs by IP, Target, user or ID..."
          type="text"
        />
      </div>

      {/* Filter Chips Scroll Container */}
      <div className="flex overflow-x-auto gap-1.5 no-scrollbar py-0.5 snap-x w-full">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => onFilterChange(chip.key)}
              className={`
                snap-start shrink-0 px-3 py-1 rounded-md border font-mono text-[9px] uppercase font-bold tracking-wider transition-all select-none cursor-pointer backdrop-blur-sm
                ${isActive 
                  ? 'border-teal-500/40 bg-teal-500/15 text-accent shadow-xs' 
                  : 'border-white/10 text-slate-400 bg-slate-900/50 hover:bg-slate-800/60 hover:text-slate-200'
                }
              `}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlertFilters;

