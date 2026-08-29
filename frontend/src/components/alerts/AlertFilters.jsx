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
    <div className="flex flex-col gap-sm sticky top-12 z-40 bg-background/95 pb-sm pt-sm">
      {/* Search Input */}
      <div className="relative w-full group">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full bg-[#11151c] border border-border rounded py-1 pl-8 pr-3 font-mono text-[11px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          placeholder="Filter logs by IP, Target, user or ID..."
          type="text"
        />
      </div>

      {/* Filter Chips Scroll Container */}
      <div className="flex overflow-x-auto gap-[4px] no-scrollbar py-px snap-x w-full">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => onFilterChange(chip.key)}
              className={`
                snap-start shrink-0 px-2.5 py-[3px] rounded border font-mono text-[9px] uppercase font-bold tracking-wider transition-all select-none cursor-pointer
                ${isActive 
                  ? 'border-accent bg-[#1f242c] text-accent' 
                  : 'border-border text-on-surface-variant bg-[#11151c] hover:bg-[#161b22] hover:text-on-surface'
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
