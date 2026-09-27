import unittest
import os
from datetime import datetime, timezone, timedelta

from backend.detectors.brute_force import BruteForceDetector
from backend.detectors.password_spray import PasswordSprayDetector
from backend.detectors.port_scan import PortScanDetector
from backend.detectors.impossible_travel import ImpossibleTravelDetector
from backend.parser.log_parser import parse_file, parse_content
from backend.services.detection_service import DetectionService


class TestRealDetectors(unittest.TestCase):

    def setUp(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.sample_logs_dir = os.path.join(self.base_dir, "sample_logs")

    def test_brute_force_detector_positive(self):
        detector = BruteForceDetector(threshold=5, window_seconds=120)
        t0 = datetime(2026, 9, 26, 12, 0, 0, tzinfo=timezone.utc)
        logs = [
            {"ip": "198.51.100.42", "user": "root", "status": "Failed", "datetime": t0 + timedelta(seconds=i * 10), "destination": "auth.corp.internal"}
            for i in range(6)
        ]
        alerts = detector.detect(logs)
        self.assertEqual(len(alerts), 1)
        alert = alerts[0]
        self.assertEqual(alert.attack, "Brute Force")
        self.assertEqual(alert.ip, "198.51.100.42")
        self.assertEqual(alert.failed_attempts, 6)
        self.assertGreaterEqual(alert.threat_score, 50)
        self.assertIn(alert.severity, ["MEDIUM", "HIGH", "CRITICAL"])

    def test_brute_force_detector_negative_under_threshold(self):
        detector = BruteForceDetector(threshold=5, window_seconds=120)
        t0 = datetime(2026, 9, 26, 12, 0, 0, tzinfo=timezone.utc)
        logs = [
            {"ip": "198.51.100.42", "user": "root", "status": "Failed", "datetime": t0 + timedelta(seconds=i * 10)}
            for i in range(3)  # Only 3 attempts (under threshold of 5)
        ]
        alerts = detector.detect(logs)
        self.assertEqual(len(alerts), 0)

    def test_brute_force_detector_negative_spread_out_time(self):
        detector = BruteForceDetector(threshold=5, window_seconds=120)
        t0 = datetime(2026, 9, 26, 12, 0, 0, tzinfo=timezone.utc)
        # 5 failures, but spaced 200 seconds apart (outside 120s window)
        logs = [
            {"ip": "198.51.100.42", "user": "root", "status": "Failed", "datetime": t0 + timedelta(seconds=i * 200)}
            for i in range(5)
        ]
        alerts = detector.detect(logs)
        self.assertEqual(len(alerts), 0)

    def test_password_spray_detector_positive(self):
        detector = PasswordSprayDetector(threshold=3, window_seconds=300)
        t0 = datetime(2026, 9, 26, 12, 0, 0, tzinfo=timezone.utc)
        users = ["admin", "svc_backup", "jdoe", "finance_user"]
        logs = [
            {"ip": "203.0.113.88", "user": u, "status": "Failed", "datetime": t0 + timedelta(seconds=i * 15), "destination": "auth.corp.internal"}
            for i, u in enumerate(users)
        ]
        alerts = detector.detect(logs)
        self.assertEqual(len(alerts), 1)
        alert = alerts[0]
        self.assertEqual(alert.attack, "Password Spray")
        self.assertEqual(alert.ip, "203.0.113.88")
        self.assertEqual(alert.failed_attempts, 4)
        self.assertGreaterEqual(alert.threat_score, 60)

    def test_password_spray_detector_negative_same_user(self):
        detector = PasswordSprayDetector(threshold=3, window_seconds=300)
        t0 = datetime(2026, 9, 26, 12, 0, 0, tzinfo=timezone.utc)
        # Single user targeted repeatedly is brute force, NOT password spray
        logs = [
            {"ip": "203.0.113.88", "user": "admin", "status": "Failed", "datetime": t0 + timedelta(seconds=i * 10)}
            for i in range(5)
        ]
        alerts = detector.detect(logs)
        self.assertEqual(len(alerts), 0)

    def test_port_scan_detector_positive(self):
        detector = PortScanDetector(threshold=5, window_seconds=120)
        t0 = datetime(2026, 9, 26, 12, 0, 0, tzinfo=timezone.utc)
        ports = [21, 22, 23, 80, 443, 445, 8080]
        logs = [
            {"ip": "198.51.100.99", "port": p, "datetime": t0 + timedelta(seconds=i * 2), "destination": "web.corp.internal"}
            for i, p in enumerate(ports)
        ]
        alerts = detector.detect(logs)
        self.assertEqual(len(alerts), 1)
        alert = alerts[0]
        self.assertEqual(alert.attack, "Port Scan")
        self.assertEqual(alert.ip, "198.51.100.99")
        self.assertGreaterEqual(alert.threat_score, 50)

    def test_impossible_travel_detector_positive(self):
        detector = ImpossibleTravelDetector(max_speed_kmh=900.0)
        t0 = datetime(2026, 9, 26, 12, 0, 0, tzinfo=timezone.utc)
        # Login 1: New York (lat 40.71, lon -74.00)
        # Login 2: Tokyo (lat 35.67, lon 139.65) 15 minutes later (dist ~10,800 km in 0.25h = 43,200 km/h)
        logs = [
            {
                "user": "alice",
                "ip": "198.51.100.5",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "city": "New York",
                "country": "United States",
                "datetime": t0,
                "status": "Success"
            },
            {
                "user": "alice",
                "ip": "52.192.1.20",
                "latitude": 35.6762,
                "longitude": 139.6503,
                "city": "Tokyo",
                "country": "Japan",
                "datetime": t0 + timedelta(minutes=15),
                "status": "Success"
            }
        ]
        alerts = detector.detect(logs)
        self.assertEqual(len(alerts), 1)
        alert = alerts[0]
        self.assertEqual(alert.attack, "Impossible Travel")
        self.assertEqual(alert.user, "alice")
        self.assertGreaterEqual(alert.threat_score, 75)

    def test_impossible_travel_detector_negative_plausible_travel(self):
        detector = ImpossibleTravelDetector(max_speed_kmh=900.0)
        t0 = datetime(2026, 9, 26, 12, 0, 0, tzinfo=timezone.utc)
        # Distance ~350 km (e.g. NYC to Boston) across 5 hours = 70 km/h (plausible train/car travel)
        logs = [
            {
                "user": "alice",
                "ip": "198.51.100.5",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "datetime": t0,
                "status": "Success"
            },
            {
                "user": "alice",
                "ip": "198.51.100.6",
                "latitude": 42.3601,
                "longitude": -71.0589,
                "datetime": t0 + timedelta(hours=5),
                "status": "Success"
            }
        ]
        alerts = detector.detect(logs)
        self.assertEqual(len(alerts), 0)

    def test_sample_log_files_ingestion(self):
        detection_service = DetectionService()

        # 1. Test sample brute force log file
        bf_path = os.path.join(self.sample_logs_dir, "brute_force_test.log")
        bf_events = parse_file(bf_path)
        bf_alerts = detection_service.detect(bf_events)
        self.assertTrue(any(a.attack == "Brute Force" for a in bf_alerts))

        # 2. Test sample password spray log file
        ps_path = os.path.join(self.sample_logs_dir, "password_spray_test.log")
        ps_events = parse_file(ps_path)
        ps_alerts = detection_service.detect(ps_events)
        self.assertTrue(any(a.attack == "Password Spray" for a in ps_alerts))

        # 3. Test sample port scan CSV file
        port_path = os.path.join(self.sample_logs_dir, "port_scan_test.csv")
        port_events = parse_file(port_path)
        port_alerts = detection_service.detect(port_events)
        self.assertTrue(any(a.attack == "Port Scan" for a in port_alerts))

        # 4. Test sample impossible travel JSON file
        it_path = os.path.join(self.sample_logs_dir, "impossible_travel_test.json")
        it_events = parse_file(it_path)
        it_alerts = detection_service.detect(it_events)
        self.assertTrue(any(a.attack == "Impossible Travel" for a in it_alerts))

        # 5. Test clean traffic log (must yield 0 alerts!)
        clean_path = os.path.join(self.sample_logs_dir, "clean_system_traffic.log")
        clean_events = parse_file(clean_path)
        clean_alerts = detection_service.detect(clean_events)
        self.assertEqual(len(clean_alerts), 0, "Clean traffic must yield 0 alerts!")


from fastapi.testclient import TestClient
from backend.main import app
from backend.auth.auth import get_current_user
from backend.database.models import User


class TestAPIRoutesHonestTelemetry(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Override auth dependency for tests
        app.dependency_overrides[get_current_user] = lambda: User(id=1, username="test_analyst", email="test@socvigil.net", role="admin")
        cls.client = TestClient(app)
        cls.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        cls.sample_logs_dir = os.path.join(cls.base_dir, "sample_logs")

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()

    def test_clear_alerts_and_clean_dashboard(self):
        # Clear alerts
        res = self.client.post("/alerts/clear")
        self.assertEqual(res.status_code, 200)

        # Get dashboard - verify honest 0 metrics
        dash = self.client.get("/dashboard")
        self.assertEqual(dash.status_code, 200)
        data = dash.json()
        self.assertEqual(data["totalAlerts"], 0)
        self.assertEqual(data["criticalAlerts"], 0)
        self.assertEqual(data["highAlerts"], 0)
        self.assertEqual(data["avgThreatScore"], 0)
        self.assertEqual(len(data["recentAlerts"]), 0)

    def test_upload_sample_logs_and_clean_traffic(self):
        # Upload clean traffic -> 0 alerts
        clean_path = os.path.join(self.sample_logs_dir, "clean_system_traffic.log")
        with open(clean_path, "rb") as f:
            res_clean = self.client.post("/upload-logs", files={"file": ("clean_system_traffic.log", f, "text/plain")})
        self.assertEqual(res_clean.status_code, 200)
        self.assertEqual(res_clean.json()["alerts_generated"], 0)

        # Upload brute force test log -> genuine alert generated
        bf_path = os.path.join(self.sample_logs_dir, "brute_force_test.log")
        with open(bf_path, "rb") as f:
            res_bf = self.client.post("/upload-logs", files={"file": ("brute_force_test.log", f, "text/plain")})
        self.assertEqual(res_bf.status_code, 200)
        self.assertGreaterEqual(res_bf.json()["alerts_generated"], 1)

        # Dashboard now reflects the genuine alert
        dash = self.client.get("/dashboard")
        self.assertEqual(dash.status_code, 200)
        self.assertGreaterEqual(dash.json()["totalAlerts"], 1)

        # Cleanup
        self.client.post("/alerts/clear")

    def test_brute_force_mixed_events_e2e(self):
        # 1. Reset database
        self.client.post("/alerts/clear")

        # 2. Upload test_brute_force.log with 6 attack events and 2 benign events
        test_file = os.path.join(self.sample_logs_dir, "test_brute_force.log")
        with open(test_file, "rb") as f:
            res = self.client.post("/upload-logs", files={"file": ("test_brute_force.log", f, "text/plain")})

        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["parsed_events_count"], 8)
        self.assertEqual(data["alerts_generated"], 1)  # EXACTLY 1 alert, NOT 6, NOT 0

        alert_info = data["alerts"][0]
        self.assertEqual(alert_info["attack"], "Brute Force")
        self.assertEqual(alert_info["ip"], "203.0.113.7")
        self.assertEqual(alert_info["severity"], "MEDIUM")
        self.assertEqual(alert_info["score"], 66)

        # 3. Check dashboard state
        dash = self.client.get("/dashboard")
        self.assertEqual(dash.status_code, 200)
        dash_data = dash.json()
        self.assertEqual(dash_data["totalAlerts"], 1)
        self.assertEqual(dash_data["avgThreatScore"], 66.0)
        self.assertEqual(dash_data["topAttackType"], "Brute Force")
        self.assertEqual(len(dash_data["recentAlerts"]), 1)
        self.assertEqual(dash_data["recentAlerts"][0]["technique"], "T1110")
        self.assertEqual(dash_data["recentAlerts"][0]["username"], "admin")

        # 4. Clean up after test
        self.client.post("/alerts/clear")


if __name__ == "__main__":
    unittest.main()
