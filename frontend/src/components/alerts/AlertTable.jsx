import React from 'react';
import SeverityBadge from '../common/SeverityBadge';

const AlertTable = ({ 
  alerts = [], 
  onSelectAlert, 
  selectedAlertId, 
  loading,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  sortField = 'id',
  sortDirection = 'desc',
  onSortChange
}) => {
  if (loading) {
    return (
      <div className="flex flex-col glass-panel shadow-lg overflow-hidden animate-pulse">
        <div className="p-3 bg-slate-900/80 border-b border-white/10 h-9"></div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3 px-4 border-b border-white/5 gap-3">
            <div className="h-3.5 w-12 bg-white/10 rounded"></div>
            <div className="h-3.5 w-16 bg-white/10 rounded"></div>
            <div className="h-4 flex-grow max-w-xs bg-white/10 rounded"></div>
            <div className="h-3.5 w-20 bg-white/5 rounded"></div>
            <div className="h-3.5 w-24 bg-white/5 rounded"></div>
            <div className="h-3.5 w-16 bg-white/5 rounded"></div>
            <div className="h-3.5 w-10 bg-white/5 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 glass-panel text-slate-400 font-mono text-[11px] my-2 text-center">
        <span className="material-symbols-outlined mb-2 text-[28px] text-accent">report_off</span>
        <span className="font-semibold text-slate-200 uppercase">No Incidents Logged</span>
        <p className="font-sans text-[10px] text-slate-400 mt-1 max-w-sm">
          No incident alerts match your current filter and search parameters in PostgreSQL.
        </p>
      </div>
    );
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return (
      <span className="material-symbols-outlined text-[10px] ml-[2px]">
        {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  const handleColumnSort = (field) => {
    if (onSortChange) {
      const nextDir = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
      onSortChange(field, nextDir);
    }
  };

  return (
    <div className="flex flex-col glass-panel shadow-lg overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-xs">
            <tr className="font-sans text-[9px] text-slate-400 uppercase tracking-wider select-none">
              <th 
                className="p-3 font-bold pl-4 cursor-pointer hover:text-accent transition-colors"
                onClick={() => handleColumnSort('id')}
              >
                <div className="flex items-center">
                  <span>ID</span>
                  {renderSortIcon('id')}
                </div>
              </th>
              <th 
                className="p-3 font-bold cursor-pointer hover:text-accent transition-colors"
                onClick={() => handleColumnSort('severity')}
              >
                <div className="flex items-center">
                  <span>Severity</span>
                  {renderSortIcon('severity')}
                </div>
              </th>
              <th className="p-3 font-bold">Detector / Attack</th>
              <th className="p-3 font-bold">MITRE Technique</th>
              <th className="p-3 font-bold">User</th>
              <th className="p-3 font-bold">Source IP</th>
              <th className="p-3 font-bold">Destination</th>
              <th 
                className="p-3 font-bold text-right cursor-pointer hover:text-accent transition-colors pr-4"
                onClick={() => handleColumnSort('threat_score')}
              >
                <div className="flex items-center justify-end">
                  <span>Score</span>
                  {renderSortIcon('threat_score')}
                </div>
              </th>
              <th className="p-3 font-bold pr-4">Recommendation</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px] text-slate-200 divide-y divide-white/5">
            {alerts.map((alert, index) => {
              const isSelected = selectedAlertId === alert.id;
              const isZebra = index % 2 === 1;
              const rowBg = isSelected 
                ? 'bg-teal-500/15 font-semibold border-l-2 border-accent text-slate-100' 
                : isZebra 
                  ? 'bg-slate-950/30 hover:bg-slate-800/50' 
                  : 'bg-transparent hover:bg-slate-800/50';

              return (
                <tr
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className={`group transition-all duration-100 cursor-pointer ${rowBg}`}
                >
                  <td className="p-3 pl-4 text-slate-400 font-bold max-w-[70px] truncate">
                    #{alert.id}
                  </td>
                  <td className="p-3">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="p-3 font-sans text-slate-200 font-semibold max-w-[160px] truncate" title={alert.attack}>
                    {alert.attack}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-accent font-bold max-w-[130px] truncate" title={alert.technique}>
                    {alert.technique}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-400 max-w-[100px] truncate" title={alert.username}>
                    {alert.username}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-300 max-w-[120px] truncate" title={alert.sourceIp}>
                    {alert.sourceIp}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-400 max-w-[140px] truncate" title={alert.destination}>
                    {alert.destination}
                  </td>
                  <td className="p-3 text-right font-bold pr-4 font-mono text-accent">
                    {alert.threatScore}
                  </td>
                  <td className="p-3 font-sans text-[10px] text-slate-400 max-w-[200px] truncate pr-4" title={alert.recommendation}>
                    {alert.recommendation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages >= 1 && (
        <div className="bg-slate-950/70 px-4 py-2.5 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-slate-400 select-none backdrop-blur-md">
          <button 
            disabled={page <= 1}
            onClick={() => onPageChange && onPageChange(page - 1)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 hover:text-slate-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[12px]">chevron_left</span>
            <span>PREV</span>
          </button>
          <span className="font-bold text-slate-200">
            PAGE {page} OF {totalPages} ({totalItems} TOTAL ALERTS IN POSTGRESQL)
          </span>
          <button 
            disabled={page >= totalPages}
            onClick={() => onPageChange && onPageChange(page + 1)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 hover:text-slate-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>NEXT</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertTable;

