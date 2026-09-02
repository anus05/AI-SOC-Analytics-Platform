from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.database.models import AlertDB
from backend.auth.auth import get_current_user
from backend.services.ai_copilot import AICopilotService
from backend.services.explainable_scoring import ExplainableScoringService

router = APIRouter(prefix="/api/copilot", tags=["AI Investigation Copilot"])
copilot_service = AICopilotService()
scoring_service = ExplainableScoringService()


@router.post("/investigate/{alert_id}")
def investigate_alert(
    alert_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(AlertDB).filter(AlertDB.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert #{alert_id} not found.")

    res = copilot_service.investigate_alert(db, alert)
    return res


@router.get("/explain-score/{alert_id}")
def explain_threat_score(
    alert_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(AlertDB).filter(AlertDB.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert #{alert_id} not found.")

    return scoring_service.explain_score(alert)


@router.get("/analysis/{alert_id}")
def get_analysis(
    alert_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(AlertDB).filter(AlertDB.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert #{alert_id} not found.")

    return copilot_service.investigate_alert(db, alert)
