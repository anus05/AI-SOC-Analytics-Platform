import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./soc.db"

engine_args = {}
if DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def auto_migrate():
    """
    Automatic column migration for existing PostgreSQL / SQLite tables
    to prevent UndefinedColumn runtime errors.
    """
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        if "alerts" in tables:
            existing_cols = [c["name"] for c in inspector.get_columns("alerts")]
            columns_to_add = [
                ("destination_ip", "VARCHAR(50) DEFAULT '10.0.0.1'"),
                ("confidence", "FLOAT DEFAULT 85.0"),
                ("host_name", "VARCHAR(150) DEFAULT 'server-01.corp.internal'"),
                ("rule_name", "VARCHAR(150) DEFAULT 'Custom Analytics Rule'"),
                ("ml_probability", "FLOAT DEFAULT 0.0"),
                ("fp_probability", "FLOAT DEFAULT 0.0"),
                ("explainability_json", "TEXT DEFAULT '{}'"),
            ]
            with engine.connect() as conn:
                for col_name, col_type in columns_to_add:
                    if col_name not in existing_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE alerts ADD COLUMN {col_name} {col_type}"))
                            conn.commit()
                            print(f"[+] Migrated missing column 'alerts.{col_name}'")
                        except Exception as ex:
                            print(f"[!] Migration warning for column {col_name}: {ex}")

        if "threat_intelligence" in tables:
            existing_cols = [c["name"] for c in inspector.get_columns("threat_intelligence")]
            columns_to_add = [
                ("latitude", "FLOAT DEFAULT 0.0"),
                ("longitude", "FLOAT DEFAULT 0.0"),
            ]
            with engine.connect() as conn:
                for col_name, col_type in columns_to_add:
                    if col_name not in existing_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE threat_intelligence ADD COLUMN {col_name} {col_type}"))
                            conn.commit()
                            print(f"[+] Migrated missing column 'threat_intelligence.{col_name}'")
                        except Exception as ex:
                            print(f"[!] Migration warning for column {col_name}: {ex}")

        if "incident_reports" in tables:
            existing_cols = [c["name"] for c in inspector.get_columns("incident_reports")]
            if "docx_path" not in existing_cols:
                with engine.connect() as conn:
                    try:
                        conn.execute(text("ALTER TABLE incident_reports ADD COLUMN docx_path VARCHAR(300)"))
                        conn.commit()
                        print("[+] Migrated missing column 'incident_reports.docx_path'")
                    except Exception as ex:
                        print(f"[!] Migration warning: {ex}")
    except Exception as e:
        print(f"[!] Auto migration error: {e}")