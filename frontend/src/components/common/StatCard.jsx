import React from 'react';

const StatCard = ({ title, value, diff, icon, pulse, iconColor = 'text-on-surface-variant', valueColor = 'text-on-surface', showSparkline, loading }) => {
  return (
    <div className="bg-surface border border-border rounded p-3 relative overflow-hidden group hover:border-[#30363d] transition-all">
      <div className="flex justify-between items-start mb-1 relative z-10">
        <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">{title}</span>
        <span className={`material-symbols-outlined ${iconColor} text-[14px]`}>{icon}</span>
      </div>
      
      {loading ? (
        <div className="h-6 w-24 bg-border/40 animate-pulse rounded mt-2"></div>
      ) : (
        <div className="flex items-center gap-xs relative z-10 animate-fade-in">
          <span className={`font-mono text-[16px] md:text-[18px] font-bold ${valueColor} tracking-tight`}>
            {value}
          </span>
          {diff && (
            <span className="font-mono text-[9px] text-accent font-semibold">{diff}</span>
          )}
          {pulse && (
            <div className={`w-1.5 h-1.5 rounded-full ${pulse === 'critical' ? 'bg-[#f85149]' : 'bg-[#d29922]'}`}></div>
          )}
        </div>
      )}

      {!loading && showSparkline && (
        <svg className="absolute bottom-0 left-0 w-full h-5 opacity-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 20">
          <polyline points="0,20 15,14 30,17 45,6 60,11 75,5 90,14 100,2" fill="none" stroke="#58a6ff" strokeWidth="1.5" />
        </svg>
      )}
    </div>
  );
};

export default StatCard;
