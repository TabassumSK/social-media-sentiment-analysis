from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
import aiohttp
import asyncio
from typing import List, Optional
from datetime import datetime
from collections import Counter
import json
import os

from core.database import init_db, engine
from core.auth import create_token, get_current_user, hash_password, verify_password
from models.schemas import (
    RegisterRequest, AnalyzeRequest, CompareRequest, 
    SingleRequest, ContactRequest, ResetPasswordRequest, ChatRequest
)
from services.fetchers import (
    fetch_newsapi, fetch_hackernews, fetch_youtube, 
    fetch_xpoz_twitter, fetch_xpoz_reddit, fetch_xpoz_instagram
)
from services.analyzer import predict_batch, get_aspect_sentiment, extract_keywords
from sqlalchemy import text
import google.generativeai as genai

app = FastAPI(title="PulseAI v2", version="2.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup():
    init_db()

@app.post("/register")
async def register(req: RegisterRequest):
    try:
        with engine.connect() as conn:
            conn.execute(text("INSERT INTO users (username, email, hashed_password) VALUES (:u, :e, :p)"),
                        {"u": req.username, "e": req.email, "p": hash_password(req.password)})
            conn.commit()
        return {"message": "User created"}
    except: raise HTTPException(400, "User already exists")

@app.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    with engine.connect() as conn:
        row = conn.execute(text("SELECT hashed_password FROM users WHERE username=:u"), {"u": form.username}).fetchone()
    if not row or not verify_password(form.password, row[0]):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_token({"sub": form.username}), "token_type": "bearer"}

@app.post("/analyze")
async def analyze(req: AnalyzeRequest, username: str = Depends(get_current_user)):
    limit_each = max(req.limit // 6, 10)
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        if req.platform in ["all", "news"]: tasks.append(fetch_newsapi(session, req.query, limit_each))
        if req.platform in ["all", "hackernews"]: tasks.append(fetch_hackernews(session, req.query, limit_each))
        if req.platform in ["all", "youtube"]: tasks.append(fetch_youtube(req.query))
        if req.platform in ["all", "twitter"]: tasks.append(fetch_xpoz_twitter(req.query, limit_each))
        if req.platform in ["all", "reddit"]: tasks.append(fetch_xpoz_reddit(req.query, limit_each))
        if req.platform in ["all", "instagram"]: tasks.append(fetch_xpoz_instagram(req.query, limit_each))
        
        results = await asyncio.gather(*tasks)
    
    all_posts = [p for sublist in results for p in sublist]
    if not all_posts: raise HTTPException(404, "No data found")
    
    texts = [p["text"] for p in all_posts]
    sentiments = predict_batch(texts)
    analyzed = [{**all_posts[i], **sentiments[i], "platform": all_posts[i].get("type", "unknown")} for i in range(len(all_posts))]
    
    pos = [p for p in analyzed if p["label"] == "Positive"]
    neg = [p for p in analyzed if p["label"] == "Negative"]
    total = len(analyzed)
    
    aspects = {
        "Quality": ["quality", "build", "design"],
        "Value": ["price", "cost", "value"],
        "Performance": ["fast", "speed", "performance"],
        "Service": ["support", "service", "customer"],
        "Innovation": ["new", "innovative", "tech", "modern", "future"]
    }
    aspect_results = get_aspect_sentiment(texts, aspects)
    emotion_counts = Counter([p["emotion"] for p in analyzed])

    platform_counts = {}
    for p in analyzed:
        plat = p["platform"]
        if plat not in platform_counts: platform_counts[plat] = {"positive": 0, "negative": 0, "neutral": 0, "total": 0}
        platform_counts[plat]["total"] += 1
        if p["label"] == "Positive": platform_counts[plat]["positive"] += 1
        elif p["label"] == "Negative": platform_counts[plat]["negative"] += 1
        else: platform_counts[plat]["neutral"] += 1

    res = {
        "query": req.query,
        "total": total,
        "summary": {
            "positive": len(pos),
            "negative": len(neg),
            "neutral": total - len(pos) - len(neg),
            "pos_pct": round(len(pos)/total*100, 1),
            "neg_pct": round(len(neg)/total*100, 1),
            "avg_confidence": round(sum([p["confidence"] for p in analyzed])/total, 4),
            "emotions": emotion_counts
        },
        "platform_stats": platform_counts,
        "aspects": aspect_results,
        "pos_keywords": extract_keywords([p["text"] for p in pos]),
        "neg_keywords": extract_keywords([p["text"] for p in neg]),
        "posts": analyzed[:50]
    }

    # PERSISTENCE
    try:
        with engine.connect() as conn:
            conn.execute(text("INSERT INTO searches (username, query, pos_pct, neg_pct, total) VALUES (:u, :q, :p, :n, :t)"),
                        {"u": username, "q": req.query, "p": res["summary"]["pos_pct"], "n": res["summary"]["neg_pct"], "t": total})
            conn.execute(text("INSERT INTO sentiment_trends (query, pos_pct, neg_pct, avg_confidence, volume) VALUES (:q, :p, :n, :c, :v)"),
                        {"q": req.query, "p": res["summary"]["pos_pct"], "n": res["summary"]["neg_pct"], "c": res["summary"]["avg_confidence"], "v": total})
            conn.execute(text("""
                INSERT INTO keywords_cache (query, pos_keywords, neg_keywords) VALUES (:q, :pk, :nk)
                ON CONFLICT (query) DO UPDATE SET pos_keywords=EXCLUDED.pos_keywords, neg_keywords=EXCLUDED.neg_keywords, updated_at=CURRENT_TIMESTAMP
            """), {"q": req.query, "pk": json.dumps(res["pos_keywords"]), "nk": json.dumps(res["neg_keywords"])})
            conn.commit()
    except Exception as e: print(f"DB Log Error: {e}")

    return res

@app.post("/compare")
async def compare(req: CompareRequest, username: str = Depends(get_current_user)):
    r1 = await analyze(AnalyzeRequest(query=req.query1), username)
    r2 = await analyze(AnalyzeRequest(query=req.query2), username)
    winner = "Product 1" if r1["summary"]["pos_pct"] > r2["summary"]["pos_pct"] else "Product 2"
    w_data = r1 if winner == "Product 1" else r2
    l_data = r2 if winner == "Product 1" else r1
    winning_points = []
    if w_data["summary"]["pos_pct"] > l_data["summary"]["pos_pct"] + 10:
        winning_points.append(f"Significantly higher overall positive sentiment ({w_data['summary']['pos_pct']}% vs {l_data['summary']['pos_pct']}%)")
    for aspect in w_data["aspects"]:
        if w_data["aspects"][aspect]["pos_pct"] > l_data["aspects"][aspect]["pos_pct"] + 5:
            winning_points.append(f"Stronger user feedback on {aspect}")
    w_joy = w_data["summary"]["emotions"].get("Joy", 0)
    l_joy = l_data["summary"]["emotions"].get("Joy", 0)
    if w_joy > l_joy: winning_points.append(f"Higher levels of user satisfaction and 'Joy' expressed in reviews")
    return {"winner": winner, "basis": winning_points, "product1": r1, "product2": r2}

@app.post("/chat")
async def chat(req: ChatRequest, username: str = Depends(get_current_user)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: raise HTTPException(500, "Gemini API Key not configured")
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are PulseAI Assistant, an expert in sentiment analysis and brand strategy.
        
        Context Data from Analysis:
        {req.context}
        
        User Question: {req.message}
        
        Provide a strategic, professional response based on the context provided.
        """
        
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e: 
        raise HTTPException(500, f"Gemini Error: {str(e)}")

@app.get("/me")
async def me(username: str = Depends(get_current_user)):
    with engine.connect() as conn:
        row = conn.execute(text("SELECT username, email FROM users WHERE username=:u"), {"u": username}).fetchone()
    return {"username": row[0], "email": row[1]}

@app.get("/history")
async def history(username: str = Depends(get_current_user)):
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT query, pos_pct, total, created_at FROM searches WHERE username=:u ORDER BY id DESC LIMIT 10"), {"u": username}).fetchall()
    return [{"query": r[0], "pos_pct": r[1], "total": r[2], "created_at": r[3]} for r in rows]

@app.post("/predict")
async def predict_single(req: SingleRequest):
    return predict_batch([req.text])[0]

@app.post("/contact")
async def contact(req: ContactRequest):
    with engine.connect() as conn:
        conn.execute(text("INSERT INTO contacts (name, email, subject, message) VALUES (:n, :e, :s, :m)"),
                    {"n": req.name, "e": req.email, "s": req.subject, "m": req.message})
        conn.commit()
    return {"message": "Message sent"}

@app.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    with engine.connect() as conn:
        conn.execute(text("UPDATE users SET hashed_password=:p WHERE username=:u"),
                    {"p": hash_password(req.new_password), "u": req.username})
        conn.commit()
    return {"message": "Password updated"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
