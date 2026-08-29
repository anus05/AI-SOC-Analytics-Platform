import React, { useState } from 'react';
import SeverityBadge from '../common/SeverityBadge';

const severityWeight = {
  'CRITICAL': 4,
  'HIGH': 3,
  'MEDIUM': 2,
  'LOW': 1
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/^(\d+)(m|h|d)\s+ago/);
  if (!match) return 999999;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 'm') return val;
  if (unit === 'h') return val * 60;
  if (unit === 'd') return val * 24 * 60;
  return val;
};

const AlertTable = ({ alerts, onSelectAlert, selectedAlertId, loading }) => {
  const [sortField, setSortField] = useState('time');
  const [sortDirection, setSortDirection] = useState('asc'); // asc = most recent first because min-value minutes is smaller
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return (
      <div className="flex flex-col border border-border rounded bg-surface shadow-sm overflow-hidden animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3 px-4 border-b border-border/40 gap-sm">
            <div className="h-3 w-16 bg-[#22262f] rounded"></div>
            <div className="h-3 w-14 bg-[#22262f] rounded"></div>
            <div className="h-4 flex-grow max-w-md bg-[#22262f]/80 rounded"></div>
            <div className="h-3 w-24 bg-[#22262f]/60 rounded"></div>
            <div className="h-3 w-10 bg-[#22262f]/60 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-md border border-border rounded bg-surface text-on-surface-variant font-mono text-[11px]">
        <span className="material-symbols-outlined mb-sm text-[16px]">report_off</span>
        <span className="font-semibold">NO INCIDENTS REGISTERED</span>
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset page to 1 on sort change
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return (
      <span className="material-symbols-outlined text-[10px] ml-[2px]">
        {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'severity') {
      aVal = severityWeight[(a.severity || '').toUpperCase()] || 0;
      bVal = severityWeight[(b.severity || '').toUpperCase()] || 0;
    } else if (sortField === 'time') {
      aVal = parseTimeToMinutes(a.time);
      bVal = parseTimeToMinutes(b.time);
    } else if (sortField === 'threatScore') {
      aVal = a.threatScore || a.score || 0;
      bVal = b.threatScore || b.score || 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination bounds
  const pageSize = 15;
  const totalPages = Math.ceil(sortedAlerts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAlerts = sortedAlerts.slice(startIndex, startIndex + pageSize);

  return (
    <div className="flex flex-col border border-border rounded bg-surface shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-20 bg-[#161b22] border-b border-border shadow-xs">
            <tr className="font-sans text-[9px] text-on-surface-variant uppercase tracking-wider select-none">
              <th className="p-2.5 font-bold pl-3">ID</th>
              <th 
                className="p-2.5 font-bold cursor-pointer hover:text-accent transition-colors"
                onClick={() => handleSort('severity')}
              >
                <div className="flex items-center">
                  <span>Severity</span>
                  {renderSortIcon('severity')}
                </div>
              </th>
              <th className="p-2.5 font-bold">Title</th>
              <th className="p-2.5 font-bold">Source IP</th>
              <th className="p-2.5 font-bold">Destination</th>
              <th 
                className="p-2.5 font-bold cursor-pointer hover:text-accent transition-colors"
                onClick={() => handleSort('time')}
              >
                <div className="flex items-center">
                  <span>Time</span>
                  {renderSortIcon('time')}
                </div>
              </th>
              <th 
                className="p-2.5 font-bold text-right cursor-pointer hover:text-accent transition-colors pr-4"
                onClick={() => handleSort('threatScore')}
              >
                <div className="flex items-center justify-end">
                  <span>Score</span>
                  {renderSortIcon('threatScore')}
                </div>
              </th>
              <th className="p-2.5 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px] text-on-surface divide-y divide-border/40">
            {paginatedAlerts.map((alert, index) => {
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
                  <td className="p-2.5 pl-3 text-on-surface-variant font-bold max-w-[100px] truncate">
                    #{alert.id}
                  </td>
                  <td className="p-2.5">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="p-2.5 font-sans text-on-surface font-medium truncate max-w-[200px]" title={alert.title}>
                    {alert.title}
                  </td>
                  <td className="p-2.5 font-mono text-[10px] text-on-surface-variant max-w-[120px] truncate" title={alert.sourceIp || alert.ip}>
                    {alert.sourceIp || alert.ip}
                  </td>
                  <td className="p-2.5 font-mono text-[10px] text-on-surface-variant max-w-[150px] truncate" title={alert.destination || 'N/A'}>
                    {alert.destination || 'N/A'}
                  </td>
                  <td className="p-2.5 text-on-surface-variant whitespace-nowrap">
                    {alert.time}
                  </td>
                  <td className="p-2.5 text-right font-bold pr-4 font-mono text-accent">
                    {alert.threatScore || alert.score || 0}
                  </td>
                  <td className="p-2.5">
                    {alert.status && alert.status !== 'New' ? (
                      <span className="font-mono text-[9px] border border-border px-1.5 py-px rounded bg-background text-on-surface-variant font-bold uppercase">
                        {alert.status}
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] border border-accent/20 px-1.5 py-px rounded bg-accent/5 text-accent font-bold uppercase">
                        NEW
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="bg-[#11151c] px-3 py-2 border-t border-border flex items-center justify-between font-mono text-[9px] text-on-surface-variant select-none">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="flex items-center gap-xs px-2 py-1 rounded border border-border bg-background hover:bg-[#161b22] hover:text-on-surface transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[12px]">chevron_left</span>
            <span>PREV</span>
          </button>
          <span>PAGE {currentPage} OF {totalPages} ({alerts.length} ALERTS)</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
