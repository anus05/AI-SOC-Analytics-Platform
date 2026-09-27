import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'DASHBOARD', icon: 'dashboard' },
    { path: '/alerts', label: 'INCIDENT LOGS', icon: 'notifications' },
    { path: '/statistics', label: 'TELEMETRY', icon: 'analytics' },
  ];

  const aiModuleItems = [
    { path: '/investigation', label: 'AI INVESTIGATION', icon: 'psychology' },
    { path: '/attack-timeline', label: 'ATTACK CHAINS', icon: 'hub' },
    { path: '/threat-intel', label: 'THREAT INTEL', icon: 'travel_explore' },
    { path: '/reports', label: 'INCIDENT REPORTS', icon: 'description' },
  ];

  return (
    <>
      {/* Desktop Left Sidebar Nav - Hidden on mobile */}
      <aside className="hidden md:flex flex-col w-60 bg-slate-900/60 backdrop-blur-md border-r border-white/10 min-h-[calc(100vh-52px)] p-3.5 gap-2 shrink-0 shadow-lg select-none">
        <span className="font-sans text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1 px-1">Navigation Menu</span>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 select-none border text-left
                  ${isActive 
                    ? 'bg-teal-500/15 border-teal-500/40 text-accent font-bold shadow-xs' 
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 hover:border-white/5'
                  }
                `}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {item.icon}
                </span>
                <span className="font-sans text-[11px] font-bold tracking-wide">{item.label}</span>
              </NavLink>
          ))}
        </div>

        {/* AI Enterprise Modules Section Separator */}
        <span className="font-sans text-[9px] font-bold text-accent tracking-wider uppercase mt-4 mb-1 px-1">AI Modules</span>
        <div className="flex flex-col gap-1">
          {aiModuleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 select-none border text-left
                  ${isActive 
                    ? 'bg-teal-500/15 border-teal-500/40 text-accent font-bold shadow-xs' 
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 hover:border-white/5'
                  }
                `}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {item.icon}
                </span>
                <span className="font-sans text-[11px] font-bold tracking-wide">{item.label}</span>
              </NavLink>
          ))}
        </div>
        
        {/* Connection status in sidebar footer */}
        <div className="mt-auto bg-slate-950/70 border border-white/10 rounded-lg p-2.5 text-left backdrop-blur-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
            <span className="font-mono text-[9px] text-teal-400 uppercase font-bold tracking-wider">GATEWAY CONNECTED</span>
          </div>
          <p className="font-mono text-[9px] text-slate-400 leading-relaxed">
            API Address: <br/>
            <span className="text-slate-200 font-bold">http://localhost:8000</span>
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar - Hidden on desktop */}
      <nav className="md:hidden bg-slate-900/90 backdrop-blur-xl text-slate-400 fixed bottom-0 left-0 w-full z-50 border-t border-white/10 flex justify-around items-center h-12 pb-px shadow-2xl overflow-x-auto">
        {[...navItems, ...aiModuleItems].map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center transition-all duration-100 ease-in-out w-14 shrink-0
                ${isActive 
                  ? 'text-accent font-bold' 
                  : 'text-slate-400 hover:text-accent'
                }
              `}
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              <span className="font-sans text-[7px] font-bold tracking-wider mt-px">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;

