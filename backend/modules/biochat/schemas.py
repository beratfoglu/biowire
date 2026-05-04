from pydantic import BaseModel
from typing import List, Optional

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class MessageSend(BaseModel):
    session_id: str
    message: str
    symptoms: List[str]
    severity: float
    duration_days: int
    regions: List[str] = []
    gender: str = "other"
    language: str = "en"

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: str

class MessageResponse(BaseModel):
    message: str
    urgency_score: float
    urgency_level: str
    recommended_specialist: str
    secondary_specialist: Optional[str] = None
    red_flag: bool = False
    red_flag_reason: Optional[str] = None
    cancer_warning: bool = False
    cancer_warning_reason: Optional[str] = None
    combination_triggered: bool = False
    combination_name: Optional[str] = None
    calibration_questions: List[str] = []
    explanation: str = ""
    session_id: str