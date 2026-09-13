import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database.db import Base, get_db
from backend.auth.auth_db import AuthBase, get_auth_db
from backend.parser.log_parser import parse_single_line
from backend.services.detection_service import DetectionService
from backend.services.explainable_scoring import ExplainableScoringService
from backend.services.soar_service import SOARService

# Main DB mock
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# Auth DB mock
test_auth_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingAuthSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_auth_engine)
AuthBase.metadata.create_all(bind=test_auth_engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_get_auth_db():
    try:
        db = TestingAuthSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_auth_db] = override_get_auth_db
client = TestClient(app)


class TestPlatformFeatures(unittest.TestCase):

    def test_home_endpoint(self):
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "online")

    def test_health_endpoint(self):
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_log_parser_ssh(self):
        line = "Failed password for invalid user root from 185.199.108.153 port 22 ssh2"
        res = parse_single_line(line)
        self.assertIsNotNone(res)
        self.assertEqual(res["status"], "Failed")
        self.assertEqual(res["ip"], "185.199.108.153")

    def test_detection_service(self):
        service = DetectionService()
        logs = [
            {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "sudo su root", "time": "2026-09-02 02:00:00"},
            {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "vssadmin delete shadows", "time": "2026-09-02 02:00:00"},
            {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "mimikatz sekurlsa::logonpasswords", "time": "2026-09-02 02:00:00"},
            {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "powershell -enc AAAA==", "time": "2026-09-02 02:00:00"},
            {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "psexec \\\\10.0.0.1", "time": "2026-09-02 02:00:00"}
        ]
        alerts = service.detect(logs)
        self.assertGreaterEqual(len(alerts), 3)
        attacks = [a.attack for a in alerts]
        self.assertTrue(
            "Privilege Escalation" in attacks
            or "Ransomware Behaviour" in attacks
            or "Credential Dumping" in attacks
        )

    def test_explainable_scoring(self):
        class DummyAlert:
            attack = "Password Spray"
            source_ip = "185.199.108.153"
            severity = "HIGH"
            failed_attempts = 12
            user_account = "svc_deploy"
            destination = "auth.prod.internal"
            technique = "T1110.003"
            threat_score = 90
            ml_probability = 0.94
            confidence = 94.0
            fp_probability = 0.06

        scorer = ExplainableScoringService()
        res = scorer.explain_score(DummyAlert())
        self.assertGreaterEqual(res["score"], 80)
        self.assertGreaterEqual(len(res["factors"]), 4)

    def test_soar_service(self):
        soar = SOARService()
        db = TestingSessionLocal()
        res = soar.execute_action(db, "block_ip", "185.199.108.153")
        self.assertEqual(res["status"], "Success")
        self.assertIn("185.199.108.153", res["details"])
        db.close()

    def test_google_login_endpoint(self):
        response = client.post(
            "/auth/google",
            json={
                "email": "test.google@socvigil.net",
                "name": "Google Test User",
                "google_id": "google-test-12345",
                "picture": "https://example.com/avatar.png"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertEqual(data["user"]["email"], "test.google@socvigil.net")
        self.assertEqual(data["user"]["google_sub"], "google-test-12345")

        token = data["access_token"]
        me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_resp.status_code, 200)
        me_data = me_resp.json()
        self.assertEqual(me_data["email"], "test.google@socvigil.net")
        self.assertEqual(me_data["google_sub"], "google-test-12345")


if __name__ == "__main__":
    unittest.main()
