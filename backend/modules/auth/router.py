from fastapi import APIRouter
from modules.auth.schemas import UserRegister, UserLogin, TokenResponse
from modules.auth.service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister):
    # POST /auth/register — new user
    return await register_user(data)

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    # POST /auth/login — registered user
    return await login_user(data)