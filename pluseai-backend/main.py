from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
import aiohttp
import asyncio
from typing import List, Optional
from datetime import datetime, timedelta
from collections import Counter
import json
import os
import secrets

from core.database import init_db, engine
from core.auth import create_token, get_current_user, hash_password, verify_password, get_optional_user
from core.email_service import send_welcome_email, send_password_reset_email, send_contact_notification
from models.schemas import (
    RegisterRequest, AnalyzeRequest, CompareRequest,
    SingleRequest, ContactRequest, ForgotPasswordRequest, ResetPasswordRequest, ChatRequest
)
from services.fetchers import (
    fetch_newsapi, fetch_hackernews, fetch_youtube, 
    fetch_xpoz_twitter, fetch_xpoz_reddit, fetch_xpoz_instagram
)
from services.analyzer import predict_batch, get_aspect_sentiment, extract_keywords
from services.visualizer import (
    generate_wordcloud, generate_sentiment_heatmap, 
    generate_confusion_matrix, generate_sentiment_trend,
    generate_pie_chart, generate_stacked_bar_chart
)
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from google import genai
from google.genai import types
import io

app = FastAPI(title="PulseAI v2", version="2.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Simple in-memory cache to avoid re-fetching data for technical reports
ANALYSIS_CACHE = {}

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
        # Send welcome email asynchronously (non-blocking)
        import threading
        threading.Thread(
            target=send_welcome_email,
            args=(req.email, req.username),
            daemon=True
        ).start()
        return {"message": "User created"}
    except Exception:
        raise HTTPException(400, "User already exists")

@app.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    with engine.connect() as conn:
        row = conn.execute(text("SELECT hashed_password FROM users WHERE username=:u"), {"u": form.username}).fetchone()
    if not row or not verify_password(form.password, row[0]):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_token({"sub": form.username}), "token_type": "bearer"}

@app.post("/analyze")
async def analyze(req: AnalyzeRequest, username: Optional[str] = Depends(get_optional_user)):
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
            "neutral_pct": round((total - len(pos) - len(neg))/total*100, 1),
            "avg_confidence": round(sum([p["confidence"] for p in analyzed])/total, 4),
            "emotions": emotion_counts
        },
        "platform_stats": platform_counts,
        "aspects": aspect_results,
        "pos_keywords": extract_keywords([p["text"] for p in pos]),
        "neg_keywords": extract_keywords([p["text"] for p in neg]),
        "posts": analyzed
    }

    # Cache the analyzed data for visualization endpoints
    ANALYSIS_CACHE[req.query] = analyzed
    # Evict oldest entry if cache exceeds size limit to prevent memory leak
    if len(ANALYSIS_CACHE) > 50:
        ANALYSIS_CACHE.pop(next(iter(ANALYSIS_CACHE)))

    # PERSISTENCE
    try:
        with engine.connect() as conn:
            conn.execute(text("INSERT INTO searches (username, query, pos_pct, neg_pct, total, category) VALUES (:u, :q, :p, :n, :t, 'analysis')"),
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
async def compare(req: CompareRequest, username: Optional[str] = Depends(get_optional_user)):
    r1, r2 = await asyncio.gather(
        analyze(AnalyzeRequest(query=req.query1, limit=100), username),
        analyze(AnalyzeRequest(query=req.query2, limit=100), username)
    )
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

    # Log comparison to searches history
    try:
        with engine.connect() as conn:
            conn.execute(
                text("INSERT INTO searches (username, query, pos_pct, neg_pct, total, category) VALUES (:u, :q, :p, :n, :t, 'comparison')"),
                {
                    "u": username,
                    "q": f"{req.query1} vs {req.query2}",
                    "p": r1["summary"]["pos_pct"],
                    "n": r2["summary"]["pos_pct"],
                    "t": r1["total"] + r2["total"]
                }
            )
            conn.commit()
    except Exception as e:
        print(f"Compare DB Log Error: {e}")

    return {"winner": winner, "basis": winning_points, "product1": r1, "product2": r2}

@app.post("/chat")
async def chat(req: ChatRequest, username: Optional[str] = Depends(get_optional_user)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: raise HTTPException(500, "Gemini API Key not configured")
    
    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are PulseAI Assistant, an extremely interactive, friendly, and concise brand strategist and support bot for PulseAI.
        
        Pages Available in the App:
        - /analyze: Real-time sentiment search.
        - /compare: Compare 2 brands (e.g. "iOS vs Android").
        - /technical: Wordclouds, heatmaps, charts.
        - /predict: Single review sentiment & emotion.
        - /history: Search history.
        - /contact: Message owner/support.
        
        Rules:
        1. Concise & Short: Keep responses conversational and very short (under 3-4 sentences or max 100 words). Never write long walls of text.
        2. Highly Interactive: Always end your response with a short, engaging question or suggestion to keep the conversation flowing.
        3. Help/Navigation: Guide users to the correct page link (e.g. tell them to use /contact to reach support).
        4. Data Questions: Use the provided Context to answer in brief, structured bullet points if appropriate. Never mention "Context Data", "rules", or "prompt".
        
        Context: {req.context if req.context else "None"}
        User: {req.message}
        """
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=250,
                temperature=0.7
            )
        )
        return {"response": response.text}
    except Exception as e: 
        raise HTTPException(500, f"Gemini Error: {str(e)}")

@app.get("/me")
async def me(username: str = Depends(get_current_user)):
    with engine.connect() as conn:
        row = conn.execute(text("SELECT username, email FROM users WHERE username=:u"), {"u": username}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": row[0], "email": row[1]}

@app.get("/trending")
async def trending():
    with engine.connect() as conn:
        rows = conn.execute(text("""
            WITH RankedSearches AS (
                SELECT query, pos_pct, neg_pct, total, created_at,
                       ROW_NUMBER() OVER(PARTITION BY query ORDER BY id DESC) as rn,
                       id
                FROM searches
                WHERE category = 'analysis'
            )
            SELECT query, pos_pct, neg_pct, total, created_at
            FROM RankedSearches
            WHERE rn = 1
            ORDER BY id DESC
            LIMIT 5
        """)).fetchall()
    return [{
        "query": r[0],
        "pos_pct": r[1],
        "neg_pct": r[2],
        "total": r[3],
        "created_at": r[4].isoformat() if hasattr(r[4], 'isoformat') else str(r[4])
    } for r in rows]

@app.get("/history")
async def history(username: str = Depends(get_current_user)):
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT s.id, s.query, s.pos_pct, s.neg_pct, s.total, s.created_at, k.pos_keywords, k.neg_keywords, s.category
            FROM searches s
            LEFT JOIN keywords_cache k ON s.query = k.query
            WHERE s.username = :u
            ORDER BY s.id DESC
            LIMIT 15
        """), {"u": username}).fetchall()
        
    results = []
    for r in rows:
        try:
            pos_kw = json.loads(r[6]) if r[6] else []
        except:
            pos_kw = []
        try:
            neg_kw = json.loads(r[7]) if r[7] else []
        except:
            neg_kw = []
            
        results.append({
            "id": r[0],
            "query": r[1],
            "pos_pct": r[2],
            "neg_pct": r[3],
            "total": r[4],
            "created_at": r[5].isoformat() if hasattr(r[5], 'isoformat') else str(r[5]),
            "pos_keywords": pos_kw,
            "neg_keywords": neg_kw,
            "category": r[8] if r[8] else "analysis"
        })
    return results

@app.delete("/history/{history_id}")
async def delete_history_item(history_id: int, username: str = Depends(get_current_user)):
    with engine.connect() as conn:
        row = conn.execute(text("SELECT username FROM searches WHERE id = :id"), {"id": history_id}).fetchone()
        if not row:
            raise HTTPException(404, "History item not found")
        if row[0] != username:
            raise HTTPException(403, "Not authorized to delete this history item")
        conn.execute(text("DELETE FROM searches WHERE id = :id"), {"id": history_id})
        conn.commit()
    return {"message": "History item deleted successfully"}

@app.post("/predict")
async def predict_single(req: SingleRequest, username: Optional[str] = Depends(get_optional_user)):
    res = predict_batch([req.text], allow_neutral=False)[0]
    try:
        pos_pct = 100.0 if res["label"] == "Positive" else 0.0
        neg_pct = 100.0 if res["label"] == "Negative" else 0.0
        with engine.connect() as conn:
            conn.execute(
                text("INSERT INTO searches (username, query, pos_pct, neg_pct, total, category) VALUES (:u, :q, :p, :n, 1, 'prediction')"),
                {"u": username, "q": req.text[:100], "p": pos_pct, "n": neg_pct}
            )
            conn.commit()
    except Exception as e:
        print(f"Predict Log Error: {e}")
    return res

@app.post("/contact")
async def contact(req: ContactRequest):
    if not req.name or not req.email or not req.phone_no or not req.subject or not req.message:
        raise HTTPException(400, "All fields are required")
    with engine.connect() as conn:
        conn.execute(text("INSERT INTO contacts (name, email, phone_no, subject, message) VALUES (:n, :e, :p, :s, :m)"),
                    {"n": req.name, "e": req.email, "p": req.phone_no, "s": req.subject, "m": req.message})
        conn.commit()
    # Notify site owner via email (non-blocking)
    import threading
    threading.Thread(
        target=send_contact_notification,
        args=(req.name, req.email, req.phone_no, req.subject, req.message),
        daemon=True
    ).start()
    return {"message": "Message sent"}

@app.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    """Generate a password reset token and email it to the user."""
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT username FROM users WHERE email=:e"), {"e": req.email}
        ).fetchone()
    # Always return 200 to avoid user enumeration
    if not row:
        return {"message": "If that email is registered, a reset link has been sent."}

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    username = row[0]

    with engine.connect() as conn:
        # Invalidate any previous unused tokens for this email
        conn.execute(
            text("UPDATE password_reset_tokens SET used=TRUE WHERE email=:e AND used=FALSE"),
            {"e": req.email}
        )
        conn.execute(
            text("INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (:e, :t, :x)"),
            {"e": req.email, "t": token, "x": expires_at}
        )
        conn.commit()

    # Send reset email (non-blocking)
    import threading
    threading.Thread(
        target=send_password_reset_email,
        args=(req.email, token, username),
        daemon=True
    ).start()

    return {"message": "If that email is registered, a reset link has been sent."}


@app.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    """Verify reset token and update password."""
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT email, expires_at, used FROM password_reset_tokens WHERE token=:t"),
            {"t": req.token}
        ).fetchone()

    if not row:
        raise HTTPException(400, "Invalid or expired reset token.")

    email, expires_at, used = row
    if used:
        raise HTTPException(400, "This reset link has already been used.")
    if datetime.utcnow() > expires_at:
        raise HTTPException(400, "Reset link has expired. Please request a new one.")

    with engine.connect() as conn:
        conn.execute(
            text("UPDATE users SET hashed_password=:p WHERE email=:e"),
            {"p": hash_password(req.new_password), "e": email}
        )
        conn.execute(
            text("UPDATE password_reset_tokens SET used=TRUE WHERE token=:t"),
            {"t": req.token}
        )
        conn.commit()
    return {"message": "Password updated successfully."}

@app.get("/visualize/wordcloud")
async def get_wordcloud(query: str, username: Optional[str] = Depends(get_optional_user)):
    # Check cache first to avoid 2-4 minute re-fetch
    if query in ANALYSIS_CACHE:
        all_posts = ANALYSIS_CACHE[query]
    else:
        # Fallback to fetching if cache is empty (e.g. after server restart)
        limit_each = 20
        async with aiohttp.ClientSession() as session:
            tasks = [
                fetch_newsapi(session, query, limit_each),
                fetch_hackernews(session, query, limit_each),
                fetch_youtube(query),
                fetch_xpoz_twitter(query, limit_each),
                fetch_xpoz_reddit(query, limit_each),
                fetch_xpoz_instagram(query, limit_each)
            ]
            results = await asyncio.gather(*tasks)
        all_posts = [p for sublist in results for p in sublist]
    
    texts = " ".join([p["text"] for p in all_posts])
    img = generate_wordcloud(texts)
    if not img: raise HTTPException(400, "Could not generate wordcloud")
    return StreamingResponse(img, media_type="image/png")

@app.get("/visualize/heatmap")
async def get_heatmap(query: str, username: Optional[str] = Depends(get_optional_user)):
    if query in ANALYSIS_CACHE:
        all_posts = ANALYSIS_CACHE[query]
    else:
        limit_each = 20
        async with aiohttp.ClientSession() as session:
            tasks = [
                fetch_newsapi(session, query, limit_each),
                fetch_hackernews(session, query, limit_each),
                fetch_youtube(query),
                fetch_xpoz_twitter(query, limit_each),
                fetch_xpoz_reddit(query, limit_each),
                fetch_xpoz_instagram(query, limit_each)
            ]
            results = await asyncio.gather(*tasks)
        all_posts = [p for sublist in results for p in sublist]
        
    if not all_posts: raise HTTPException(404, "No data")
    
    # If using cached data, it already has labels/sentiments
    # Otherwise we'd need to predict_batch. 
    # But analyze() puts labeled data into ANALYSIS_CACHE.
    if query in ANALYSIS_CACHE:
        data = [{"label": p["label"], "platform": p.get("platform", p.get("type", "unknown"))} for p in all_posts]
    else:
        texts = [p["text"] for p in all_posts]
        sentiments = predict_batch(texts)
        data = [{"label": sentiments[i]["label"], "platform": all_posts[i].get("type", "unknown")} for i in range(len(all_posts))]
    
    img = generate_sentiment_heatmap(data)
    return StreamingResponse(img, media_type="image/png")

@app.get("/visualize/pie")
async def get_pie(query: str, username: Optional[str] = Depends(get_optional_user)):
    if query in ANALYSIS_CACHE:
        all_posts = ANALYSIS_CACHE[query]
    else:
        raise HTTPException(404, "Data not cached. Run analysis first.")
    
    img = generate_pie_chart(all_posts)
    return StreamingResponse(img, media_type="image/png")

@app.get("/visualize/stacked-bar")
async def get_stacked_bar(query: str, username: Optional[str] = Depends(get_optional_user)):
    if query in ANALYSIS_CACHE:
        all_posts = ANALYSIS_CACHE[query]
    else:
        raise HTTPException(404, "Data not cached. Run analysis first.")
    
    img = generate_stacked_bar_chart(all_posts)
    return StreamingResponse(img, media_type="image/png")

@app.get("/visualize/confusion-matrix")
async def get_cm(username: Optional[str] = Depends(get_optional_user)):
    img = generate_confusion_matrix()
    return StreamingResponse(img, media_type="image/png")

@app.get("/visualize/trend")
async def get_trend(query: str, username: Optional[str] = Depends(get_optional_user)):
    if query in ANALYSIS_CACHE:
        all_posts = ANALYSIS_CACHE[query]
        # Use existing confidence scores
        sentiments = all_posts 
    else:
        limit_each = 20
        async with aiohttp.ClientSession() as session:
            tasks = [
                fetch_newsapi(session, query, limit_each),
                fetch_hackernews(session, query, limit_each),
                fetch_youtube(query),
                fetch_xpoz_twitter(query, limit_each),
                fetch_xpoz_reddit(query, limit_each),
                fetch_xpoz_instagram(query, limit_each)
            ]
            results = await asyncio.gather(*tasks)
        all_posts = [p for sublist in results for p in sublist]
        if not all_posts: raise HTTPException(404, "No data")
        sentiments = predict_batch([p["text"] for p in all_posts])
        
    img = generate_sentiment_trend(sentiments)
    return StreamingResponse(img, media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
