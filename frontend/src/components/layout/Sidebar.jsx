import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'DASHBOARD', icon: 'dashboard' },
    { path: '/alerts', label: 'INCIDENT LOGS', icon: 'notifications' },
    { path: '/statistics', label: 'TELEMETRY', icon: 'analytics' },
  ];

  return (
    <>
      {/* Desktop Left Sidebar Nav - Hidden on mobile */}
      <aside className="hidden md:flex flex-col w-56 bg-surface border-r border-border min-h-[calc(100vh-48px)] p-3 gap-sm shrink-0">
        <span className="font-sans text-[9px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">Navigation Menu</span>
        <div className="flex flex-col gap-[4px]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-sm px-3 py-1.5 rounded transition-all select-none border
                  ${isActive 
                    ? 'bg-[#1f242c] border-border text-accent font-bold' 
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-[#161b22]'
                  }
                `}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {item.icon}
                </span>
                <span className="font-sans text-[11px] font-bold tracking-wide">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
        
        {/* Connection status in sidebar footer */}
        <div className="mt-auto bg-[#0d1117] border border-border rounded p-2 text-left">
          <div className="flex items-center gap-[4px] mb-1">
            <div className="w-2 h-2 rounded-full bg-[#3fb8af]"></div>
            <span className="font-mono text-[9px] text-[#3fb8af] uppercase font-bold tracking-wider">GATEWAY CONNECTED</span>
          </div>
          <p className="font-mono text-[9px] text-on-surface-variant leading-relaxed">
            API Address: <br/>
            <span className="text-on-surface font-bold">http://localhost:8000</span>
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar - Hidden on desktop */}
      <nav className="md:hidden bg-surface text-on-surface-variant fixed bottom-0 left-0 w-full z-50 border-t border-border flex justify-around items-center h-12 pb-px shadow-sm">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center transition-all duration-100 ease-in-out w-16
                ${isActive 
                  ? 'text-accent font-bold' 
                  : 'text-on-surface-variant hover:text-accent'
                }
              `}
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              <span className="font-sans text-[9px] font-bold tracking-wider mt-px">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
