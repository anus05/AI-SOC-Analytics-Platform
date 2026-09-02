import React from 'react';

const ThreatIntelCard = ({ intel }) => {
  if (!intel) return null;

  const getBadgeStyle = (badge) => {
    switch ((badge || '').toUpperCase()) {
      case 'MALICIOUS':
        return 'bg-[#f85149] text-white border-[#f85149]';
      case 'SUSPICIOUS':
        return 'bg-[#d29922] text-black border-[#d29922]';
      case 'SAFE':
        return 'bg-[#238636] text-white border-[#238636]';
      default:
        return 'bg-[#8b949e] text-black border-[#8b949e]';
    }
  };

  return (
    <div className="bg-surface border border-border rounded p-4 flex flex-col gap-sm text-left card-hover">
      {/* Header Badge */}
      <div className="flex justify-between items-center border-b border-border/40 pb-2">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px] text-accent">public</span>
          <span className="font-mono text-[14px] font-bold text-on-surface">{intel.ip_address}</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase border ${getBadgeStyle(intel.reputation_badge)}`}>
          {intel.reputation_badge}
        </span>
      </div>

      {/* Grid Properties */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-sm font-mono text-[10px]">
        <div>
          <span className="text-on-surface-variant block uppercase text-[8px]">Location</span>
          <span className="font-bold text-on-surface">{intel.city}, {intel.country}</span>
        </div>
        <div>
          <span className="text-on-surface-variant block uppercase text-[8px]">ASN</span>
          <span className="font-bold text-accent">{intel.asn}</span>
        </div>
        <div>
          <span className="text-on-surface-variant block uppercase text-[8px]">Organization</span>
          <span className="font-bold text-on-surface truncate block" title={intel.organization}>{intel.organization}</span>
        </div>
        <div>
          <span className="text-on-surface-variant block uppercase text-[8px]">Reverse DNS</span>
          <span className="font-bold text-on-surface truncate block" title={intel.reverse_dns}>{intel.reverse_dns}</span>
        </div>
        <div>
          <span className="text-on-surface-variant block uppercase text-[8px]">Abuse Confidence Score</span>
          <span className={`font-bold ${intel.abuse_score >= 70 ? 'text-[#f85149]' : intel.abuse_score >= 30 ? 'text-[#d29922]' : 'text-[#3fb950]'}`}>
            {intel.abuse_score}%
          </span>
        </div>
        <div>
          <span className="text-on-surface-variant block uppercase text-[8px]">Cloud Provider</span>
          <span className="font-bold text-on-surface">{intel.cloud_provider}</span>
        </div>
        <div>
          <span className="text-on-surface-variant block uppercase text-[8px]">TOR Exit Node</span>
          <span className={`font-bold ${intel.is_tor ? 'text-[#f85149]' : 'text-on-surface-variant'}`}>
            {intel.is_tor ? 'YES (FLAGGED)' : 'NO'}
          </span>
        </div>
        <div>
          <span className="text-on-surface-variant block uppercase text-[8px]">VPN Network</span>
          <span className={`font-bold ${intel.is_vpn ? 'text-[#d29922]' : 'text-on-surface-variant'}`}>
            {intel.is_vpn ? 'YES' : 'NO'}
          </span>
        </div>
      </div>

      {/* Malware Families */}
      {intel.malware_families && intel.malware_families.length > 0 && (
        <div className="pt-2 border-t border-border/40">
          <span className="font-sans text-[9px] font-bold text-[#f85149] uppercase tracking-wider block mb-1">
            Known Malware Families
          </span>
          <div className="flex flex-wrap gap-xs">
            {intel.malware_families.map((fam, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] font-mono text-[9px] font-bold">
                {fam}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatIntelCard;
