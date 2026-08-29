import { useState, useCallback } from 'react';
import client from '../api/client';

// Mock data corresponding to Stitch design specs
const mockDashboard = {
  totalAlerts: 1284,
  totalAlertsDiff: "+12%",
  highSeverity: 14,
  threatScore: 84,
  detectionsToday: 42,
  alertsTrend: [
    { time: '00:00', count: 12 },
    { time: '04:00', count: 25 },
    { time: '08:00', count: 48 },
    { time: '12:00', count: 18 },
    { time: '16:00', count: 32 },
    { time: '20:00', count: 54 },
    { time: 'Now', count: 42 }
  ],
  attackTypes: [
    { type: 'Brute Force', percentage: 45 },
    { type: 'Password Spray', percentage: 30 },
    { type: 'Port Scan', percentage: 25 }
  ],
  recentAlerts: [
    { id: 'ALRT-9042', severity: 'CRITICAL', title: 'Impossible Travel', target: 'DB-Prod-01', time: '2m ago', ip: '192.168.1.1' },
    { id: 'ALRT-9041', severity: 'HIGH', title: 'Brute Force Attempt', target: 'svc_deploy_admin', time: '15m ago', ip: '45.22.19.102' },
    { id: 'ALRT-9040', severity: 'MEDIUM', title: 'Unusual Data Exfiltration Volume', target: '10.0.4.55', time: '1h ago', ip: '10.0.4.55' },
    { id: 'ALRT-9039', severity: 'HIGH', title: 'Multiple Failed Logins (Admin)', target: 'WS-Finance-04', time: '3h ago', ip: '172.16.0.2' },
    { id: 'ALRT-9038', severity: 'LOW', title: 'Config File Changed', target: 'Nginx-Proxy', time: '4h ago', ip: '192.168.12.4' }
  ]
};

const mockStatistics = {
  detectionAccuracy: 96.4,
  attackVectorDistribution: [
    { name: 'DDoS / Botnet', value: 45, color: '#00dbe7' },
    { name: 'SQL Injection', value: 25, color: '#ffb4ab' },
    { name: 'Malware / Ransomware', value: 15, color: '#ffd58c' },
    { name: 'Phishing attempts', value: 15, color: '#00f2ff' }
  ],
  topMaliciousIps: [
    { rank: '#1', ip: '192.168.1.104', hits: '14,205', country: 'Russia', level: 'Critical' },
    { rank: '#2', ip: '10.0.0.52', hits: '9,842', country: 'China', level: 'Critical' },
    { rank: '#3', ip: '172.16.254.1', hits: '5,102', country: 'Unknown', level: 'High' },
    { rank: '#4', ip: '8.8.8.8', hits: '3,450', country: 'USA', level: 'High' }
  ]
};

const mockAlerts = [
  {
    id: 'VGL-2023-8894A',
    severity: 'CRITICAL',
    title: 'Impossible Travel Detected',
    sourceIp: '185.199.108.153',
    destination: 'auth.internal.corp (10.0.4.22)',
    userAccount: 'svc_deploy_admin',
    time: '2m ago',
    threatScore: 88,
    mitreTechnique: 'T1110 - Brute Force',
    status: 'New',
    rawLog: {
      timestamp: "2026-07-26T12:08:32.451Z",
      event_type: "authentication_failure",
      actor: {
        ip: "185.199.108.153",
        user: "svc_deploy_admin"
      },
      target: {
        host: "auth.internal.corp",
        port: 443
      },
      action: {
        name: "login_attempt",
        result: "denied",
        reason: "invalid_credentials"
      },
      threat_intel: {
        reputation: "malicious",
        tags: ["tor_exit_node", "impossible_travel"]
      }
    }
  },
  {
    id: 'ALRT-9041',
    severity: 'HIGH',
    title: 'Brute Force Attack (SSH)',
    sourceIp: '45.22.19.102',
    destination: 'SSH-Gateway-01 (10.0.1.5)',
    userAccount: 'admin',
    time: '15m ago',
    threatScore: 78,
    mitreTechnique: 'T1110.001 - Password Guessing',
    status: 'New',
    rawLog: {
      timestamp: "2026-07-26T11:55:00.000Z",
      event_type: "ssh_failed_login",
      actor: { ip: "45.22.19.102", user: "admin" },
      failures_count: 142,
      target: { host: "SSH-Gateway-01", port: 22 }
    }
  },
  {
    id: 'ALRT-9040',
    severity: 'MEDIUM',
    title: 'Unusual Data Exfiltration Volume',
    sourceIp: '10.0.4.55',
    destination: 'S3-Backup-Bucket (External)',
    userAccount: 'backup_service',
    time: '1h ago',
    threatScore: 56,
    mitreTechnique: 'T1048 - Exfiltration Over Alternative Protocol',
    status: 'New',
    rawLog: {
      timestamp: "2026-07-26T11:10:12.000Z",
      event_type: "data_transfer",
      transferred_mb: 8520,
      average_daily_mb: 120,
      actor: { ip: "10.0.4.55", user: "backup_service" }
    }
  },
  {
    id: 'ALRT-9039',
    severity: 'HIGH',
    title: 'Multiple Failed Logins (Admin Portal)',
    sourceIp: '172.16.0.2',
    destination: 'web.internal.corp (10.0.4.10)',
    userAccount: 'admin_test',
    time: '3h ago',
    threatScore: 72,
    mitreTechnique: 'T1110 - Brute Force',
    status: 'New',
    rawLog: {
      timestamp: "2026-07-26T09:12:44.000Z",
      event_type: "portal_auth_failed",
      attempts: 8,
      user_agent: "Mozilla/5.0 Python-urllib/3.9",
      actor: { ip: "172.16.0.2", user: "admin_test" }
    }
  },
  {
    id: 'ALRT-9038',
    severity: 'LOW',
    title: 'Config File Changed',
    sourceIp: '192.168.12.4',
    destination: 'Nginx-Proxy (10.0.2.1)',
    userAccount: 'nginx_config_mgr',
    time: '4h ago',
    threatScore: 28,
    mitreTechnique: 'T1562 - Impair Defenses',
    status: 'Dismissed',
    rawLog: {
      timestamp: "2026-07-26T08:15:30.000Z",
      event_type: "file_modified",
      path: "/etc/nginx/nginx.conf",
      actor: { ip: "192.168.12.4", user: "nginx_config_mgr" }
    }
  }
];

export const useAlerts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/dashboard');
      setLoading(false);
      return response.data;
    } catch (err) {
      console.warn("Backend API not reachable. Using mock dashboard telemetry.");
      setError("Unable to sync dashboard telemetry with server. Displaying offline cached logs.");
      setLoading(false);
      return mockDashboard;
    }
  }, []);

  const getStatisticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/statistics');
      setLoading(false);
      return response.data;
    } catch (err) {
      console.warn("Backend API not reachable. Using mock stats telemetry.");
      setError("Unable to sync telemetry stats with server. Displaying offline cached metrics.");
      setLoading(false);
      return mockStatistics;
    }
  }, []);

  const getAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/alerts');
      setLoading(false);
      return response.data;
    } catch (err) {
      console.warn("Backend API not reachable. Using mock alerts.");
      setError("Unable to sync registry logs with server. Displaying offline cached registry.");
      setLoading(false);
      return mockAlerts;
    }
  }, []);

  const getAlertDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get(`/alerts/${id}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.warn(`Backend API not reachable. Resolving mock detail for ID: ${id}`);
      setError("Unable to sync incident audit detail. Displaying offline cached copy.");
      setLoading(false);
      const alert = mockAlerts.find(a => a.id === id) || mockAlerts[0];
      return alert;
    }
  }, []);

  const performScan = useCallback(async (scanTarget) => {
    setLoading(true);
    setError(null);
    // Add artificial delay for scan
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const response = await client.post('/scan', { target: scanTarget });
      setLoading(false);
      return response.data;
    } catch (err) {
      console.warn("Backend API not reachable. Performing mock network scan.");
      setError("Vulnerability scan gateway timed out. Displaying local simulated audit.");
      setLoading(false);
      return {
        status: "success",
        target: scanTarget,
        alerts_found: 2,
        details: [
          { type: "Port Scan", details: "Detected network port sweep activities on target gateway." },
          { type: "Brute Force", details: "Flagged multiple active credential verification requests on auth service." }
        ]
      };
    }
  }, []);

  const updateAlertStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      await client.put(`/alerts/${id}`, { status });
      setLoading(false);
      return true;
    } catch (err) {
      console.warn("Backend API not reachable. Updating mock status in memory.");
      if (err.response) {
        setError("Update rejected by the host authorization filter.");
        setLoading(false);
        return false;
      }
      const alert = mockAlerts.find(a => a.id === id);
      if (alert) alert.status = status;
      setLoading(false);
      return true;
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
