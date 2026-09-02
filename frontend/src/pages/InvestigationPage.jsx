import React, { useState, useEffect, useCallback } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import AICopilotPanel from '../components/copilot/AICopilotPanel';
import ExplainableScoreCard from '../components/alerts/ExplainableScoreCard';
import SeverityBadge from '../components/common/SeverityBadge';

const InvestigationPage = () => {
  const { getAlerts, loading } = useAlerts();
  const [alerts, setAlerts] = useState([]);
  const [selectedAlertId, setSelectedAlertId] = useState(null);

  const fetchAlertsList = useCallback(async () => {
    try {
      const res = await getAlerts({ page: 1, size: 20 });
      const list = res.alerts || [];
      setAlerts(list);
      if (list.length > 0 && !selectedAlertId) {
        setSelectedAlertId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [getAlerts, selectedAlertId]);

  useEffect(() => {
    fetchAlertsList();
  }, [fetchAlertsList]);

  const selectedAlert = alerts.find(a => String(a.id) === String(selectedAlertId)) || alerts[0];

  return (
    <div className="space-y-md max-w-[1600px] mx-auto w-full text-left">
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="font-sans text-[16px] font-bold text-on-surface uppercase tracking-wide">
          AI Security Investigation Workspace
        </h1>
        <p className="font-sans text-[11px] text-on-surface-variant">
          Automated LLM investigation copilot and explainable threat scoring analysis canvas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
        {/* Left Column: Selectable Alert List */}
        <div className="lg:col-span-4 bg-surface border border-border rounded overflow-hidden flex flex-col h-[650px] card-hover">
          <div className="px-3 py-2.5 bg-[#161b22]/50 border-b border-border flex justify-between items-center">
            <h2 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider">
              Select Incident to Investigate
            </h2>
            <span className="font-mono text-[9px] text-accent font-bold">
              {alerts.length} ALERTS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {loading && alerts.length === 0 ? (
              <div className="p-4 font-mono text-[11px] text-on-surface-variant text-center">
                Loading alert index...
              </div>
            ) : alerts.map((alert) => {
              const isSelected = String(alert.id) === String(selectedAlertId);
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#1f242c] border-l-2 border-accent' 
                      : 'hover:bg-[#161b22]/50 bg-surface'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[11px] font-bold text-on-surface">#{alert.id}</span>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <div className="font-sans text-[11px] font-semibold text-on-surface truncate">
                    {alert.attack}
                  </div>
                  <div className="font-mono text-[10px] text-on-surface-variant mt-1 flex justify-between">
                    <span>IP: {alert.sourceIp}</span>
                    <span className="text-accent font-bold">Score: {alert.threatScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Copilot & Explainable Scoring Canvas */}
        <div className="lg:col-span-8 space-y-md">
          {selectedAlertId ? (
            <>
              {/* Explainable Threat Score Card */}
              <ExplainableScoreCard alertId={selectedAlertId} initialScore={selectedAlert?.threatScore || 85} />

              {/* Collapsible AI Copilot Panel */}
              <AICopilotPanel alertId={selectedAlertId} />
            </>
          ) : (
            <div className="bg-surface border border-border rounded p-8 text-center font-mono text-[11px] text-on-surface-variant">
              Select an alert from the left panel to launch AI Investigation Copilot.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestigationPage;
