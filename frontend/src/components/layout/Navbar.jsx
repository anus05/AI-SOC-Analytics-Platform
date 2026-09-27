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
    <header className="bg-slate-900/70 backdrop-blur-md border-b border-white/10 flex justify-between items-center w-full px-5 h-13 sticky top-0 z-50 shadow-md">
      {/* Brand Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-accent text-[18px]">shield</span>
        </div>
        <h1 className="font-sans text-[13px] font-bold text-accent tracking-wider uppercase">
          AI SOC PLATFORM
        </h1>
      </div>

      {/* Center Status Badge & Global Refresh */}
      <div className="hidden md:flex items-center gap-2.5">
        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1 rounded-md border border-white/10 backdrop-blur-sm">
          <span className="material-symbols-outlined text-accent text-[12px] filled-icon animate-pulse">verified_user</span>
          <span className="font-sans text-[10px] text-slate-300 uppercase tracking-wider">
            DB Telemetry: <span className="text-accent font-mono font-bold">POSTGRESQL CONNECTED</span>
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh database telemetry"
            className="flex items-center gap-1.5 bg-slate-950/60 hover:bg-slate-800/60 border border-white/10 text-slate-300 hover:text-accent px-2.5 py-1 rounded-md font-mono text-[10px] transition-all cursor-pointer disabled:opacity-50 select-none backdrop-blur-sm"
          >
            <span className={`material-symbols-outlined text-[14px] ${refreshing ? 'animate-spin text-accent' : ''}`}>
              refresh
            </span>
            <span>Refresh (30s)</span>
          </button>
        )}
      </div>

      {/* Operator Details and Dropdown */}
      <div className="flex items-center gap-2.5 relative">
        <div className="hidden md:flex flex-col text-right">
          <span className="font-mono text-[10px] text-slate-200 font-bold leading-none">
            {operator?.name || operator?.username || 'OPERATOR'}
          </span>
          <span className="font-sans text-[8px] text-slate-400 tracking-wider uppercase mt-1">
            {operator?.role || 'SOC ANALYST'}
          </span>
        </div>

        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-8 h-8 rounded-lg border border-white/15 bg-slate-950/60 hover:bg-slate-800/80 hover:border-teal-500/50 cursor-pointer transition-all flex items-center justify-center select-none overflow-hidden backdrop-blur-sm shadow-inner"
        >
          {operator?.picture ? (
            <img src={operator.picture} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-[11px] text-accent font-bold">{getInitials()}</span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-10 bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-lg p-2.5 shadow-2xl w-52 flex flex-col z-50 animate-fade-in gap-2">
            <div className="px-1.5 py-1 border-b border-white/10 flex flex-col">
              <span className="font-mono text-[11px] font-bold text-slate-200 truncate">
                {operator?.name || operator?.username || 'Operator'}
              </span>
              <span className="font-sans text-[9px] text-slate-400 truncate">
                {operator?.email}
              </span>
              {operator?.google_id && (
                <div className="flex items-center gap-1 mt-1 font-mono text-[8px] text-accent bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 w-fit">
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
              className="flex items-center gap-2 px-2.5 py-1.5 text-rose-400 hover:bg-rose-500/15 rounded-md w-full text-left font-sans text-[11px] transition-colors cursor-pointer"
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

