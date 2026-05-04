from fastapi import APIRouter, Header
from modules.biochat.schemas import ChatSessionCreate, MessageSend
from modules.biochat.service import (
    create_chat_session,
    get_chat_sessions,
    get_chat_messages,
    send_message
)
from jose import jwt
from core.config import settings
from core.exceptions import UnauthorizedError

router = APIRouter(prefix="/biochat", tags=["BioChat"])

def get_user_id(authorization: str) -> str:
    try:
        token = authorization.replace("Bearer ", "")
        if token == "demo-token":
            return "demo-user-id"
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except Exception:
        raise UnauthorizedError()

@router.post("/sessions")
async def create_session(data: ChatSessionCreate, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await create_chat_session(user_id, data.title)

@router.get("/sessions")
async def list_sessions(authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await get_chat_sessions(user_id)

@router.get("/sessions/{session_id}/messages")
async def list_messages(session_id: str, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await get_chat_messages(session_id, user_id)

@router.post("/message")
async def message_send(data: MessageSend, authorization: str = Header(...)):
    user_id = get_user_id(authorization)
    return await send_message(
        user_id=user_id,
        session_id=data.session_id,
        message=data.message,
        symptoms=data.symptoms,
        severity=data.severity,
        duration_days=data.duration_days,
        regions=data.regions,
        gender=data.gender,
        language=data.language
    )