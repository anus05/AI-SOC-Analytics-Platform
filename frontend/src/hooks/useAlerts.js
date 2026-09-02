import { useState, useCallback } from 'react';
import client from '../api/client';

export const normalizeAlert = (raw) => {
  if (!raw) return null;
  const attackName = raw.attack || raw.detector || raw.title || 'Security Incident';
  const ipAddr = raw.source_ip || raw.sourceIp || raw.ip || '127.0.0.1';
  const scoreVal = raw.threat_score ?? raw.threatScore ?? raw.score ?? 0;
  const sevVal = (raw.severity || 'LOW').toUpperCase();
  const techVal = raw.technique || raw.mitreTechnique || 'T1110';
  const userVal = raw.username || raw.user_account || raw.userAccount || 'SYSTEM';
  const destVal = raw.destination_ip || raw.destination || raw.target || 'auth.internal.corp';
  const timeVal = raw.time || 'Recent';
  const statusVal = raw.status || 'New';

  return {
    ...raw,
    id: raw.id,
    title: attackName,
    attack: attackName,
    detector: attackName,
    sourceIp: ipAddr,
    source_ip: ipAddr,
    ip: ipAddr,
    threatScore: scoreVal,
    threat_score: scoreVal,
    score: scoreVal,
    severity: sevVal,
    mitreTechnique: techVal,
    technique: techVal,
    recommendation: raw.recommendation || 'Block malicious IP and review system logs.',
    userAccount: userVal,
    user_account: userVal,
    username: userVal,
    destination: destVal,
    destination_ip: destVal,
    target: destVal,
    time: timeVal,
    timestamp: raw.timestamp || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || new Date().toISOString(),
    status: statusVal,
    rawLog: raw.rawLog || {
      timestamp: raw.created_at || new Date().toISOString(),
      event_type: attackName.toLowerCase().replace(/\s+/g, '_'),
      actor: { ip: ipAddr, user: userVal },
      target: { host: destVal, port: 22 },
      action: { severity: sevVal, threat_score: scoreVal }
    }
  };
};

export const useAlerts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/dashboard');
      const data = response.data || {};
      setLoading(false);

      return {
        totalAlerts: data.totalAlerts ?? data.total_alerts ?? 0,
        total_alerts: data.totalAlerts ?? data.total_alerts ?? 0,
        criticalAlerts: data.criticalAlerts ?? data.critical_alerts ?? data.critical ?? 0,
        highSeverity: data.highSeverity ?? data.high_alerts ?? data.high ?? 0,
        mediumSeverity: data.medium ?? data.medium_alerts ?? 0,
        lowSeverity: data.low ?? data.low_alerts ?? 0,
        threatScore: data.threatScore ?? data.avg_threat_score ?? 0,
        detectionsToday: data.detectionsToday ?? data.today_detections ?? 0,
        topAttackType: data.topAttackType ?? data.top_attack_type ?? 'None',
        totalAlertsDiff: data.totalAlertsDiff || '0%',
        alertsTrend: Array.isArray(data.alertsTrend || data.alerts_trend)
          ? (data.alertsTrend || data.alerts_trend)
          : [],
        attackTypes: Array.isArray(data.attackTypes || data.attack_types)
          ? (data.attackTypes || data.attack_types)
          : [],
        recentAlerts: Array.isArray(data.recentAlerts || data.recent_alerts)
          ? (data.recentAlerts || data.recent_alerts).map(normalizeAlert)
          : []
      };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch real-time dashboard telemetry from PostgreSQL.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  const getStatisticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/statistics');
      const data = response.data || {};
      setLoading(false);

      return {
        totalAlerts: data.totalAlerts ?? data.total_alerts ?? 0,
        critical: data.critical ?? 0,
        high: data.high ?? 0,
        medium: data.medium ?? 0,
        low: data.low ?? 0,
        alertsBySeverity: data.alerts_by_severity || {},
        detectionAccuracy: data.detectionAccuracy ?? data.detection_accuracy ?? 0,
        attackVectorDistribution: Array.isArray(data.attackVectorDistribution || data.attack_distribution)
          ? (data.attackVectorDistribution || data.attack_distribution)
          : [],
        mitreDistribution: Array.isArray(data.mitre_distribution)
          ? data.mitre_distribution
          : [],
        topMaliciousIps: Array.isArray(data.topMaliciousIps || data.top_malicious_ips)
          ? (data.topMaliciousIps || data.top_malicious_ips)
          : [],
        dailyDetections: data.daily_detections ?? 0,
        weeklyTrend: Array.isArray(data.weekly_trend) ? data.weekly_trend : []
      };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch statistics telemetry from PostgreSQL.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  const getAlerts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.size) queryParams.append('size', params.size);
      if (params.severity && params.severity !== 'ALL') queryParams.append('severity', params.severity);
      if (params.attack) queryParams.append('attack', params.attack);
      if (params.source_ip) queryParams.append('source_ip', params.source_ip);
      if (params.search) queryParams.append('search', params.search);
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.order) queryParams.append('order', params.order);

      const url = `/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await client.get(url);
      setLoading(false);

      if (Array.isArray(response.data)) {
        return {
          alerts: response.data.map(normalizeAlert),
          total: response.data.length,
          page: 1,
          size: response.data.length,
          total_pages: 1
        };
      }

      return {
        alerts: (response.data?.alerts || []).map(normalizeAlert),
        total: response.data?.total || 0,
        page: response.data?.page || 1,
        size: response.data?.size || 10,
        total_pages: response.data?.total_pages || 1
      };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch incident log registry from PostgreSQL.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  const getAlertDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get(`/alerts/${id}`);
      setLoading(false);
      return normalizeAlert(response.data);
    } catch (err) {
      const msg = err.response?.data?.detail || `Incident alert #${id} not found in database.`;
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  const performScan = useCallback(async (scanTarget) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post('/scan', { target: scanTarget });
      setLoading(false);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Live threat auditor scan request failed.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  const updateAlertStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.put(`/alerts/${id}`, { status });
      setLoading(false);
      return normalizeAlert(response.data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update alert status in database.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  return {
    loading,
    error,
    setError,
    getDashboardData,
    getStatisticsData,
    getAlerts,
    getAlertDetail,
    performScan,
    updateAlertStatus
  };
};
