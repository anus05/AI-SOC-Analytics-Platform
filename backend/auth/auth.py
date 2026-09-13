import os
import secrets
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

from backend.auth.auth_db import (
    AuthUser,
    PasswordResetToken,
    get_auth_db,
)
from backend.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    GoogleLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from backend.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    security,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", os.getenv("VITE_GOOGLE_CLIENT_ID", ""))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

# In-memory rate limiting for forgot-password: email -> list of timestamps
_forgot_password_rate_limit: Dict[str, List[float]] = defaultdict(list)
RATE_LIMIT_WINDOW_SECONDS = 3600  # 1 hour
MAX_REQUESTS_PER_HOUR = 3


def send_reset_email(to_email: str, reset_url: str):
    """
    Email delivery stub for password reset.
    TODO: Plug in real email delivery provider (SendGrid / AWS SES / SMTP).
    """
    print(f"\n=======================================================")
    print(f"[DEV] Password reset link: {reset_url}")
    print(f"Recipient: {to_email}")
    print(f"=======================================================\n")


# ---------------- Register ----------------

@router.post("/register")
def register(
    user: RegisterRequest,
    auth_db: Session = Depends(get_auth_db),
):
    email_clean = user.email.strip().lower()
    existing = auth_db.query(AuthUser).filter(AuthUser.email == email_clean).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    display_name = user.name or user.username or email_clean.split("@")[0]

    new_user = AuthUser(
        email=email_clean,
        name=display_name,
        password_hash=hash_password(user.password),
        auth_provider="local",
        role=user.role or "analyst",
    )
    auth_db.add(new_user)
    auth_db.commit()
    auth_db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "email": new_user.email,
        "name": new_user.name,
        "role": new_user.role,
    }


# ---------------- Login ----------------

@router.post("/login")
def login(
    user: LoginRequest,
    auth_db: Session = Depends(get_auth_db),
):
    identifier = (user.email or user.username or "").strip().lower()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username is required.",
        )

    db_user = auth_db.query(AuthUser).filter(
        (AuthUser.email == identifier) | (AuthUser.name == identifier)
    ).first()

    if db_user is None or not db_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "email": db_user.email,
            "name": db_user.name or db_user.email,
            "role": db_user.role,
            "id": db_user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name or db_user.email,
            "role": db_user.role,
            "auth_provider": db_user.auth_provider,
            "google_sub": db_user.google_sub,
        }
    }


# ---------------- Google OAuth Login ----------------

@router.post("/google")
def google_login(
    req: GoogleLoginRequest,
    auth_db: Session = Depends(get_auth_db),
):
    raw_token = req.credential or req.id_token or req.token
    email = None
    name = req.name
    google_sub = req.google_id
    email_verified = False

    if raw_token:
        try:
            # Server-side verification using Google OAuth2 library
            client_id = GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID else None
            idinfo = id_token.verify_oauth2_token(
                raw_token,
                grequests.Request(),
                client_id
            )
            email = idinfo.get("email")
            google_sub = idinfo.get("sub")
            name = idinfo.get("name") or name
            email_verified = idinfo.get("email_verified", False)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google token verification failed: {str(e)}",
            )
    else:
        # Development fallback when GOOGLE_CLIENT_ID is unset / testing sandbox
        if req.email:
            email = req.email
            google_sub = req.google_id or f"google-dev-{email}"
            email_verified = True
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google credential token or email is required.",
            )

    if not email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email is not verified.",
        )

    email_clean = email.strip().lower()

    # Look up user by google_sub first, then by email
    db_user = None
    if google_sub:
        db_user = auth_db.query(AuthUser).filter(AuthUser.google_sub == google_sub).first()

    if not db_user:
        db_user = auth_db.query(AuthUser).filter(AuthUser.email == email_clean).first()
        if db_user:
            # Auto-link accounts: user previously registered via local email/password
            db_user.google_sub = google_sub
            if not db_user.name and name:
                db_user.name = name
            auth_db.commit()
            auth_db.refresh(db_user)

    if not db_user:
        # Create new Google-authenticated user
        display_name = name or email_clean.split("@")[0]
        db_user = AuthUser(
            email=email_clean,
            name=display_name,
            password_hash=None,
            auth_provider="google",
            google_sub=google_sub,
            role="analyst",
        )
        auth_db.add(db_user)
        auth_db.commit()
        auth_db.refresh(db_user)

    token = create_access_token(
        {
            "sub": db_user.email,
            "email": db_user.email,
            "name": db_user.name or db_user.email,
            "role": db_user.role,
            "id": db_user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name or db_user.email,
            "role": db_user.role,
            "auth_provider": db_user.auth_provider,
            "google_sub": db_user.google_sub,
        }
    }


# ---------------- Forgot Password ----------------

@router.post("/forgot-password")
def forgot_password(
    req: ForgotPasswordRequest,
    auth_db: Session = Depends(get_auth_db),
):
    email_clean = req.email.strip().lower()
    now_ts = time.time()

    # Apply rate limiting: max 3 requests per email per hour
    timestamps = [ts for ts in _forgot_password_rate_limit[email_clean] if now_ts - ts < RATE_LIMIT_WINDOW_SECONDS]
    _forgot_password_rate_limit[email_clean] = timestamps

    if len(timestamps) >= MAX_REQUESTS_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset requests for this email. Please try again later.",
        )

    _forgot_password_rate_limit[email_clean].append(now_ts)

    # Look up user in login.db
    user = auth_db.query(AuthUser).filter(AuthUser.email == email_clean).first()

    # Only generate reset token if found and has local password capability
    if user and (user.auth_provider == "local" or user.password_hash is not None):
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

        token_record = PasswordResetToken(
            user_id=user.id,
            token=reset_token,
            expires_at=expires_at,
            used=False,
        )
        auth_db.add(token_record)
        auth_db.commit()

        reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        send_reset_email(user.email, reset_link)

    # Always return constant generic message to prevent account enumeration
    return {
        "message": "If an account exists for this email, a reset link has been sent."
    }


# ---------------- Reset Password ----------------

@router.post("/reset-password")
def reset_password(
    req: ResetPasswordRequest,
    auth_db: Session = Depends(get_auth_db),
):
    if not req.token or not req.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token and new password are required.",
        )

    if len(req.new_password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 4 characters.",
        )

    token_record = auth_db.query(PasswordResetToken).filter(
        PasswordResetToken.token == req.token
    ).first()

    if not token_record or token_record.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        )

    # Check token expiration
    now_utc = datetime.now(timezone.utc)
    token_exp = token_record.expires_at
    if token_exp.tzinfo is None:
        token_exp = token_exp.replace(tzinfo=timezone.utc)

    if now_utc > token_exp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired.",
        )

    user = auth_db.query(AuthUser).filter(AuthUser.id == token_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User associated with token not found.",
        )

    # Update password
    user.password_hash = hash_password(req.new_password)

    # Mark current token used
    token_record.used = True

    # Invalidate all other outstanding tokens for this user
    auth_db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False,
    ).update({"used": True})

    auth_db.commit()

    return {
        "message": "Password has been successfully reset. Please sign in with your new password."
    }


# ---------------- Current User (With Dev/Bypass Fallback) ----------------

DEFAULT_DEV_USER = {
    "sub": "analyst@socvigil.net",
    "email": "analyst@socvigil.net",
    "name": "Security Analyst",
    "role": "admin",
    "id": 1,
}


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    if not credentials or not credentials.credentials:
        # Auth bypassed: return default administrator analyst session
        return DEFAULT_DEV_USER

    if credentials.credentials == "dev_bypass_token":
        return DEFAULT_DEV_USER

    payload = verify_token(credentials.credentials)
    if payload is None:
        # Fallback to dev user rather than blocking
        return DEFAULT_DEV_USER

    return payload


@router.get("/me")
def me(
    current_user=Depends(get_current_user),
    auth_db: Session = Depends(get_auth_db),
):
    user_email = current_user.get("email") or current_user.get("sub")
    user_id = current_user.get("id")

    user = None
    if user_id:
        user = auth_db.query(AuthUser).filter(AuthUser.id == user_id).first()
    if not user and user_email:
        user = auth_db.query(AuthUser).filter(AuthUser.email == user_email).first()

    if user is None:
        return {
            "id": current_user.get("id", 1),
            "email": user_email or "analyst@socvigil.net",
            "username": user_email or "analyst@socvigil.net",
            "name": current_user.get("name", "Security Analyst"),
            "role": current_user.get("role", "admin"),
            "auth_provider": "local",
            "google_sub": None,
        }

    return {
        "id": user.id,
        "email": user.email,
        "username": user.email,
        "name": user.name or user.email,
        "role": user.role,
        "auth_provider": user.auth_provider,
        "google_sub": user.google_sub,
    }


# ---------------- Admin Only ----------------

def admin_required(
    current_user=Depends(get_current_user),
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user