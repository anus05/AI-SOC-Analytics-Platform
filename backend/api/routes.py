from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.parser.log_parser import parse_file
from backend.services.detection_service import DetectionService

from backend.auth.auth import (
    get_current_user,
    admin_required,
)

from backend.database.crud import (
    save_alert,
    get_statistics,
    get_dashboard,
    get_alert,
    filter_alerts,
    get_alerts_paginated,
    attack_distribution,
)
router = APIRouter()
service = DetectionService()


# -------------------- Scan Logs --------------------

@router.post("/scan")
def scan_logs(
    current_user=Depends(admin_required),
    db: Session = Depends(get_db)
):
    logs = parse_file("logs/auth.log")

    alerts = service.detect(logs)

    for alert in alerts:
        save_alert(db, alert)

    return {
        "message": "Scan Completed",
        "alerts_found": len(alerts)
    }

# -------------------- Get Alerts --------------------

@router.get("/alerts")
def alerts(
    current_user=Depends(admin_required),
    severity: str | None = Query(default=None),
    attack: str | None = Query(default=None),
    source_ip: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    if severity or attack or source_ip:
        return filter_alerts(
            db,
            severity,
            attack,
            source_ip
        )

    return get_alerts_paginated(
        db,
        page,
        size
    )

# -------------------- Statistics --------------------

@router.get("/statistics")
def statistics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_statistics(db)


# -------------------- Dashboard --------------------



@router.get("/dashboard")
def dashboard(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_dashboard(db)

# -------------------- Alert Details --------------------

@router.get("/alerts/{alert_id}")
def alert_details(
    alert_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = get_alert(db, alert_id)

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return alert
@router.get("/dashboard/attacks")
def dashboard_attacks(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return attack_distribution(db)