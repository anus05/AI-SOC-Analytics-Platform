import React from 'react';
import client from '../../api/client';

const ReportModal = ({ report, onClose, onDownload }) => {
  if (!report) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload(report);
    } else {
      window.open(`${client.defaults.baseURL}/api/report/download/${report.id}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-left">
      <div className="bg-[#0d1117] border border-accent/40 rounded-lg max-w-3xl w-full p-6 shadow-2xl space-y-md my-8 relative">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border pb-3">
          <div>
            <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider block">
              ENTERPRISE SOC INCIDENT REPORT #{report.report_number}
            </span>
            <h2 className="font-sans text-[16px] font-bold text-on-surface mt-1">{report.title}</h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Risk Score & Quick Summary Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm bg-surface p-3 rounded border border-border/60 font-mono text-[10px]">
          <div>
            <span className="text-on-surface-variant block uppercase text-[8px]">Risk Score</span>
            <span className="font-bold text-[#f85149] text-[14px]">{report.risk_score} / 100</span>
          </div>
          <div>
            <span className="text-on-surface-variant block uppercase text-[8px]">Created At</span>
            <span className="font-bold text-on-surface">{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block uppercase text-[8px]">Alert Ref</span>
            <span className="font-bold text-accent">Alert #{report.alert_id || 1}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block uppercase text-[8px]">Document Format</span>
            <span className="font-bold text-[#3fb950]">PDF READY</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <h3 className="font-sans text-[11px] font-bold text-accent uppercase tracking-wider mb-1">
            1. Executive Summary
          </h3>
          <p className="font-sans text-[11px] text-on-surface leading-relaxed bg-surface p-3 rounded border border-border/40">
            {report.executive_summary}
          </p>
        </div>

        {/* Business Impact */}
        {report.business_impact && (
          <div>
            <h3 className="font-sans text-[11px] font-bold text-[#d29922] uppercase tracking-wider mb-1">
              2. Business & Operational Impact
            </h3>
            <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed bg-surface p-3 rounded border border-border/40">
              {report.business_impact}
            </p>
          </div>
        )}

        {/* Indicators of Compromise */}
        {report.iocs && (
          <div>
            <h3 className="font-sans text-[11px] font-bold text-[#f85149] uppercase tracking-wider mb-1">
              3. Indicators of Compromise (IOCs)
            </h3>
            <div className="overflow-x-auto bg-surface border border-border/60 rounded">
              <table className="w-full text-left font-mono text-[10px]">
                <thead className="bg-[#161b22] border-b border-border/60 text-on-surface-variant text-[9px] uppercase">
                  <tr>
                    <th className="p-2">Type</th>
                    <th className="p-2">Value</th>
                    <th className="p-2">Threat Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-on-surface">
                  {(typeof report.iocs === 'string' ? JSON.parse(report.iocs) : report.iocs).map((ioc, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold text-accent">{ioc.type}</td>
                      <td className="p-2 text-[#f85149] font-bold">{ioc.value}</td>
                      <td className="p-2 text-on-surface-variant">{ioc.threat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SOAR Response Recommendations */}
        {report.recommended_response && (
          <div>
            <h3 className="font-sans text-[11px] font-bold text-[#3fb950] uppercase tracking-wider mb-1">
              4. Recommended Containment & Recovery Steps
            </h3>
            <div className="bg-surface p-3 rounded border border-border/40 space-y-2 font-sans text-[11px]">
              <div>
                <span className="font-bold text-[#3fb950] block uppercase text-[10px]">Containment Actions</span>
                <ul className="list-disc list-inside text-on-surface-variant space-y-0.5 mt-0.5">
                  {((typeof report.recommended_response === 'string' ? JSON.parse(report.recommended_response) : report.recommended_response).containment_steps || []).map((step, s) => (
                    <li key={s}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-sm pt-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-surface border border-border text-on-surface font-sans text-[11px] font-bold uppercase transition-colors hover:bg-[#161b22]"
          >
            Close Preview
          </button>
          <button
            onClick={handleDownload}
            className="btn-primary px-5 py-1.5 rounded font-sans text-[11px] font-bold uppercase tracking-wider flex items-center gap-xs cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
