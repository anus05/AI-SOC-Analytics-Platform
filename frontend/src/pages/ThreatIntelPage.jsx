import React, { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import { useToast } from '../components/common/Toast';
import ThreatIntelCard from '../components/threatintel/ThreatIntelCard';

const ThreatIntelPage = () => {
  const toast = useToast();
  const [intelList, setIntelList] = useState([]);
  const [searchIp, setSearchIp] = useState('');
  const [activeIntel, setActiveIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const fetchIntel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/api/threat-intel');
      setIntelList(res.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch threat intelligence database.');
      toast.error('Failed to load threat intelligence telemetry.');
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchIntel();
  }, [fetchIntel]);

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    if (!searchIp) return;
    setSearching(true);
    try {
      toast.info(`Querying threat intelligence provider for IP: ${searchIp}...`);
      const res = await client.get(`/api/threat-intel/lookup/${searchIp}`);
      setActiveIntel(res.data);
      setSearching(false);
      toast.success(`Enriched telemetry obtained for ${searchIp} (${res.data.reputation_badge})`);
      fetchIntel();
    } catch (err) {
      setSearching(false);
      toast.error(err.response?.data?.detail || 'Threat intel lookup failed.');
    }
  };

  return (
    <div className="space-y-md max-w-[1600px] mx-auto w-full text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
        <div>
          <h1 className="font-sans text-[16px] font-bold text-on-surface uppercase tracking-wide">
            Automated Threat Intelligence Enrichment
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant">
            Provider abstraction layer querying AbuseIPDB, GeoIP, ASN, TOR exit nodes, and malware reputation database.
          </p>
        </div>
        <button
          onClick={fetchIntel}
          className="flex items-center gap-xs px-3 py-1.5 rounded bg-surface border border-border text-on-surface hover:text-accent font-mono text-[10px] transition-all cursor-pointer select-none"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          <span>Refresh Database</span>
        </button>
      </div>

      {/* IP Lookup Search Bar */}
      <div className="bg-surface border border-border rounded p-4 card-hover">
        <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider mb-2">
          IP Address Reputation & Telemetry Lookup
        </h2>
        <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-sm max-w-xl">
          <input
            type="text"
            value={searchIp}
            onChange={(e) => setSearchIp(e.target.value)}
            disabled={searching}
            placeholder="Enter IPv4 Address e.g. 185.199.108.153 or 45.22.19.102"
            className="input-field flex-1 rounded px-3 py-1.5 font-mono text-[11px]"
            required
          />
          <button
            type="submit"
            disabled={searching}
            className="btn-primary rounded py-1.5 px-4 font-sans font-bold text-[10px] uppercase tracking-wider transition-all flex justify-center items-center gap-xs cursor-pointer select-none disabled:opacity-50"
          >
            {searching ? (
              <>
                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                <span>Enriching Telemetry...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px]">search</span>
                <span>Lookup IP Intel</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Lookup Active Result Card */}
      {activeIntel && (
        <div className="space-y-sm">
          <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider block">
            PROPOSING ACTIVE LOOKUP RESULT
          </span>
          <ThreatIntelCard intel={activeIntel} />
        </div>
      )}

      {/* Database Enriched Grid */}
      <div className="space-y-sm">
        <h2 className="font-sans text-[11px] font-bold text-on-surface uppercase tracking-wider">
          Enriched Threat Intelligence Database ({intelList.length} IP Records)
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] gap-sm">
            <span className="material-symbols-outlined text-[28px] text-accent animate-spin">travel_explore</span>
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">
              Querying PostgreSQL Threat Intel Database...
            </span>
          </div>
        ) : intelList.length === 0 ? (
          <div className="p-8 border border-dashed border-border rounded bg-surface text-center font-mono text-[11px] text-on-surface-variant">
            No threat intelligence records cached in database yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            {intelList.map((intel) => (
              <ThreatIntelCard key={intel.id} intel={intel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatIntelPage;
