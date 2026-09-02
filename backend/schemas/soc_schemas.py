from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class LogIngestionRequest(BaseModel):
    source_format: str = "txt"  # csv, json, evtx, syslog, apache, nginx, defender, etc.
    raw_logs: Optional[str] = None
    target: Optional[str] = "Local Gateway"


class AlertBase(BaseModel):
    attack: str
    source_ip: str
    destination_ip: Optional[str] = "10.0.0.1"
    failed_attempts: int = 0
    threat_score: int = 0
    severity: str = "LOW"
    confidence: float = 85.0
    technique: str = "T1110 - Brute Force"
    status: str = "New"
    user_account: str = "Unknown"
    destination: str = "auth.internal.corp"
    host_name: str = "server-01.corp.internal"
    rule_name: str = "Custom Analytics Rule"
    ml_probability: float = 0.0
    fp_probability: float = 0.0
    explainability_json: Optional[str] = "{}"


class AlertResponse(AlertBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ThreatIntelRequest(BaseModel):
    query: str  # IP, CIDR, Domain, Hostname


class SOARActionRequest(BaseModel):
    alert_id: Optional[int] = None
    action_type: str  # block_ip, disable_user, kill_process, create_ticket, send_email, send_slack, send_teams, generate_yara, generate_sigma, generate_snort
    target: str
    parameters: Optional[Dict[str, Any]] = None


class IncidentReportCreateRequest(BaseModel):
    alert_id: Optional[int] = None
    title: Optional[str] = None
    format: str = "pdf"  # pdf, docx, html, md
