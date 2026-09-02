from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.auth.auth import get_current_user
from backend.schemas.soc_schemas import SOARActionRequest
from backend.services.soar_service import SOARService

router = APIRouter(prefix="/soar", tags=["SOAR Automation"])
soar_service = SOARService()


@router.post("/execute")
def execute_soar_action(
    payload: SOARActionRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return soar_service.execute_action(
        db=db,
        action_type=payload.action_type,
        target=payload.target,
        alert_id=payload.alert_id,
        parameters=payload.parameters
    )


@router.get("/logs")
def get_soar_action_logs(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return soar_service.list_logs(db)
