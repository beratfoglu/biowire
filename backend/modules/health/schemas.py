from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    blood_type: Optional[str] = None
    allergens: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None

class VitalSign(BaseModel):
    # Nabız, tansiyon, kan şekeri gibi ölçümler
    type: str  # "blood_pressure", "heart_rate", "blood_sugar"
    value: str  # "120/80", "72", "95"
    unit: str
    measured_at: Optional[datetime] = None
    notes: Optional[str] = None

class SymptomLog(BaseModel):
    symptoms: List[str]
    severity: int  # 1-10
    body_region: Optional[str] = None
    notes: Optional[str] = None
    logged_at: Optional[datetime] = None

class Medication(BaseModel):
    name: str
    dosage: str
    frequency: str  # "once_daily", "twice_daily" etc.
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None

class VaccineRecord(BaseModel):
    vaccine_name: str
    administered_date: str
    next_due_date: Optional[str] = None
    notes: Optional[str] = None

class DoctorVisit(BaseModel):
    doctor_name: str
    specialty: str
    visit_date: str
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None

class SleepLog(BaseModel):
    sleep_time: str
    wake_time: str
    quality: int  # 1-5
    notes: Optional[str] = None
    logged_date: Optional[str] = None

class ExerciseLog(BaseModel):
    activity_type: str
    duration_minutes: int
    intensity: str  # "low", "medium", "high"
    notes: Optional[str] = None
    logged_date: Optional[str] = None