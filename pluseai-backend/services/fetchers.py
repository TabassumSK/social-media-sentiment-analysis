import aiohttp
import asyncio
import os
import requests
from googleapiclient.discovery import build
from xpoz import XpozClient, ResponseType

XPOZ_API_KEY = os.getenv("XPOZ_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

async def fetch_newsapi(session, query, limit=30):
    try:
        url = f"https://newsapi.org/v2/everything?q={query}&language=en&pageSize={limit}&sortBy=publishedAt&apiKey={NEWS_API_KEY}"
        async with session.get(url, timeout=10) as response:
            res = await response.json()
            articles = res.get("articles", [])
            return [{
                "id": a.get("url", ""),
                "title": a.get("title", ""),
                "text": f"{a.get('title','')} {a.get('description','')}",
                "source": a.get("source", {}).get("name", "NewsAPI"),
                "url": a.get("url", ""),
                "time": a.get("publishedAt", ""),
                "type": "news"
            } for a in articles if a.get("title")]
    except Exception as e:
        print(f"NewsAPI error: {e}")
        return []

async def fetch_hackernews(session, query, limit=30):
    try:
        url = f"https://hn.algolia.com/api/v1/search?query={query}&tags=story&hitsPerPage={limit}"
        async with session.get(url, timeout=10) as response:
            res = await response.json()
            hits = res.get("hits", [])
            return [{
                "id": h.get("objectID", ""),
                "title": h.get("title", ""),
                "text": h.get("title", ""),
                "source": "HackerNews",
                "url": h.get("url", f"https://news.ycombinator.com/item?id={h.get('objectID')}"),
                "time": h.get("created_at", ""),
                "type": "hackernews"
            } for h in hits if h.get("title")]
    except Exception as e:
        print(f"HackerNews error: {e}")
        return []

# YouTube API doesn't support async naturally without extra libs, so we run it in a thread pool
def fetch_youtube_sync(query, max_videos=3, comments_per_video=10):
    try:
        youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        search_response = youtube.search().list(q=query, part="id,snippet", maxResults=max_videos, type="video").execute()
        posts = []
        for item in search_response.get("items", []):
            video_id = item["id"]["videoId"]
            video_title = item["snippet"]["title"]
            try:
                comments_response = youtube.commentThreads().list(part="snippet", videoId=video_id, maxResults=comments_per_video, textFormat="plainText").execute()
                for c in comments_response.get("items", []):
                    comment = c["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                    posts.append({
                        "id": f"yt_{video_id}",
                        "title": video_title,
                        "text": comment,
                        "source": "YouTube",
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                        "time": "",
                        "type": "youtube"
                    })
            except: continue
        return posts
    except Exception as e:
        print(f"YouTube error: {e}")
        return []

async def fetch_youtube(query, max_videos=3, comments_per_video=10):
    return await asyncio.to_thread(fetch_youtube_sync, query, max_videos, comments_per_video)

async def fetch_xpoz_twitter(query, limit=30):
    def run():
        try:
            with XpozClient(XPOZ_API_KEY) as client:
                results = client.twitter.search_posts(query, response_type=ResponseType.FAST, limit=limit)
                return [{"id": t.id, "title": t.text[:80], "text": t.text, "source": "Twitter/X", "url": f"https://twitter.com/i/web/status/{t.id}", "time": t.created_at_date, "type": "twitter"} for t in results.data if t.text]
        except Exception as e:
            print(f"Xpoz Twitter error: {e}")
            return []
    return await asyncio.to_thread(run)

async def fetch_xpoz_reddit(query, limit=30):
    def run():
        try:
            with XpozClient(XPOZ_API_KEY) as client:
                results = client.reddit.search_posts(query, response_type=ResponseType.FAST, limit=limit)
                return [{"id": r.id, "title": r.title, "text": f"{r.title} {r.selftext}", "source": f"Reddit r/{r.subreddit_name}", "url": r.url, "time": r.created_at_date, "type": "reddit"} for r in results.data if r.title or r.selftext]
        except Exception as e:
            print(f"Xpoz Reddit error: {e}")
            return []
    return await asyncio.to_thread(run)

async def fetch_xpoz_instagram(query, limit=30):
    def run():
        try:
            with XpozClient(XPOZ_API_KEY) as client:
                results = client.instagram.search_posts(query, response_type=ResponseType.FAST, limit=limit)
                return [{"id": p.id, "title": p.caption[:80], "text": p.caption, "source": "Instagram", "url": "", "time": p.created_at_date, "type": "instagram"} for p in results.data if p.caption]
        except Exception as e:
            print(f"Xpoz Instagram error: {e}")
            return []
    return await asyncio.to_thread(run)
