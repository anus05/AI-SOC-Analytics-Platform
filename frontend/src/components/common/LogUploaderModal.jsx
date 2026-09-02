import React, { useState } from 'react';
import axios from 'axios';

const LogUploaderModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8000/upload-logs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      setResult(res.data);
      if (onUploadSuccess) onUploadSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and parse log file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ingest Security Telemetry Logs</h2>
            <p className="text-xs text-slate-400">Upload EVTX, Syslog, Apache/Nginx, Suricata, Sysmon, Defender, CSV, JSON</p>
          </div>
        </div>

        {!result ? (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20'
                  : file
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
              }`}
            >
              <input
                type="file"
                id="log-file-input"
                className="hidden"
                accept=".csv,.json,.evtx,.log,.txt"
                onChange={handleFileChange}
              />
              <label htmlFor="log-file-input" className="cursor-pointer block">
                {file ? (
                  <div className="flex flex-col items-center space-y-2">
                    <span className="material-symbols-outlined text-[40px] text-emerald-400">description</span>
                    <span className="font-mono font-medium text-emerald-300 text-xs">{file.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <span className="material-symbols-outlined text-[40px] text-slate-400 mb-1">upload_file</span>
                    <span className="text-xs font-medium text-slate-200">
                      Drag & Drop log file here or <span className="text-cyan-400 underline font-bold">Browse</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Supports .csv, .json, .evtx, .log, .txt</span>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
                <span className="material-symbols-outlined text-[18px] text-rose-400 flex-shrink-0">warning</span>
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    <span>Parsing Telemetry...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Parse & Ingest Logs</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center space-x-3">
              <span className="material-symbols-outlined text-[28px] text-emerald-400 flex-shrink-0">check_circle</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Log Parsing Complete</h4>
                <p className="text-xs text-slate-300">
                  Successfully ingested <span className="font-mono font-bold text-white">{result.parsed_events_count}</span> events into PostgreSQL database.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Alerts Triggered</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full font-mono">
                  {result.alerts_generated} Alerts Flagged
                </span>
              </div>

              {result.alerts && result.alerts.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {result.alerts.map((al, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-900 rounded text-xs border border-slate-800">
                      <span className="font-mono font-semibold text-cyan-300">{al.attack}</span>
                      <span className="font-mono text-slate-400 text-[11px]">IP: {al.ip}</span>
                      <span className="font-mono text-rose-400 font-bold text-[10px] uppercase">{al.severity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No threat anomalies flagged from uploaded batch.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold bg-cyan-400 text-slate-950 rounded-lg hover:bg-cyan-300 transition-colors cursor-pointer"
              >
                Close & View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogUploaderModal;
