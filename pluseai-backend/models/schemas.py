from pydantic import BaseModel
from typing import List, Optional

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class AnalyzeRequest(BaseModel):
    query: str
    limit: Optional[int] = 500
    platform: Optional[str] = "all"

class XquikAnalyzeRequest(BaseModel):
    query: str = "Xquik import"
    posts: List[dict]

class CompareRequest(BaseModel):
    query1: str
    query2: str

class SingleRequest(BaseModel):
    text: str

class ContactRequest(BaseModel):
    name: str
    email: str
    phone_no: str
    subject: str
    message: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = ""
