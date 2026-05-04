from pydantic import BaseModel
from typing import Optional, List

class NewsArticle(BaseModel):
    title: str
    summary: Optional[str] = None
    url: Optional[str] = None
    source: str
    category: Optional[str] = None
    published_at: Optional[str] = None
    image_url: Optional[str] = None

class FeedResponse(BaseModel):
    articles: List[NewsArticle]
    total: int
    source: str