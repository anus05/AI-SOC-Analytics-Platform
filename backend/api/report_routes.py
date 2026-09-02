import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.database.models import IncidentReportDB
from backend.auth.auth import get_current_user
from backend.services.report_generator import ReportGeneratorService

router = APIRouter(prefix="/api/report", tags=["LLM Incident Report Generator"])
report_service = ReportGeneratorService()


@router.post("/generate/{alert_id}")
def generate_report(
    alert_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return report_service.generate_incident_report(db, alert_id)


@router.get("")
def list_reports(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return report_service.list_reports(db)


@router.get("/download/{report_id}")
def download_report_pdf(
    report_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(IncidentReportDB).filter(IncidentReportDB.id == report_id).first()
    if not report or not report.pdf_path or not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="Incident Report PDF document not found.")

    return FileResponse(
        path=report.pdf_path,
        filename=os.path.basename(report.pdf_path),
        media_type="application/pdf"
    )
