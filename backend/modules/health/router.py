from fastapi import APIRouter, Header
from typing import Optional
from modules.health.schemas import (
    ProfileUpdate, VitalSign, SymptomLog,
    Medication, VaccineRecord, DoctorVisit,
    SleepLog, ExerciseLog
)
from modules.health.service import (
    get_profile, update_profile,
    add_vital_sign, get_vital_signs,
    add_symptom_log, get_symptom_logs,
    add_medication, get_medications,
    add_vaccine, get_vaccines,
    add_doctor_visit, get_doctor_visits,
    add_sleep_log, add_exercise_log
)
from jose import jwt
from core.config import settings
from core.exceptions import UnauthorizedError

router = APIRouter(prefix="/health", tags=["Health"])

def get_user_id(authorization: str) -> str:
    # Authorization header'dan JWT token'ı çözüp user_id'yi alıyor
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except Exception:
        raise UnauthorizedError()

@router.get("/profile")
async def profile_get(authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await get_profile(user_id)

@router.put("/profile")
async def profile_update(data: ProfileUpdate, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await update_profile(user_id, data)

@router.post("/vitals")
async def vitals_add(data: VitalSign, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await add_vital_sign(user_id, data)

@router.get("/vitals")
async def vitals_get(type: Optional[str] = None, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await get_vital_signs(user_id, type)

@router.post("/symptoms")
async def symptoms_add(data: SymptomLog, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await add_symptom_log(user_id, data)

@router.get("/symptoms")
async def symptoms_get(authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await get_symptom_logs(user_id)

@router.post("/medications")
async def medications_add(data: Medication, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await add_medication(user_id, data)

@router.get("/medications")
async def medications_get(authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await get_medications(user_id)

@router.post("/vaccines")
async def vaccines_add(data: VaccineRecord, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await add_vaccine(user_id, data)

@router.get("/vaccines")
async def vaccines_get(authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await get_vaccines(user_id)

@router.post("/doctor-visits")
async def doctor_visits_add(data: DoctorVisit, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await add_doctor_visit(user_id, data)

@router.get("/doctor-visits")
async def doctor_visits_get(authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await get_doctor_visits(user_id)

@router.post("/sleep")
async def sleep_add(data: SleepLog, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await add_sleep_log(user_id, data)

@router.post("/exercise")
async def exercise_add(data: ExerciseLog, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await add_exercise_log(user_id, data)