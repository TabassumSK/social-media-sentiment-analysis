import torch
import re
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from collections import Counter
import os

MODEL_PATH = os.getenv("MODEL_PATH", "models/bert_sentiment")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

STOPWORDS = {'the','a','an','is','it','this','that','was','are','be','to','of','and','or','in','on','for','with','as','at','by','have','has','had','will','would','could','should','from'}

def clean_text(text: str) -> str:
    text = re.sub(r'http\S+', '', str(text))
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip().lower()

def predict_batch(texts: list) -> list:
    cleaned = [clean_text(t) for t in texts]
    if not cleaned: return []
    
    # Batch processing for speed
    inputs = tokenizer(cleaned, return_tensors='pt', max_length=128, truncation=True, padding=True)
    with torch.no_grad():
        logits = model(**inputs).logits
    
    probs = torch.softmax(logits, dim=1).tolist()
    preds = torch.argmax(logits, dim=1).tolist()
    
    results = []
    for i, p in enumerate(probs):
        confidence = round(max(p), 4)
        pred = preds[i]
        
        if confidence < 0.60:
            label, score = "Neutral", 0
        elif pred == 1:
            label, score = "Positive", 1
        else:
            label, score = "Negative", -1
            
        # Basic Emotion Detection (Rule-based for speed)
        emotions = []
        text_lower = cleaned[i]
        if any(w in text_lower for w in ['love', 'great', 'excellent', 'happy', 'best']): emotions.append("Joy")
        if any(w in text_lower for w in ['hate', 'bad', 'worst', 'angry', 'terrible']): emotions.append("Anger")
        if any(w in text_lower for w in ['wow', 'amazing', 'unexpected', 'surprise']): emotions.append("Surprise")
        if not emotions: emotions.append("Neutral")
        
        results.append({
            "label": label,
            "score": score,
            "confidence": confidence,
            "prob_pos": round(p[1], 4),
            "prob_neg": round(p[0], 4),
            "emotion": emotions[0]
        })
    return results

def extract_keywords(texts: list, n=15) -> list:
    words = []
    for t in texts:
        words.extend([w for w in clean_text(t).split() if w not in STOPWORDS and len(w) > 3])
    return [{"word": w, "count": c} for w, c in Counter(words).most_common(n)]

def get_aspect_sentiment(texts: list, aspects: dict) -> dict:
    results = {}
    for aspect, keywords in aspects.items():
        relevant = [t for t in texts if any(k in t.lower() for k in keywords)]
        if not relevant:
            results[aspect] = {"pos_pct": 50, "neg_pct": 50, "total": 0}
            continue
        # Use batch prediction for relevant texts
        preds = predict_batch(relevant[:50])
        pos = sum(1 for p in preds if p["score"] == 1)
        total = len(preds)
        results[aspect] = {
            "pos_pct": round(pos/total*100, 1),
            "neg_pct": round((total-pos)/total*100, 1),
            "total": total
        }
    return results
