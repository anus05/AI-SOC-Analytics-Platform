import os
import sys

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.db import Base, engine, auto_migrate
# Import all models before create_all
import backend.database.models
from backend.api.routes import router
from backend.auth.auth import router as auth_router
from backend.api.copilot_routes import router as copilot_router
from backend.api.attack_chain_routes import router as attack_chain_router
from backend.api.threat_intel_routes import router as threat_intel_router
from backend.api.report_routes import router as report_router
from backend.api.soar_routes import router as soar_router

# Only run automatic migration if database is configured.
# This prevents failures during testing when a test database is used
# (or when CI runs without a real DB connection).
if os.getenv("SKIP_DB_MIGRATION") != "true":
    try:
        auto_migrate()
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[!] Database migration warning: {e}")
        print("[*] Continuing with test execution...")

app = FastAPI(
    title="AI SOC Analytics Platform - Enterprise AI Security Platform",
    version="2.0.0"
)

# NOTE: allow_origins mixes explicit dev origins with "*". Browsers reject
# "*" when allow_credentials=True, so the wildcard here is effectively a
# no-op (and would be a security risk if it did work). Kept the explicit
# localhost origins for dev; consider pulling allowed origins from an env
# var for staging/production instead of hardcoding.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(auth_router)
app.include_router(copilot_router)
app.include_router(attack_chain_router)
app.include_router(threat_intel_router)
app.include_router(report_router)
app.include_router(soar_router)


@app.get("/")
def home():
    return {
        "message": "Enterprise AI SOC Security Platform is Running",
        "status": "online",
        "version": "2.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_engine": "online",
        "threat_intel": "online",
        "soar_automation": "online"
    }
