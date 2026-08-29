from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from backend.database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="analyst"
    )


class AlertDB(Base):
    __tablename__ = "alerts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    attack = Column(
        String(100),
        nullable=False
    )

    source_ip = Column(
        String(50),
        nullable=False
    )

    failed_attempts = Column(
        Integer
    )

    threat_score = Column(
        Integer
    )

    severity = Column(
        String(20)
    )

    technique = Column(
        String(20)
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )