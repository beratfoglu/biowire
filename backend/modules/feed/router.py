from fastapi import APIRouter
from typing import Optional
from modules.feed.service import get_feed

router = APIRouter(prefix="/feed", tags=["Feed"])

@router.get("/")
async def feed_get(category: Optional[str] = None, limit: int = 20):
    # Tüm kaynaklardan aggregate edilmiş haber feed'i
    return await get_feed(category=category, limit=limit)