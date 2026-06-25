from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin1002@localhost:5432/analysis")
engine = create_engine(DATABASE_URL)

def init_db():
    with engine.connect() as conn:
        conn.execute(text('''CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )'''))
        conn.execute(text('''CREATE TABLE IF NOT EXISTS searches (
            id SERIAL PRIMARY KEY,
            username TEXT,
            query TEXT NOT NULL,
            pos_pct REAL,
            neg_pct REAL,
            total INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            category TEXT DEFAULT 'analysis'
        )'''))
        try:
            # Check if column exists first to avoid InFailedSqlTransaction in PostgreSQL
            check_col = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='searches' AND column_name='category'
            """)).fetchone()
            if not check_col:
                conn.execute(text("ALTER TABLE searches ADD COLUMN category TEXT DEFAULT 'analysis'"))
        except Exception:
            pass
        conn.execute(text('''CREATE TABLE IF NOT EXISTS sentiment_trends (
            id SERIAL PRIMARY KEY,
            query TEXT NOT NULL,
            pos_pct REAL NOT NULL,
            neg_pct REAL NOT NULL,
            avg_confidence REAL,
            volume INTEGER,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )'''))
        conn.execute(text('''CREATE TABLE IF NOT EXISTS keywords_cache (
            id SERIAL PRIMARY KEY,
            query TEXT UNIQUE NOT NULL,
            pos_keywords TEXT, -- Stored as JSON string
            neg_keywords TEXT, -- Stored as JSON string
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )'''))
        conn.execute(text('''CREATE TABLE IF NOT EXISTS contacts (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone_no TEXT DEFAULT '',
            subject TEXT,
            message TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )'''))
        try:
            # Check if column exists first to avoid errors
            check_phone = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='contacts' AND column_name='phone_no'
            """)).fetchone()
            if not check_phone:
                conn.execute(text("ALTER TABLE contacts ADD COLUMN phone_no TEXT DEFAULT ''"))
        except Exception as e:
            print(f"Migration Error on contacts (phone_no): {e}")
        conn.execute(text('''CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )'''))
        conn.commit()
