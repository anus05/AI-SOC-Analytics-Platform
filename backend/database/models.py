from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, JSON
from sqlalchemy.sql import func
from backend.database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default="analyst")


class AlertDB(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    attack = Column(String(100), nullable=False)
    source_ip = Column(String(50), nullable=False, index=True)
    destination_ip = Column(String(50), default="10.0.0.1", index=True)
    failed_attempts = Column(Integer, default=0)
    threat_score = Column(Integer, default=0)
    severity = Column(String(20), default="LOW", index=True)
    confidence = Column(Float, default=85.0)
    technique = Column(String(100), default="Unknown")
    status = Column(String(50), default="New", index=True)
    user_account = Column(String(100), default="Unknown", index=True)
    destination = Column(String(200), default="auth.internal.corp")
    host_name = Column(String(150), default="server-01.corp.internal")
    rule_name = Column(String(150), default="Custom Analytics Rule")
    ml_probability = Column(Float, default=0.0)
    fp_probability = Column(Float, default=0.0)
    explainability_json = Column(Text, default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class LogEventDB(Base):
    __tablename__ = "log_events"

    id = Column(Integer, primary_key=True, index=True)
    log_type = Column(String(50), default="generic", index=True)
    source_format = Column(String(50), default="txt")
    source_ip = Column(String(50), nullable=True, index=True)
    destination_ip = Column(String(50), nullable=True)
    user = Column(String(100), nullable=True, index=True)
    host = Column(String(150), nullable=True)
    action = Column(String(100), nullable=True)
    status = Column(String(50), nullable=True)
    process_name = Column(String(200), nullable=True)
    raw_message = Column(Text, nullable=False)
    parsed_json = Column(Text, default="{}")
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class SOARActionLogDB(Base):
    __tablename__ = "soar_action_logs"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    action_type = Column(String(100), nullable=False)
    target = Column(String(200), nullable=False)
    status = Column(String(50), default="Success")
    details = Column(Text, default="")
    executed_by = Column(String(100), default="SOAR Automation")
    executed_at = Column(DateTime(timezone=True), server_default=func.now())


class AssetDB(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    ip_address = Column(String(50), unique=True, nullable=False)
    asset_type = Column(String(50), default="Server")  # Server, Workstation, Firewall, Router
    criticality = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    owner = Column(String(100), default="IT Dept")
    status = Column(String(50), default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AttackChainDB(Base):
    __tablename__ = "attack_chains"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    root_ip = Column(String(50), nullable=False, index=True)
    user_account = Column(String(100), default="Unknown")
    threat_score = Column(Integer, default=0)
    status = Column(String(50), default="Active")
    nodes = Column(Text, nullable=False)  # JSON string of attack nodes/stages
    edges = Column(Text, nullable=False)  # JSON string of attack links/connections
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ThreatIntelDB(Base):
    __tablename__ = "threat_intelligence"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(50), unique=True, nullable=False, index=True)
    country = Column(String(100), default="Unknown")
    city = Column(String(100), default="Unknown")
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    asn = Column(String(100), default="AS-UNKNOWN")
    organization = Column(String(200), default="Unknown ISP")
    reverse_dns = Column(String(200), default="N/A")
    abuse_score = Column(Integer, default=0)
    is_malicious = Column(Boolean, default=False)
    is_vpn = Column(Boolean, default=False)
    is_tor = Column(Boolean, default=False)
    cloud_provider = Column(String(100), default="None")
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    malware_families = Column(Text, default="[]")  # JSON string list
    reputation_badge = Column(String(20), default="UNKNOWN")  # SAFE, SUSPICIOUS, MALICIOUS, UNKNOWN
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class IncidentReportDB(Base):
    __tablename__ = "incident_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(250), nullable=False)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    executive_summary = Column(Text, nullable=False)
    timeline = Column(Text, default="[]")  # JSON string
    affected_systems = Column(Text, default="[]")  # JSON string
    mitre_mapping = Column(Text, default="[]")  # JSON string
    iocs = Column(Text, default="[]")  # JSON string
    attack_chain = Column(Text, default="{}")  # JSON string
    threat_intel = Column(Text, default="{}")  # JSON string
    ai_analysis = Column(Text, default="")
    business_impact = Column(Text, default="")
    risk_score = Column(Integer, default=50)
    recommended_response = Column(Text, default="{}")  # JSON string
    pdf_path = Column(String(300), nullable=True)
    docx_path = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AIAnalysisDB(Base):
    __tablename__ = "ai_analysis"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), unique=True, nullable=False)
    summary = Column(Text, nullable=False)
    what_happened = Column(Text, nullable=False)
    why_happened = Column(Text, nullable=False)
    attacker_goal = Column(Text, nullable=False)
    affected_assets = Column(Text, default="[]")  # JSON string
    recommended_mitigation = Column(Text, default="[]")  # JSON string
    recommended_playbook = Column(Text, default="[]")  # JSON string
    confidence_score = Column(Float, default=95.0)
    analyst_summary = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InvestigationNoteDB(Base):
    __tablename__ = "investigation_notes"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False)
    author = Column(String(100), default="SOC Analyst")
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())