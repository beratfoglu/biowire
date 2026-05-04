from modules.feed.schemas import NewsArticle, FeedResponse
from modules.feed.sources.who import fetch_who_news
from modules.feed.sources.pubmed import fetch_pubmed_news
from modules.feed.sources.newsapi import fetch_newsapi_news
from modules.feed.sources.cdc import fetch_cdc_news
from typing import List, Optional
import asyncio
import random

async def get_feed(category: Optional[str] = None, limit: int = 20) -> FeedResponse:
    # Tüm kaynaklardan paralel olarak haber çek
    results = await asyncio.gather(
        fetch_who_news(),
        fetch_pubmed_news(),
        fetch_newsapi_news(),
        fetch_cdc_news(),
        return_exceptions=True
    )

    all_articles: List[NewsArticle] = []

    for result in results:
        if isinstance(result, list):
            all_articles.extend(result)

    # Kategori filtresi
    if category:
        all_articles = [a for a in all_articles if a.category and category.lower() in a.category.lower()]

    # Karıştır — farklı kaynaklardan dengeli gelsin
    random.shuffle(all_articles)

    # Limit uygula
    all_articles = all_articles[:limit]

    return FeedResponse(
        articles=all_articles,
        total=len(all_articles),
        source="WHO + PubMed + NewsAPI + CDC"
    )