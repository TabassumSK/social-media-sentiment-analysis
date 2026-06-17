import aiohttp
import asyncio
import os
from dotenv import load_dotenv

# Mocking the fetchers or importing them
import sys
sys.path.append(r'c:\Users\Tabassum\OneDrive\Desktop\BE Project\Social_media_analysis\pluseai-backend')
from services.fetchers import fetch_newsapi, fetch_hackernews

load_dotenv(r'c:\Users\Tabassum\OneDrive\Desktop\BE Project\Social_media_analysis\pluseai-backend\.env')

async def test():
    async with aiohttp.ClientSession() as session:
        query = "Walmart"
        news = await fetch_newsapi(session, query, 10)
        hn = await fetch_hackernews(session, query, 10)
        print(f"NewsAPI results: {len(news)}")
        print(f"HackerNews results: {len(hn)}")
        if news: print(f"First news sample: {news[0]['title']}")
        if hn: print(f"First HN sample: {hn[0]['title']}")

if __name__ == "__main__":
    asyncio.run(test())
