from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.auth.auth import get_current_user
from backend.services.threat_intelligence import ThreatIntelligenceService

router = APIRouter(prefix="/api/threat-intel", tags=["Threat Intelligence Enrichment"])
threat_intel_service = ThreatIntelligenceService()


@router.get("/lookup/{ip_address}")
def lookup_ip_threat_intel(
    ip_address: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not ip_address:
        raise HTTPException(status_code=400, detail="IP address parameter required.")
    return threat_intel_service.get_or_enrich_ip(db, ip_address)


@router.get("")
def list_threat_intel(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return threat_intel_service.list_threat_intel(db)
