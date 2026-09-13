import os
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base, sessionmaker

# Locate backend/database/login.db relative to backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
DB_DIR = BACKEND_DIR / "database"
DB_DIR.mkdir(parents=True, exist_ok=True)
AUTH_DB_PATH = DB_DIR / "login.db"

AUTH_DATABASE_URL = os.getenv("AUTH_DATABASE_URL", f"sqlite:///{AUTH_DB_PATH.as_posix()}")

auth_engine_args = {}
if AUTH_DATABASE_URL.startswith("sqlite"):
    auth_engine_args["connect_args"] = {"check_same_thread": False}

auth_engine = create_engine(AUTH_DATABASE_URL, **auth_engine_args)

AuthSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=auth_engine
)

AuthBase = declarative_base()


class AuthUser(AuthBase):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # NULL for Google-only accounts
    auth_provider = Column(String, nullable=False, default="local")  # 'local' or 'google'
    google_sub = Column(String, unique=True, nullable=True, index=True)
    role = Column(String, default="analyst")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PasswordResetToken(AuthBase):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


def init_auth_db():
    """Ensure login.db tables exist."""
    AuthBase.metadata.create_all(bind=auth_engine)


def get_auth_db():
    db = AuthSessionLocal()
    try:
        yield db
    finally:
        db.close()
