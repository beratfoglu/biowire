import httpx
from modules.feed.schemas import NewsArticle
from typing import List

PUBMED_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_FETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"

async def fetch_pubmed_news() -> List[NewsArticle]:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Güncel sağlık araştırmalarını ara
            search_response = await client.get(PUBMED_SEARCH_URL, params={
                "db": "pubmed",
                "term": "health[title] OR medicine[title]",
                "retmax": 10,
                "sort": "date",
                "retmode": "json",
            })
            search_data = search_response.json()
            ids = search_data.get("esearchresult", {}).get("idlist", [])

            if not ids:
                return []

            # Detayları getir
            fetch_response = await client.get(PUBMED_FETCH_URL, params={
                "db": "pubmed",
                "id": ",".join(ids),
                "retmode": "json",
            })
            fetch_data = fetch_response.json()
            result = fetch_data.get("result", {})

            articles = []
            for uid in ids:
                item = result.get(uid, {})
                title = item.get("title", "").strip()
                pub_date = item.get("pubdate", "")
                source = item.get("source", "PubMed")

                if title:
                    articles.append(NewsArticle(
                        title=title,
                        summary=f"Published in {source}",
                        url=f"https://pubmed.ncbi.nlm.nih.gov/{uid}/",
                        source="PubMed",
                        category="Research",
                        published_at=pub_date,
                    ))

            return articles

    except Exception:
        return []