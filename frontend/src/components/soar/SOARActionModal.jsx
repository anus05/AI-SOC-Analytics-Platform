import React, { useState } from 'react';
import axios from 'axios';

const SOARActionModal = ({ isOpen, onClose, target, alertId, defaultAction = "block_ip" }) => {
  const [actionType, setActionType] = useState(defaultAction);
  const [loading, setLoading] = useState(false);
  const [executed, setExecuted] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const actions = [
    { id: "block_ip", name: "Block IP Address", desc: "Push perimeter firewall drop rule" },
    { id: "disable_user", name: "Disable User Account", desc: "Revoke Active Directory & LDAP credentials" },
    { id: "kill_process", name: "Kill Malicious Process", desc: "Terminate PID on target host endpoint" },
    { id: "create_ticket", name: "Create Incident Ticket", desc: "Generate Jira / ServiceNow ticket" },
    { id: "send_email", name: "Send Email Alert", desc: "Notify SOC incident response team" },
    { id: "send_slack", name: "Send Slack Notification", desc: "Post to #soc-incident-response" },
    { id: "send_teams", name: "Send Teams Alert", desc: "Dispatch Microsoft Teams webhook" },
    { id: "export_ioc", name: "Export STIX/CSV IOCs", desc: "Download IOC indicator package" },
    { id: "generate_sigma", name: "Generate Sigma Rule", desc: "Build Sigma SIEM detection rule" },
    { id: "generate_yara", name: "Generate YARA Rule", desc: "Build YARA malware signature" },
    { id: "generate_snort", name: "Generate Snort Rule", desc: "Build Snort/Suricata IDS rule" }
  ];

  const handleExecute = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8000/soar/execute', {
        action_type: actionType,
        target: target || "185.199.108.153",
        alert_id: alertId || null
      }, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setExecuted(res.data);
    } catch (err) {
      console.error('SOAR Execution failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRule = () => {
    if (executed && executed.rule_content) {
      navigator.clipboard.writeText(executed.rule_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">bolt</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">SOAR Automated Response Orchestrator</h2>
            <p className="text-xs text-slate-400">Target Entity: <span className="font-mono text-cyan-400 font-bold">{target || "185.199.108.153"}</span></p>
          </div>
        </div>

        {!executed ? (
          <>
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2 uppercase tracking-wider">Select SOAR Playbook Action</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {actions.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setActionType(act.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      actionType === act.id
                        ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg'
                        : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-xs font-bold text-cyan-300">{act.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{act.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleExecute}
                disabled={loading}
                className="px-5 py-2 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>{loading ? "Triggering SOAR..." : "Execute Action"}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center space-x-3">
              <span className="material-symbols-outlined text-[28px] text-emerald-400 flex-shrink-0">check_circle</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">SOAR Execution Successful</h4>
                <p className="text-xs text-slate-300">{executed.details}</p>
              </div>
            </div>

            {executed.rule_content && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Generated Rule Definition</span>
                  <button onClick={handleCopyRule} className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">{copied ? "done" : "content_copy"}</span>
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-400 bg-slate-900 p-2.5 rounded overflow-x-auto">
                  {executed.rule_content}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={onClose} className="px-5 py-2 text-xs font-bold bg-cyan-400 text-slate-950 rounded-lg hover:bg-cyan-300 transition-colors cursor-pointer">
                Done & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOARActionModal;
