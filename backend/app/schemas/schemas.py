from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional

# Auth schemas
class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# Application schemas
class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=100)
    role: str = Field(min_length=1, max_length=150)
    jd_url: Optional[str] = None
    status: str = "saved"
    notes: Optional[str] = None
    applied_at: Optional[date] = None

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    jd_url: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_at: Optional[date] = None

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    company: str
    role: str
    jd_url: Optional[str]
    status: str
    notes: Optional[str]
    applied_at: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True

# AI schemas
class MatchRequest(BaseModel):
    resume_text: str = Field(min_length=50, max_length=5000)
    jd_text: str = Field(min_length=50, max_length=5000)
    application_id: Optional[str] = None

class RewriteRequest(BaseModel):
    resume_summary: str = Field(min_length=20, max_length=1000)
    jd_text: str = Field(min_length=50, max_length=5000)

class MatchResponse(BaseModel):
    id: str
    score: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    recommendation: str
    created_at: datetime

    class Config:
        from_attributes = True

class RewriteResponse(BaseModel):
    rewritten_summary: str

class RewriteFullRequest(BaseModel):
    resume_text: str = Field(min_length=50, max_length=8000)
    jd_text: str = Field(min_length=50, max_length=5000)
    missing_keywords: list[str] = []

class RewriteFullResponse(BaseModel):
    rewritten_resume: dict

class AiAnalysisResponse(BaseModel):
    id: str
    application_id: Optional[str]
    score: Optional[int]
    matched_keywords: Optional[list[str]]
    missing_keywords: Optional[list[str]]
    recommendation: Optional[str]
    rewritten_summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
