from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.database.crud import (
    create_user,
    get_user_by_username,
    get_user,
)

from backend.auth.schemas import (
    RegisterRequest,
    LoginRequest,
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


# ---------------- Register ----------------

@router.post("/register")
def register(
    user: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing = get_user_by_username(
        db,
        user.username,
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    new_user = create_user(
        db,
        user.username,
        user.email,
        hash_password(user.password),
        user.role
    )

    return {
        "message": "User registered successfully",
        "username": new_user.username,
    }


# ---------------- Login ----------------

@router.post("/login")
def login(
    user: LoginRequest,
    db: Session = Depends(get_db),
):
    db_user = get_user_by_username(
        db,
        user.username,
    )

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    if not verify_password(
        user.password,
        db_user.password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    token = create_access_token(
        {
            "sub": db_user.username,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# ---------------- Current User ----------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = verify_token(credentials.credentials)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    return payload
@router.get("/me")
def me(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_user(
        db,
        current_user["sub"]
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    }

# ---------------- Admin Only ----------------

def admin_required(
    current_user=Depends(get_current_user),
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user