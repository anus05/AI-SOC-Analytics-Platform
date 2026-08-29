import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../hooks/useAlerts';
import AlertFilters from '../components/alerts/AlertFilters';
import AlertTable from '../components/alerts/AlertTable';

const AlertsPage = () => {
  const { getAlerts, loading, error } = useAlerts();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(15);

  useEffect(() => {
    let active = true;
    const loadAlerts = async () => {
      const data = await getAlerts();
      if (active) {
        setAlerts(data);
        setFilteredAlerts(data);
      }
    };
    loadAlerts();
    return () => { active = false; };
  }, [getAlerts]);

  // Handle Search and Filter changes
  useEffect(() => {
    let result = [...alerts];

    // Filter by Category
    if (activeFilter !== 'ALL') {
      const filter = activeFilter.toUpperCase();
      result = result.filter(item => {
        const itemSeverity = (item.severity || '').toUpperCase();
        const itemTitle = (item.title || '').toUpperCase();
        const itemMitre = (item.mitreTechnique || '').toUpperCase();
        
        if (filter === 'CRITICAL' || filter === 'HIGH' || filter === 'MEDIUM' || filter === 'LOW') {
          return itemSeverity === filter;
        } else if (filter === 'BRUTE FORCE') {
          return itemTitle.includes('BRUTE FORCE') || itemMitre.includes('BRUTE FORCE') || itemMitre.includes('T1110');
        } else if (filter === 'MALWARE') {
          return itemTitle.includes('MALWARE') || itemTitle.includes('RANSOMWARE') || itemMitre.includes('T1562');
        }
        return true;
      });
    }

    // Filter by Search Query
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toUpperCase();
      result = result.filter(item => 
        (item.id || '').toUpperCase().includes(query) ||
        (item.sourceIp || item.ip || '').toUpperCase().includes(query) ||
        (item.title || '').toUpperCase().includes(query) ||
        (item.userAccount || '').toUpperCase().includes(query) ||
        (item.destination || '').toUpperCase().includes(query)
      );
    }

    setFilteredAlerts(result);
    setVisibleCount(15);
  }, [searchTerm, activeFilter, alerts]);

  const handleSelectAlert = (alert) => {
    navigate(`/alerts/${alert.id}`);
  };

  const isDataLoading = loading && alerts.length === 0;

  return (
    <div className="flex flex-col gap-sm max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col">
        <h1 className="font-sans text-[16px] font-bold text-on-surface uppercase tracking-wide">
          Threat Registry Logs
        </h1>
        <p className="font-sans text-[11px] text-on-surface-variant">
          Realtime telemetry flow of flagged security anomalies and system triggers.
        </p>
      </div>

      {/* Connection Warning Banner */}
      {error && (
        <div className="p-2 border border-severity-high/30 bg-severity-high/10 text-severity-high font-mono text-[10px] rounded flex justify-between items-center gap-sm animate-fade-in">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[14px]">wifi_off</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filter Chips & Search inputs */}
      <AlertFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {isDataLoading ? (
        <AlertTable loading={true} />
      ) : filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded bg-surface text-on-surface-variant font-mono text-[11px] text-center my-2">
          <span className="material-symbols-outlined mb-2 text-[20px] text-accent">report_off</span>
          <span className="font-semibold text-on-surface uppercase">No alerts match your filters</span>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('ALL');
            }}
            className="mt-3 font-sans text-[10px] uppercase font-bold tracking-wider text-accent border border-[#30363d] hover:border-accent hover:bg-accent/10 transition-all cursor-pointer px-3 py-1 rounded bg-background"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Dense Table View */}
          <AlertTable 
            alerts={filteredAlerts.slice(0, visibleCount)}
            onSelectAlert={handleSelectAlert}
          />

          {/* Load More Button */}
          {filteredAlerts.length > visibleCount && (
            <div className="flex justify-center items-center w-full py-2">
              <button 
                onClick={() => setVisibleCount(prev => prev + 15)}
                className="font-mono text-[9px] uppercase font-bold tracking-wider text-accent hover:text-white transition-colors cursor-pointer select-none px-3 py-1.5 bg-surface rounded border border-border"
              >
                LOAD MORE ALERTS
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AlertsPage;
