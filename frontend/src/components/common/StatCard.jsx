import React from 'react';

const StatCard = ({ title, value, diff, icon, pulse, iconColor = 'text-slate-400', valueColor = 'text-slate-100', showSparkline, loading }) => {
  return (
    <div className="glass-panel-interactive p-4 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-1.5 relative z-10">
        <span className="font-sans text-[9px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <span className={`material-symbols-outlined ${iconColor} text-[15px]`}>{icon}</span>
      </div>
      
      {loading ? (
        <div className="h-7 w-24 bg-white/10 animate-pulse rounded-md mt-2"></div>
      ) : (
        <div className="flex items-center gap-2 relative z-10 animate-fade-in">
          <span className={`font-mono text-[17px] md:text-[20px] font-bold ${valueColor} tracking-tight`}>
            {value}
          </span>
          {diff && (
            <span className="font-mono text-[9px] text-accent font-semibold bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">{diff}</span>
          )}
          {pulse && (
            <div className={`w-2 h-2 rounded-full ${pulse === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`}></div>
          )}
        </div>
      )}

      {!loading && showSparkline && (
        <svg className="absolute bottom-0 left-0 w-full h-6 opacity-15 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 20">
          <polyline points="0,20 15,14 30,17 45,6 60,11 75,5 90,14 100,2" fill="none" stroke="#2dd4bf" strokeWidth="1.5" />
        </svg>
      )}
    </div>
  );
};

export default StatCard;

