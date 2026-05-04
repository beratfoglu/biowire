import httpx
import xml.etree.ElementTree as ET
from modules.feed.schemas import NewsArticle
from typing import List

WHO_RSS_URL = "https://www.who.int/rss-feeds/news-releases.xml"

async def fetch_who_news() -> List[NewsArticle]:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(WHO_RSS_URL)
            response.raise_for_status()

        root = ET.fromstring(response.text)
        channel = root.find('channel')
        articles = []

        for item in channel.findall('item')[:10]:
            title = item.findtext('title', '').strip()
            description = item.findtext('description', '').strip()
            link = item.findtext('link', '').strip()
            pub_date = item.findtext('pubDate', '').strip()

            if title:
                articles.append(NewsArticle(
                    title=title,
                    summary=description[:200] if description else None,
                    url=link,
                    source="WHO",
                    category="Global Health",
                    published_at=pub_date,
                ))

        return articles

    except Exception:
        return []