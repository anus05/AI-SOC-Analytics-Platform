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
      <div className="flex flex-col border border-border rounded bg-surface shadow-sm overflow-hidden animate-pulse">
        <div className="p-3 bg-[#161b22] border-b border-border h-8"></div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3 px-4 border-b border-border/40 gap-sm">
            <div className="h-3 w-12 bg-[#22262f] rounded"></div>
            <div className="h-3 w-16 bg-[#22262f] rounded"></div>
            <div className="h-4 flex-grow max-w-xs bg-[#22262f]/80 rounded"></div>
            <div className="h-3 w-20 bg-[#22262f]/60 rounded"></div>
            <div className="h-3 w-24 bg-[#22262f]/60 rounded"></div>
            <div className="h-3 w-16 bg-[#22262f]/60 rounded"></div>
            <div className="h-3 w-10 bg-[#22262f]/60 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-border rounded bg-surface text-on-surface-variant font-mono text-[11px] my-2 text-center">
        <span className="material-symbols-outlined mb-2 text-[24px] text-accent">report_off</span>
        <span className="font-semibold text-on-surface uppercase">No Incidents Logged</span>
        <p className="font-sans text-[10px] text-on-surface-variant mt-1 max-w-sm">
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
    <div className="flex flex-col border border-border rounded bg-surface shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead className="sticky top-0 z-20 bg-[#161b22] border-b border-border shadow-xs">
            <tr className="font-sans text-[9px] text-on-surface-variant uppercase tracking-wider select-none">
              <th 
                className="p-2.5 font-bold pl-3 cursor-pointer hover:text-accent transition-colors"
                onClick={() => handleColumnSort('id')}
              >
                <div className="flex items-center">
                  <span>ID</span>
                  {renderSortIcon('id')}
                </div>
              </th>
              <th 
                className="p-2.5 font-bold cursor-pointer hover:text-accent transition-colors"
                onClick={() => handleColumnSort('severity')}
              >
                <div className="flex items-center">
                  <span>Severity</span>
                  {renderSortIcon('severity')}
                </div>
              </th>
              <th className="p-2.5 font-bold">Detector / Attack</th>
              <th className="p-2.5 font-bold">MITRE Technique</th>
              <th className="p-2.5 font-bold">User</th>
              <th className="p-2.5 font-bold">Source IP</th>
              <th className="p-2.5 font-bold">Destination</th>
              <th 
                className="p-2.5 font-bold text-right cursor-pointer hover:text-accent transition-colors pr-3"
                onClick={() => handleColumnSort('threat_score')}
              >
                <div className="flex items-center justify-end">
                  <span>Score</span>
                  {renderSortIcon('threat_score')}
                </div>
              </th>
              <th className="p-2.5 font-bold pr-3">Recommendation</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px] text-on-surface divide-y divide-border/40">
            {alerts.map((alert, index) => {
              const isSelected = selectedAlertId === alert.id;
              const isZebra = index % 2 === 1;
              const rowBg = isSelected 
                ? 'bg-[#1f242c] font-semibold border-l-2 border-accent' 
                : isZebra 
                  ? 'bg-[#0d1117]/40 hover:bg-[#161b22]' 
                  : 'bg-[#11151c] hover:bg-[#161b22]';

              return (
                <tr
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className={`group transition-all duration-100 cursor-pointer ${rowBg}`}
                >
                  <td className="p-2.5 pl-3 text-on-surface-variant font-bold max-w-[70px] truncate">
                    #{alert.id}
                  </td>
                  <td className="p-2.5">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="p-2.5 font-sans text-on-surface font-semibold max-w-[160px] truncate" title={alert.attack}>
                    {alert.attack}
                  </td>
                  <td className="p-2.5 font-mono text-[10px] text-accent font-bold max-w-[130px] truncate" title={alert.technique}>
                    {alert.technique}
                  </td>
                  <td className="p-2.5 font-mono text-[10px] text-on-surface-variant max-w-[100px] truncate" title={alert.username}>
                    {alert.username}
                  </td>
                  <td className="p-2.5 font-mono text-[10px] text-on-surface-variant max-w-[120px] truncate" title={alert.sourceIp}>
                    {alert.sourceIp}
                  </td>
                  <td className="p-2.5 font-mono text-[10px] text-on-surface-variant max-w-[140px] truncate" title={alert.destination}>
                    {alert.destination}
                  </td>
                  <td className="p-2.5 text-right font-bold pr-3 font-mono text-accent">
                    {alert.threatScore}
                  </td>
                  <td className="p-2.5 font-sans text-[10px] text-on-surface-variant max-w-[200px] truncate pr-3" title={alert.recommendation}>
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
        <div className="bg-[#11151c] px-3 py-2 border-t border-border flex items-center justify-between font-mono text-[9px] text-on-surface-variant select-none">
          <button 
            disabled={page <= 1}
            onClick={() => onPageChange && onPageChange(page - 1)}
            className="flex items-center gap-xs px-2 py-1 rounded border border-border bg-background hover:bg-[#161b22] hover:text-on-surface transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[12px]">chevron_left</span>
            <span>PREV</span>
          </button>
          <span className="font-bold text-on-surface">
            PAGE {page} OF {totalPages} ({totalItems} TOTAL ALERTS IN POSTGRESQL)
          </span>
          <button 
            disabled={page >= totalPages}
            onClick={() => onPageChange && onPageChange(page + 1)}
            className="flex items-center gap-xs px-2 py-1 rounded border border-border bg-background hover:bg-[#161b22] hover:text-on-surface transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
