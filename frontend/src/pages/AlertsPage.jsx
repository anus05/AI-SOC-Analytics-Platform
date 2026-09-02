import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../hooks/useAlerts';
import { useToast } from '../components/common/Toast';
import AlertFilters from '../components/alerts/AlertFilters';
import AlertTable from '../components/alerts/AlertTable';

const AlertsPage = () => {
  const { getAlerts, loading } = useAlerts();
  const toast = useToast();
  const navigate = useNavigate();

  const [alertsData, setAlertsData] = useState({ alerts: [], total: 0, page: 1, size: 10, total_pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      setError(null);
      const res = await getAlerts({
        page,
        size: 10,
        severity: activeFilter !== 'ALL' && ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(activeFilter) ? activeFilter : undefined,
        attack: activeFilter !== 'ALL' && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(activeFilter) ? activeFilter : undefined,
        search: searchTerm || undefined,
        sort_by: sortField,
        order: sortDirection
      });
      setAlertsData(res);
      if (isManual) toast.success("Incident log registry synchronized from PostgreSQL.");
    } catch (err) {
      setError(err.message || "Failed to fetch alert logs.");
      toast.error(err.message || "Alert fetch error.");
    } finally {
      setIsRefreshing(false);
    }
  }, [getAlerts, page, activeFilter, searchTerm, sortField, sortDirection, toast]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    setPage(1);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setPage(1);
  };

  const handleSelectAlert = (alert) => {
    navigate(`/alerts/${alert.id}`);
  };

  return (
    <div className="flex flex-col gap-sm max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
        <div>
          <h1 className="font-sans text-[16px] font-bold text-on-surface uppercase tracking-wide">
            Threat Registry Logs
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant">
            PostgreSQL query results for flagged security anomalies, detector alerts, and ML predictions.
          </p>
        </div>
        <button
          onClick={() => fetchAlerts(true)}
          disabled={isRefreshing || loading}
          className="flex items-center gap-xs px-3 py-1.5 rounded bg-surface border border-border text-on-surface hover:text-accent font-mono text-[10px] transition-all cursor-pointer disabled:opacity-50 select-none"
        >
          <span className={`material-symbols-outlined text-[14px] ${isRefreshing ? 'animate-spin text-accent' : ''}`}>
            refresh
          </span>
          <span>{isRefreshing ? 'Syncing...' : 'Sync Logs'}</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 border border-[#f85149]/40 bg-[#f85149]/10 text-[#f85149] font-mono text-[11px] rounded flex justify-between items-center gap-sm animate-fade-in">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">wifi_off</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchAlerts(true)}
            className="px-3 py-1 rounded bg-[#f85149] text-white font-sans text-[10px] font-bold uppercase tracking-wider hover:bg-[#da3633] transition-colors cursor-pointer"
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* Filter Chips & Search inputs */}
      <AlertFilters 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Paginated Alert Table */}
      <AlertTable 
        alerts={alertsData.alerts}
        loading={loading && alertsData.alerts.length === 0}
        page={alertsData.page}
        totalPages={alertsData.total_pages}
        totalItems={alertsData.total}
        onPageChange={(newPage) => setPage(newPage)}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onSelectAlert={handleSelectAlert}
      />
    </div>
  );
};

export default AlertsPage;
