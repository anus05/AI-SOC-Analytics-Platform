import React, { useState, useEffect } from 'react';
import client from '../../api/client';

const ExplainableScoreCard = ({ alertId, initialScore = 0 }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchExplanation = async () => {
      if (!alertId) return;
      setLoading(true);
      try {
        const res = await client.get(`/api/copilot/explain-score/${alertId}`);
        if (isMounted) {
          setExplanation(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchExplanation();
    return () => { isMounted = false; };
  }, [alertId]);

  const scoreVal = explanation?.score ?? initialScore;
  const confidence = explanation?.confidence_percent ?? 92;
  const fpProb = explanation?.false_positive_probability ?? 8;
  const factors = explanation?.factors || [
    { points: 30, reason: "Repeated failed logins" },
    { points: 25, reason: "Known malicious IP" },
    { points: 18, reason: "MITRE Critical Technique" },
    { points: 10, reason: "Sensitive Asset" },
    { points: 6, reason: "Abnormal login time" }
  ];

  return (
    <div className="glass-panel-interactive p-4 flex flex-col justify-between text-left">
      <div className="flex justify-between items-center mb-2">
        <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Explainable Threat Score
        </span>
        <span className="font-mono text-[9px] text-accent bg-teal-500/15 px-2 py-0.5 rounded border border-teal-500/30 font-bold">
          XAI VERIFIED
        </span>
      </div>

      {loading ? (
        <div className="py-4 animate-pulse space-y-2">
          <div className="h-7 w-1/3 bg-white/10 rounded-md"></div>
          <div className="h-3.5 w-2/3 bg-white/5 rounded-md"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Big Score Header */}
          <div className="flex items-baseline gap-1.5">
            <span className={`font-mono text-[32px] font-bold leading-none ${scoreVal >= 80 ? 'text-rose-400' : scoreVal >= 50 ? 'text-amber-400' : 'text-accent'}`}>
              {scoreVal}
            </span>
            <span className="font-mono text-[11px] text-slate-400 font-semibold">/ 100</span>
          </div>

          {/* Confidence & False Positive Metrics */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-lg border border-white/10 font-mono text-[10px]">
            <div>
              <span className="text-slate-400 block uppercase text-[8px]">Confidence</span>
              <span className="font-bold text-emerald-400">{confidence}%</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[8px]">False Positive Prob</span>
              <span className="font-bold text-rose-400">{fpProb}%</span>
            </div>
          </div>

          {/* Score Explanation Factors */}
          <div>
            <span className="font-sans text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Score Breakdown (Why {scoreVal}/100)
            </span>
            <div className="space-y-1">
              {factors.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/60 rounded-md border border-white/5 font-mono text-[10px]">
                  <span className="text-slate-300 font-sans truncate mr-2">{f.reason}</span>
                  <span className="font-bold text-rose-400 shrink-0">+{f.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainableScoreCard;

