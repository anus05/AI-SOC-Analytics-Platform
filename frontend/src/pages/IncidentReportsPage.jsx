import React, { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import { useToast } from '../components/common/Toast';
import ReportModal from '../components/reports/ReportModal';

const IncidentReportsPage = () => {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/api/report');
      setReports(res.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch incident reports.');
      toast.error('Failed to load incident reports.');
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      toast.info("Generating enterprise SOC incident report & PDF document...");
      const res = await client.post('/api/report/generate/1');
      setGenerating(false);
      setActiveReport(res.data);
      toast.success(`Generated Incident Report ${res.data.report_number}`);
      fetchReports();
    } catch (err) {
      setGenerating(false);
      toast.error(err.response?.data?.detail || 'Failed to generate report.');
    }
  };

  const handleDownloadPdf = async (report) => {
    try {
      toast.info(`Downloading PDF report ${report.report_number}...`);
      const response = await client.get(`/api/report/download/${report.id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.report_number || 'Incident_Report'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF Report downloaded successfully.");
    } catch (err) {
      toast.error("Failed to download PDF report document.");
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto w-full text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="font-sans text-[16px] font-bold text-slate-200 uppercase tracking-wide">
            LLM Incident Report Generator
          </h1>
          <p className="font-sans text-[11px] text-slate-400">
            Automated enterprise SOC incident reports with executive summaries, MITRE mapping, IOCs, and downloadable PDFs.
          </p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="btn-primary rounded-lg py-2 px-4 font-sans font-bold text-[10px] uppercase tracking-wider flex justify-center items-center gap-1.5 cursor-pointer select-none disabled:opacity-50 shadow-sm"
        >
          {generating ? (
            <>
              <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
              <span>One-Click Generate Report</span>
            </>
          )}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 border border-rose-500/40 bg-rose-500/10 text-rose-400 font-mono text-[11px] rounded-lg flex justify-between items-center backdrop-blur-sm">
          <span>{error}</span>
          <button onClick={fetchReports} className="px-3 py-1 bg-rose-500 text-white rounded-md font-sans text-[10px] uppercase font-bold">
            Retry
          </button>
        </div>
      )}

      {/* Reports Grid / Index Table */}
      <div className="glass-panel shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 bg-slate-950/60 flex justify-between items-center">
          <h2 className="font-sans text-[10px] text-slate-200 uppercase tracking-wider font-bold">
            Generated Incident Audit Reports ({reports.length} Documents)
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] gap-2.5">
            <span className="material-symbols-outlined text-[28px] text-accent animate-spin">description</span>
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
              Fetching Reports from PostgreSQL...
            </span>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center font-mono text-[11px] text-slate-400">
            No incident reports generated yet. Click "One-Click Generate Report" above.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-slate-950/50 border-b border-white/10 text-slate-400 font-sans text-[9px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 font-bold pl-4">Report ID</th>
                  <th className="p-3 font-bold">Document Title</th>
                  <th className="p-3 font-bold">Risk Score</th>
                  <th className="p-3 font-bold">Generated Date</th>
                  <th className="p-3 font-bold text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] text-slate-200 divide-y divide-white/5">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 pl-4 font-bold text-accent">{r.report_number}</td>
                    <td className="p-3 font-sans font-semibold text-slate-200">{r.title}</td>
                    <td className="p-3 font-bold text-rose-400">{r.risk_score} / 100</td>
                    <td className="p-3 text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right pr-4 space-x-2">
                      <button
                        onClick={() => handleDownloadPdf(r)}
                        className="px-3 py-1 rounded-md bg-slate-950/70 border border-white/10 hover:border-teal-400 text-accent font-mono text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
                      >
                        PDF Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Preview Modal */}
      {activeReport && (
        <ReportModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
          onDownload={handleDownloadPdf}
        />
      )}
    </div>
  );
};

export default IncidentReportsPage;

