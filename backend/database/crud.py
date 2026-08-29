from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database.models import AlertDB

from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from backend.database.models import User
from sqlalchemy import func


def create_user(
    db,
    username,
    email,
    password,
    role,
):
    user = User(
        username=username,
        email=email,
        password=password,
        role=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def get_user_by_username(
    db: Session,
    username: str
):
    return (
        db.query(User)
        .filter(User.username == username)
        .first()
    )
def get_user(
    db: Session,
    username: str
):
    return (
        db.query(User)
        .filter(User.username == username)
        .first()
    )
def save_alert(db: Session, alert):

    db_alert = AlertDB(
        attack=alert.attack,
        source_ip=alert.ip,
        failed_attempts=alert.failed_attempts,
        threat_score=alert.threat_score,
        severity=alert.severity,
        technique=alert.mitre["technique"]
    )

    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)

    return db_alert


def get_alerts(db: Session):

    return db.query(AlertDB).all()


def get_statistics(db: Session):

    total = db.query(AlertDB).count()

    critical = db.query(AlertDB).filter(
        AlertDB.severity == "CRITICAL"
    ).count()

    high = db.query(AlertDB).filter(
        AlertDB.severity == "HIGH"
    ).count()

    medium = db.query(AlertDB).filter(
        AlertDB.severity == "MEDIUM"
    ).count()

    low = db.query(AlertDB).filter(
        AlertDB.severity == "LOW"
    ).count()

    return {
        "total_alerts": total,
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low
    }
def get_dashboard(db):

    latest = (
        db.query(AlertDB)
        .order_by(desc(AlertDB.created_at))
        .first()
    )

    top_ip = (
        db.query(
            AlertDB.source_ip,
            func.count(AlertDB.id).label("count")
        )
        .group_by(AlertDB.source_ip)
        .order_by(desc("count"))
        .first()
    )

    total = db.query(AlertDB).count()

    return {
        "latest_attack": latest.attack if latest else None,
        "latest_severity": latest.severity if latest else None,
        "top_ip": top_ip[0] if top_ip else None,
        "total_alerts": total
    }
def get_alert(db: Session, alert_id: int):
    return (
        db.query(AlertDB)
        .filter(AlertDB.id == alert_id)
        .first()
    )
def filter_alerts(
    db: Session,
    severity: str = None,
    attack: str = None,
    source_ip: str = None,
):
    query = db.query(AlertDB)

    if severity:
        query = query.filter(AlertDB.severity == severity)

    if attack:
        query = query.filter(AlertDB.attack == attack)

    if source_ip:
        query = query.filter(AlertDB.source_ip == source_ip)

    return query.all()
def get_alerts_paginated(
    db: Session,
    page: int = 1,
    size: int = 10
):
    offset = (page - 1) * size

    alerts = (
        db.query(AlertDB)
        .offset(offset)
        .limit(size)
        .all()
    )

    total = db.query(AlertDB).count()

    return {
        "page": page,
        "size": size,
        "total": total,
        "total_pages": (total + size - 1) // size,
        "alerts": alerts
    }
def attack_distribution(db: Session):

    data = (
        db.query(
            AlertDB.attack,
            func.count(AlertDB.id).label("count")
        )
        .group_by(AlertDB.attack)
        .all()
    )

    return [
        {
            "attack": attack,
            "count": count
        }
        for attack, count in data
    ]