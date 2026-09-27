import os
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.parser.log_parser import parse_file, parse_content
from backend.services.detection_service import DetectionService
from backend.services.explainable_scoring import ExplainableScoringService
from backend.auth.schemas import StatusUpdateRequest
from backend.database.models import LogEventDB, AlertDB

from backend.auth.auth import (
    get_current_user,
    admin_required,
)

from backend.database.crud import (
    save_alert,
    clear_all_alerts,
    get_statistics,
    get_dashboard,
    get_alert,
    get_alerts_paginated,
    attack_distribution,
    update_alert_status,
)
from backend.services.windows_event_collector import WindowsEventCollector

router = APIRouter()
service = DetectionService()
scoring_service = ExplainableScoringService()


def _resolve_log_path() -> str:
    candidates = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs", "auth.log"),
        os.path.join("logs", "auth.log"),
        os.path.join("..", "logs", "auth.log"),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return "logs/auth.log"


# -------------------- Real File Drag-and-Drop Ingestion --------------------

@router.post("/upload-logs")
async def upload_logs(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8", errors="ignore")
        parsed_logs = parse_content(content_str, filename=file.filename)

        # Store parsed events inside PostgreSQL LogEventDB
        for item in parsed_logs[:100]:
            log_rec = LogEventDB(
                log_type=item.get("log_type", "generic"),
                source_format=file.filename.split(".")[-1] if "." in file.filename else "txt",
                source_ip=item.get("ip"),
                user=item.get("user"),
                action=item.get("status"),
                raw_message=item.get("raw", "")[:1000],
                parsed_json=json.dumps(item, default=str)
            )
            db.add(log_rec)
        db.commit()

        # Run Threat Detectors + ML prediction on ingested logs
        alerts = service.detect(parsed_logs)

        saved_alerts = []
        for alert in alerts:
            db_alert = save_alert(db, alert)
            saved_alerts.append(db_alert)

        return {
            "status": "success",
            "filename": file.filename,
            "parsed_events_count": len(parsed_logs),
            "alerts_generated": len(saved_alerts),
            "alerts": [
                {"id": a.id, "attack": a.attack, "ip": a.source_ip, "severity": a.severity, "score": a.threat_score}
                for a in saved_alerts
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Log parsing error: {str(e)}")


windows_collector = WindowsEventCollector()


# -------------------- Scan Logs & Live System --------------------

@router.post("/scan")
async def scan_logs(
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target = "Local Host / System Security Log"
    try:
        body = await request.json()
        if isinstance(body, dict) and "target" in body and body["target"]:
            target = body["target"]
    except Exception:
        pass

    events_to_scan = []

    # 1. Attempt genuine Windows Security Event Log collection if running on Windows
    if windows_collector.is_available():
        win_res = windows_collector.collect_events(max_records=100, lookback_minutes=1440)
        if win_res.get("events"):
            events_to_scan.extend(win_res["events"])

    # 2. Check for configured system auth logs or custom files
    log_path = _resolve_log_path()
    if os.path.exists(log_path):
        file_logs = parse_file(log_path)
        events_to_scan.extend(file_logs)

    if not events_to_scan:
        return {
            "status": "success",
            "message": "Scan completed: No security log records found to analyze.",
            "target": target,
            "alerts_found": 0,
            "details": []
        }

    # Run genuine detectors against real parsed events
    alerts = service.detect(events_to_scan)

    saved_alerts = []
    for alert in alerts:
        if target and target not in ("Local Host / System Security Log", "Local Gateway"):
            alert.destination = target
        db_alert = save_alert(db, alert)
        saved_alerts.append(db_alert)

    details = [
        {"type": a.attack, "details": f"Flagged {a.failed_attempts} events from IP {a.ip} (Severity: {a.severity}, Score: {a.threat_score})"}
        for a in alerts[:8]
    ]

    return {
        "status": "success",
        "message": f"Scan Completed: Analyzed {len(events_to_scan)} real log events.",
        "target": target,
        "alerts_found": len(alerts),
        "details": details
    }


# -------------------- Clear Alerts (Reset Fake / Old Data) --------------------

@router.post("/alerts/clear")
@router.delete("/alerts")
def clear_alerts(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Truncates/clears all alert records from the database to restore a clean state."""
    count = clear_all_alerts(db)
    return {
        "status": "success",
        "message": f"Cleared {count} alert records from the database. System telemetry reset to clean state.",
        "cleared_count": count
    }


# -------------------- Explain Threat Score --------------------

@router.get("/explain-score/{alert_id}")
def explain_threat_score(
    alert_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert_obj = db.query(AlertDB).filter(AlertDB.id == alert_id).first()
    if not alert_obj:
        raise HTTPException(status_code=404, detail="Alert not found")
    return scoring_service.explain_score(alert_obj)


# -------------------- Get Alerts --------------------

@router.get("/alerts")
def alerts(
    current_user=Depends(get_current_user),
    severity: Optional[str] = Query(default=None),
    attack: Optional[str] = Query(default=None),
    source_ip: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    sort_by: Optional[str] = Query(default="id"),
    order: Optional[str] = Query(default="desc"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    try:
        return get_alerts_paginated(
            db=db,
            page=page,
            size=size,
            severity=severity,
            attack=attack,
            source_ip=source_ip,
            search=search,
            sort_by=sort_by,
            order=order
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query alerts database: {str(e)}")


# -------------------- Alert Details --------------------

@router.get("/alerts/{alert_id}")
def alert_details(
    alert_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        alert = get_alert(db, alert_id)
        if alert is None:
            raise HTTPException(status_code=404, detail="Alert not found")
        return alert
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query alert details: {str(e)}")


# -------------------- Update Alert Status --------------------

@router.put("/alerts/{alert_id}")
def update_status(
    alert_id: int,
    payload: StatusUpdateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        updated = update_alert_status(db, alert_id, payload.status)
        if updated is None:
            raise HTTPException(status_code=404, detail="Alert not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update alert status: {str(e)}")


# -------------------- Statistics --------------------

@router.get("/statistics")
def statistics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_statistics(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query statistics: {str(e)}")


# -------------------- Dashboard --------------------

@router.get("/dashboard")
def dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_dashboard(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dashboard telemetry: {str(e)}")


@router.get("/dashboard/attacks")
def dashboard_attacks(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return attack_distribution(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query attack distribution: {str(e)}")