from typing import Optional
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    username: Optional[str] = None
    role: str = "analyst"


class LoginRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str


class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None
    id_token: Optional[str] = None
    token: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    google_id: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[dict] = None


class StatusUpdateRequest(BaseModel):
    status: str