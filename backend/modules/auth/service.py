from supabase import Client
from core.database import get_supabase_client
from core.exceptions import UnauthorizedError, ServerError
from modules.auth.schemas import UserRegister, UserLogin, TokenResponse
from jose import jwt
from datetime import datetime, timedelta
from core.config import settings

def create_access_token(user_id: str, email: str) -> str:
    # JWT token oluşturur — kullanıcı her istekte bunu gönderir
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def register_user(data: UserRegister) -> TokenResponse:
    client: Client = get_supabase_client()
    try:
        # Supabase Auth ile kullanıcı oluştur
        auth_response = client.auth.sign_up({
            "email": data.email,
            "password": data.password,
        })

        if not auth_response.user:
            raise ServerError("Registration failed")

        user_id = auth_response.user.id

        # Kullanıcı profil bilgilerini profiles tablosuna kaydet
        client.table("profiles").insert({
            "id": user_id,
            "email": data.email,
            "full_name": data.full_name,
            "birth_date": data.birth_date,
            "gender": data.gender,
            "height": data.height,
            "weight": data.weight,
            "blood_type": data.blood_type,
        }).execute()

        token = create_access_token(user_id, data.email)

        return TokenResponse(
            access_token=token,
            user_id=user_id,
            email=data.email,
            full_name=data.full_name
        )

    except Exception as e:
        raise ServerError(str(e))

async def login_user(data: UserLogin) -> TokenResponse:
    client: Client = get_supabase_client()
    try:
        # Supabase Auth ile giriş yap
        auth_response = client.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })

        if not auth_response.user:
            raise UnauthorizedError("Invalid email or password")

        user_id = auth_response.user.id

        # Profil bilgilerini çek
        profile = client.table("profiles").select("*").eq("id", user_id).single().execute()

        token = create_access_token(user_id, data.email)

        return TokenResponse(
            access_token=token,
            user_id=user_id,
            email=data.email,
            full_name=profile.data.get("full_name", "")
        )

    except UnauthorizedError:
        raise
    except Exception as e:
        raise ServerError(str(e))