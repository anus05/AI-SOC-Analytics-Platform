import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.database.db import Base, get_db
from backend.parser.log_parser import parse_single_line, parse_content
from backend.services.detection_service import DetectionService
from backend.services.ml_service import MLService
from backend.services.explainable_scoring import ExplainableScoringService
from backend.services.soar_service import SOARService

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_soc.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_home_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_log_parser_ssh():
    line = "Failed password for invalid user root from 185.199.108.153 port 22 ssh2"
    res = parse_single_line(line)
    assert res is not None
    assert res["status"] == "Failed"
    assert res["ip"] == "185.199.108.153"


def test_detection_service():
    service = DetectionService()
    logs = [
        {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "sudo su root", "time": "2026-09-02 02:00:00"},
        {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "vssadmin delete shadows", "time": "2026-09-02 02:00:00"},
        {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "mimikatz sekurlsa::logonpasswords", "time": "2026-09-02 02:00:00"},
        {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "powershell -enc AAAA==", "time": "2026-09-02 02:00:00"},
        {"status": "Failed", "ip": "185.199.108.153", "user": "admin", "raw": "psexec \\\\10.0.0.1", "time": "2026-09-02 02:00:00"}
    ]
    alerts = service.detect(logs)
    assert len(alerts) >= 3
    attacks = [a.attack for a in alerts]
    assert "Privilege Escalation" in attacks or "Ransomware Behaviour" in attacks or "Credential Dumping" in attacks


def test_explainable_scoring():
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
    assert res["score"] >= 80
    assert len(res["factors"]) >= 4


def test_soar_service():
    soar = SOARService()
    db = TestingSessionLocal()
    res = soar.execute_action(db, "block_ip", "185.199.108.153")
    assert res["status"] == "Success"
    assert "185.199.108.153" in res["details"]
    db.close()
