from core.database import get_supabase_client
from core.exceptions import NotFoundError, ServerError
from modules.health.schemas import (
    ProfileUpdate, VitalSign, SymptomLog,
    Medication, VaccineRecord, DoctorVisit,
    SleepLog, ExerciseLog
)
from datetime import datetime

async def get_profile(user_id: str) -> dict:
    client = get_supabase_client()
    try:
        response = client.table("profiles").select("*").eq("id", user_id).single().execute()
        if not response.data:
            raise NotFoundError("Profile not found")
        return response.data
    except NotFoundError:
        raise
    except Exception as e:
        raise ServerError(str(e))

async def update_profile(user_id: str, data: ProfileUpdate) -> dict:
    client = get_supabase_client()
    try:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        response = client.table("profiles").update(update_data).eq("id", user_id).execute()
        return response.data[0]
    except Exception as e:
        raise ServerError(str(e))

async def add_vital_sign(user_id: str, data: VitalSign) -> dict:
    client = get_supabase_client()
    try:
        response = client.table("vital_signs").insert({
            "user_id": user_id,
            "type": data.type,
            "value": data.value,
            "unit": data.unit,
            "measured_at": data.measured_at.isoformat() if data.measured_at else datetime.utcnow().isoformat(),
            "notes": data.notes,
        }).execute()
        return response.data[0]
    except Exception as e:
        raise ServerError(str(e))

async def get_vital_signs(user_id: str, type: str = None) -> list:
    client = get_supabase_client()
    try:
        query = client.table("vital_signs").select("*").eq("user_id", user_id)
        if type:
            query = query.eq("type", type)
        response = query.order("measured_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise ServerError(str(e))

async def add_symptom_log(user_id: str, data: SymptomLog) -> dict:
    client = get_supabase_client()
    try:
        response = client.table("symptom_logs").insert({
            "user_id": user_id,
            "symptoms": data.symptoms,
            "severity": data.severity,
            "body_region": data.body_region,
            "notes": data.notes,
            "logged_at": data.logged_at.isoformat() if data.logged_at else datetime.utcnow().isoformat(),
        }).execute()
        return response.data[0]
    except Exception as e:
        raise ServerError(str(e))

async def get_symptom_logs(user_id: str) -> list:
    client = get_supabase_client()
    try:
        response = client.table("symptom_logs").select("*").eq("user_id", user_id).order("logged_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise ServerError(str(e))

async def add_medication(user_id: str, data: Medication) -> dict:
    client = get_supabase_client()
    try:
        response = client.table("medications").insert({
            "user_id": user_id,
            **data.model_dump()
        }).execute()
        return response.data[0]
    except Exception as e:
        raise ServerError(str(e))

async def get_medications(user_id: str) -> list:
    client = get_supabase_client()
    try:
        response = client.table("medications").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise ServerError(str(e))

async def add_vaccine(user_id: str, data: VaccineRecord) -> dict:
    client = get_supabase_client()
    try:
        response = client.table("vaccine_records").insert({
            "user_id": user_id,
            **data.model_dump()
        }).execute()
        return response.data[0]
    except Exception as e:
        raise ServerError(str(e))

async def get_vaccines(user_id: str) -> list:
    client = get_supabase_client()
    try:
        response = client.table("vaccine_records").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise ServerError(str(e))

async def add_doctor_visit(user_id: str, data: DoctorVisit) -> dict:
    client = get_supabase_client()
    try:
        response = client.table("doctor_visits").insert({
            "user_id": user_id,
            **data.model_dump()
        }).execute()
        return response.data[0]
    except Exception as e:
        raise ServerError(str(e))

async def get_doctor_visits(user_id: str) -> list:
    client = get_supabase_client()
    try:
        response = client.table("doctor_visits").select("*").eq("user_id", user_id).order("visit_date", desc=True).execute()
        return response.data
    except Exception as e:
        raise ServerError(str(e))

async def add_sleep_log(user_id: str, data: SleepLog) -> dict:
    client = get_supabase_client()
    try:
        response = client.table("sleep_logs").insert({
            "user_id": user_id,
            **data.model_dump()
        }).execute()
        return response.data[0]
    except Exception as e:
        raise ServerError(str(e))

async def add_exercise_log(user_id: str, data: ExerciseLog) -> dict:
    client = get_supabase_client()
    try:
        response = client.table("exercise_logs").insert({
            "user_id": user_id,
            **data.model_dump()
        }).execute()
        return response.data[0]
    except Exception as e:
        raise ServerError(str(e))