import aiohttp
import asyncio
import os
import json
from dotenv import load_dotenv

# Mocking the fetchers or importing them
import sys
sys.path.append(r'c:\Users\Tabassum\OneDrive\Desktop\BE Project\Social_media_analysis\pluseai-backend')
from services.fetchers import fetch_newsapi

load_dotenv(r'c:\Users\Tabassum\OneDrive\Desktop\BE Project\Social_media_analysis\pluseai-backend\.env')
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

async def test():
    async with aiohttp.ClientSession() as session:
        query = "Walmart"
        url = f"https://newsapi.org/v2/everything?q={query}&language=en&pageSize=10&sortBy=publishedAt&apiKey={NEWS_API_KEY}"
        async with session.get(url) as response:
            status = response.status
            body = await response.text()
            print(f"Status: {status}")
            print(f"Body: {body[:500]}")

if __name__ == "__main__":
    asyncio.run(test())
