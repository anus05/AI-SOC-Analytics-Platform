import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = ({ systemStatus = 'Secure', onRefresh, refreshing }) => {
  const { operator, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = () => {
    if (!operator) return 'OP';
    if (operator.name) return operator.name.slice(0, 2).toUpperCase();
    if (operator.username) return operator.username.slice(0, 2).toUpperCase();
    return operator.email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-surface border-b border-border flex justify-between items-center w-full px-4 h-12 sticky top-0 z-50">
      {/* Brand Title */}
      <div className="flex items-center gap-md">
        <span className="material-symbols-outlined text-accent text-[20px]">shield</span>
        <h1 className="font-sans text-[13px] font-bold text-accent tracking-wider uppercase">
          AI SOC PLATFORM
        </h1>
      </div>

      {/* Center Status Badge & Global Refresh */}
      <div className="hidden md:flex items-center gap-sm">
        <div className="flex items-center gap-sm bg-[#0d1117] px-2.5 py-1 rounded border border-border">
          <span className="material-symbols-outlined text-accent text-[12px] filled-icon animate-pulse">verified_user</span>
          <span className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider">
            DB Telemetry: <span className="text-[#58a6ff] font-mono font-bold">POSTGRESQL CONNECTED</span>
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh database telemetry"
            className="flex items-center gap-1 bg-[#0d1117] hover:bg-[#161b22] border border-border text-on-surface-variant hover:text-accent px-2 py-1 rounded font-mono text-[10px] transition-all cursor-pointer disabled:opacity-50 select-none"
          >
            <span className={`material-symbols-outlined text-[14px] ${refreshing ? 'animate-spin text-accent' : ''}`}>
              refresh
            </span>
            <span>Refresh (30s)</span>
          </button>
        )}
      </div>

      {/* Operator Details and Dropdown */}
      <div className="flex items-center gap-sm relative">
        <div className="hidden md:flex flex-col text-right">
          <span className="font-mono text-[10px] text-on-surface font-bold leading-none">
            {operator?.name || operator?.username || 'OPERATOR'}
          </span>
          <span className="font-sans text-[8px] text-on-surface-variant tracking-wider uppercase mt-1">
            {operator?.role || 'SOC ANALYST'}
          </span>
        </div>

        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-7 h-7 rounded border border-border bg-[#0d1117] hover:bg-[#161b22] hover:border-[#8b949e] cursor-pointer transition-all flex items-center justify-center select-none overflow-hidden"
        >
          {operator?.picture ? (
            <img src={operator.picture} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-[10px] text-accent font-bold">{getInitials()}</span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-9 bg-surface border border-border rounded p-2 shadow-xl w-48 flex flex-col z-50 animate-fade-in gap-1.5">
            <div className="px-1 py-1 border-b border-border/40 flex flex-col">
              <span className="font-mono text-[11px] font-bold text-on-surface truncate">
                {operator?.name || operator?.username || 'Operator'}
              </span>
              <span className="font-sans text-[9px] text-on-surface-variant truncate">
                {operator?.email}
              </span>
              {operator?.google_id && (
                <div className="flex items-center gap-1 mt-1 font-mono text-[8px] text-accent bg-accent/10 px-1.5 py-0.5 rounded w-fit">
                  <span className="material-symbols-outlined text-[10px]">verified</span>
                  <span>Google SSO</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="flex items-center gap-xs px-2 py-1.5 text-[#f85149] hover:bg-[#f85149]/10 rounded w-full text-left font-sans text-[11px] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
