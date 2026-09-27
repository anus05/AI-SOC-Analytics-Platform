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
    <div className="space-y-4 max-w-[1600px] mx-auto w-full text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="font-sans text-[16px] font-bold text-slate-200 uppercase tracking-wide">
            Automated Threat Intelligence Enrichment
          </h1>
          <p className="font-sans text-[11px] text-slate-400">
            Provider abstraction layer querying AbuseIPDB, GeoIP, ASN, TOR exit nodes, and malware reputation database.
          </p>
        </div>
        <button
          onClick={fetchIntel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/10 text-slate-300 hover:text-accent font-mono text-[10px] transition-all cursor-pointer select-none backdrop-blur-sm shadow-sm"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          <span>Refresh Database</span>
        </button>
      </div>

      {/* IP Lookup Search Bar */}
      <div className="glass-panel-interactive p-4">
        <h2 className="font-sans text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-2">
          IP Address Reputation & Telemetry Lookup
        </h2>
        <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
          <input
            type="text"
            value={searchIp}
            onChange={(e) => setSearchIp(e.target.value)}
            disabled={searching}
            placeholder="Enter IPv4 Address e.g. 185.199.108.153 or 45.22.19.102"
            className="input-field flex-1 rounded-lg px-3 py-2 font-mono text-[11px]"
            required
          />
          <button
            type="submit"
            disabled={searching}
            className="btn-primary rounded-lg py-2 px-4 font-sans font-bold text-[10px] uppercase tracking-wider transition-all flex justify-center items-center gap-1.5 cursor-pointer select-none disabled:opacity-50 shadow-sm"
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
        <div className="space-y-2">
          <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider block">
            PROPOSING ACTIVE LOOKUP RESULT
          </span>
          <ThreatIntelCard intel={activeIntel} />
        </div>
      )}

      {/* Database Enriched Grid */}
      <div className="space-y-3">
        <h2 className="font-sans text-[11px] font-bold text-slate-200 uppercase tracking-wider">
          Enriched Threat Intelligence Database ({intelList.length} IP Records)
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] gap-2.5">
            <span className="material-symbols-outlined text-[28px] text-accent animate-spin">travel_explore</span>
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
              Querying PostgreSQL Threat Intel Database...
            </span>
          </div>
        ) : intelList.length === 0 ? (
          <div className="p-8 border border-dashed border-white/10 rounded-lg glass-panel text-center font-mono text-[11px] text-slate-400">
            No threat intelligence records cached in database yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

