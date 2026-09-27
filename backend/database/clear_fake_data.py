"""
Database Alert Cleanup Utility
Truncates the fake / old alerts table so the SOC platform starts from a completely honest, clean baseline.
"""
import os
import sys

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database.db import SessionLocal, engine
from backend.database.models import AlertDB, LogEventDB
from sqlalchemy import text


def reset_alerts_table():
    print("[*] Connecting to database...")
    db = SessionLocal()
    try:
        initial_count = db.query(AlertDB).count()
        print(f"[*] Found {initial_count} existing alert rows in the database.")

        if initial_count > 0:
            deleted = db.query(AlertDB).delete()
            db.commit()
            print(f"[+] Successfully purged {deleted} fake/historical alert records.")
        else:
            print("[+] Alerts table is already clean (0 rows).")

        remaining = db.query(AlertDB).count()
        print(f"[+] Verified clean state: {remaining} alerts in database.")
    except Exception as e:
        print(f"[!] Error during alert table cleanup: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    reset_alerts_table()
