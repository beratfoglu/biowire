import httpx
from modules.feed.schemas import NewsArticle
from core.config import settings
from typing import List

NEWSAPI_URL = "https://newsapi.org/v2/top-headlines"

async def fetch_newsapi_news() -> List[NewsArticle]:
    if not settings.NEWSAPI_KEY:
        return []

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(NEWSAPI_URL, params={
                "category": "health",
                "language": "en",
                "pageSize": 10,
                "apiKey": settings.NEWSAPI_KEY,
            })
            data = response.json()

            articles = []
            for item in data.get("articles", []):
                title = item.get("title", "").strip()
                if title and title != "[Removed]":
                    articles.append(NewsArticle(
                        title=title,
                        summary=item.get("description", "")[:200] if item.get("description") else None,
                        url=item.get("url"),
                        source=item.get("source", {}).get("name", "NewsAPI"),
                        category="Health News",
                        published_at=item.get("publishedAt"),
                        image_url=item.get("urlToImage"),
                    ))

            return articles

    except Exception:
        return []