import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = ({ systemStatus = 'Secure' }) => {
  const { operator, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = () => {
    if (!operator) return 'OP';
    if (operator.name) return operator.name.slice(0, 2).toUpperCase();
    return operator.email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-surface border-b border-border flex justify-between items-center w-full px-4 h-12 sticky top-0 z-50">
      {/* Brand Title */}
      <div className="flex items-center gap-md">
        <span className="material-symbols-outlined text-accent text-[20px]">shield</span>
        <h1 className="font-sans text-[13px] font-bold text-accent tracking-wider uppercase">
          SOC VIGIL
        </h1>
      </div>

      {/* Center Status Badge - Desktop */}
      <div className="hidden md:flex items-center gap-sm bg-[#0d1117] px-2 py-0.5 rounded border border-border">
        <span className="material-symbols-outlined text-accent text-[12px] filled-icon">verified_user</span>
        <span className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider">
          System Status: <span className="text-[#58a6ff] font-mono font-bold">{systemStatus.toUpperCase()}</span>
        </span>
      </div>

      {/* Operator Details and Dropdown */}
      <div className="flex items-center gap-sm relative">
        <div className="hidden md:flex flex-col text-right">
          <span className="font-mono text-[10px] text-on-surface font-bold leading-none">{operator?.name || 'OPERATOR'}</span>
          <span className="font-sans text-[8px] text-on-surface-variant tracking-wider uppercase mt-1">{operator?.role || 'TIER 1 ANALYST'}</span>
        </div>

        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-7 h-7 rounded border border-border bg-[#0d1117] hover:bg-[#161b22] hover:border-[#8b949e] cursor-pointer transition-all flex items-center justify-center select-none"
        >
          <span className="font-mono text-[10px] text-accent font-bold">{getInitials()}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-9 bg-surface border border-border rounded p-1 shadow-sm w-44 flex flex-col z-50 animate-fade-in">
            <div className="px-2 py-1 border-b border-border/40 flex flex-col md:hidden">
              <span className="font-mono text-[10px] text-on-surface">{operator?.name || 'Operator'}</span>
              <span className="font-sans text-[8px] text-on-surface-variant uppercase">{operator?.role || 'Tier 1 Analyst'}</span>
            </div>
            <button 
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="flex items-center gap-xs px-2 py-1 text-[#f85149] hover:bg-[#f85149]/10 rounded w-full text-left font-sans text-[11px] transition-colors"
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
