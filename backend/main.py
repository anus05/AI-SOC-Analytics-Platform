from fastapi import FastAPI

from backend.api.routes import router
from backend.database.db import Base, engine

# MUST import models BEFORE create_all()
from backend.database.models import AlertDB
from backend.auth.auth import router as auth_router
print(Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI SOC Analytics Platform",
    version="1.0.0"
)

app.include_router(router)
app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "message": "AI SOC Analytics Platform is Running"
    }