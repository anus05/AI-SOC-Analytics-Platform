"""
===============================================================================
DEMO / DEVELOPMENT DATA SEEDING SCRIPT (EXPLICIT OPT-IN ONLY)
===============================================================================
WARNING: This script is intended strictly for offline presentation or frontend
development testing. DO NOT RUN in production or during real detection pipeline
validation, as it populates synthetic alert data.

Usage:
    python -m backend.scripts.seed_demo_data
===============================================================================
"""
import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database.db import SessionLocal
from backend.database.models import AlertDB


def seed_demo_data():
    print("[*] Starting explicit opt-in demo data seeding...")
    db = SessionLocal()
    try:
        existing_count = db.query(AlertDB).count()
        if existing_count > 0:
            print(f"[!] Database already contains {existing_count} alerts. Skipping seed to prevent duplicate contamination.")
            return

        now = datetime.now(timezone.utc)
        sample_alerts = [
            AlertDB(
                attack="Brute Force",
                source_ip="185.199.108.153",
                destination_ip="192.168.1.50",
                failed_attempts=12,
                threat_score=85,
                severity="HIGH",
                confidence=90.0,
                technique="T1110 - Brute Force",
                status="New",
                user_account="admin",
                destination="auth.internal.corp",
                host_name="auth-server-01",
                rule_name="Rolling Window Brute Force",
                ml_probability=0.88,
                fp_probability=0.05,
                explainability_json='{"factors": ["12 failed logins", "High velocity"]}',
                created_at=now - timedelta(minutes=45)
            ),
            AlertDB(
                attack="Password Spray",
                source_ip="198.51.100.44",
                destination_ip="192.168.1.10",
                failed_attempts=25,
                threat_score=78,
                severity="HIGH",
                confidence=85.0,
                technique="T1110.003 - Password Spraying",
                status="Investigating",
                user_account="multiple_users",
                destination="sso.corp.internal",
                host_name="sso-gateway-01",
                rule_name="Password Spray Across 10 Accounts",
                ml_probability=0.82,
                fp_probability=0.08,
                explainability_json='{"factors": ["Low frequency", "Multiple targets"]}',
                created_at=now - timedelta(minutes=30)
            ),
            AlertDB(
                attack="Port Scan",
                source_ip="203.0.113.199",
                destination_ip="192.168.1.1",
                failed_attempts=0,
                threat_score=45,
                severity="MEDIUM",
                confidence=95.0,
                technique="T1595 - Active Scanning",
                status="New",
                user_account="SYSTEM",
                destination="perimeter-firewall",
                host_name="fw-01.corp",
                rule_name="SYN Port Sweep",
                ml_probability=0.40,
                fp_probability=0.15,
                explainability_json='{"factors": ["50 distinct ports swept"]}',
                created_at=now - timedelta(minutes=15)
            )
        ]

        db.add_all(sample_alerts)
        db.commit()
        print(f"[+] Successfully seeded {len(sample_alerts)} demo alert records into the database.")
    except Exception as e:
        print(f"[!] Error during demo data seeding: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
