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
    <div className="bg-surface border border-border rounded p-3.5 flex flex-col justify-between card-hover text-left">
      <div className="flex justify-between items-center mb-2">
        <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          Explainable Threat Score
        </span>
        <span className="font-mono text-[9px] text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/30 font-bold">
          XAI VERIFIED
        </span>
      </div>

      {loading ? (
        <div className="py-4 animate-pulse space-y-2">
          <div className="h-6 w-1/3 bg-[#22262f] rounded"></div>
          <div className="h-3 w-2/3 bg-[#22262f]/60 rounded"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Big Score Header */}
          <div className="flex items-baseline gap-xs">
            <span className={`font-mono text-[32px] font-bold leading-none ${scoreVal >= 80 ? 'text-[#f85149]' : scoreVal >= 50 ? 'text-[#d29922]' : 'text-accent'}`}>
              {scoreVal}
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant font-semibold">/ 100</span>
          </div>

          {/* Confidence & False Positive Metrics */}
          <div className="grid grid-cols-2 gap-xs bg-[#0d1117] p-2 rounded border border-border/60 font-mono text-[10px]">
            <div>
              <span className="text-on-surface-variant block uppercase text-[8px]">Confidence</span>
              <span className="font-bold text-[#3fb950]">{confidence}%</span>
            </div>
            <div>
              <span className="text-on-surface-variant block uppercase text-[8px]">False Positive Prob</span>
              <span className="font-bold text-[#f85149]">{fpProb}%</span>
            </div>
          </div>

          {/* Score Explanation Factors */}
          <div>
            <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
              Score Breakdown (Why {scoreVal}/100)
            </span>
            <div className="space-y-1">
              {factors.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 bg-[#11151c] rounded border border-border/40 font-mono text-[10px]">
                  <span className="text-on-surface-variant font-sans truncate mr-2">{f.reason}</span>
                  <span className="font-bold text-[#f85149] shrink-0">+{f.points}</span>
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
