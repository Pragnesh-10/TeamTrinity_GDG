import os
from supabase import create_client, Client
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

# Hackathon Fallback DB (Local SQLite for demo stability if Supabase env vars missing)
import sqlite3
import json

class Database:
    def __init__(self):
        self.use_supabase = bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_KEY"))
        if self.use_supabase:
            url: str = os.environ.get("SUPABASE_URL")
            key: str = os.environ.get("SUPABASE_KEY")
            self.supabase: Client = create_client(url, key)
        else:
            # Local SQLite fallback for Hackathon strict environments
            self.conn = sqlite3.connect('fairplay.db', check_same_thread=False)
            self.cursor = self.conn.cursor()
            self.cursor.execute('''
                CREATE TABLE IF NOT EXISTS analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset_id TEXT,
                    source_url TEXT,
                    category TEXT,
                    confidence REAL,
                    reasoning TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            self.conn.commit()

    def save_analysis(self, payload):
        if self.use_supabase:
            try:
                response = self.supabase.table('analyses').insert(payload).execute()
                return response.data
            except Exception as e:
                print(f"Supabase Error: {e}")
                return None
        else:
            self.cursor.execute('''
                INSERT INTO analyses (asset_id, source_url, category, confidence, reasoning) 
                VALUES (?, ?, ?, ?, ?)
            ''', (payload['asset_id'], payload['source_url'], payload['category'], payload['confidence'], payload['reasoning']))
            self.conn.commit()
            return payload

    def get_all_analyses(self):
        if self.use_supabase:
            try:
                response = self.supabase.table('analyses').select("*").execute()
                return response.data
            except Exception as e:
                print(f"Supabase Error: {e}")
                return []
        else:
            self.cursor.execute('SELECT * FROM analyses ORDER BY timestamp DESC')
            rows = self.cursor.fetchall()
            return [
                {
                    "id": r[0], "asset_id": r[1], "source_url": r[2], 
                    "category": r[3], "confidence": r[4], "reasoning": r[5], "timestamp": r[6]
                } for r in rows
            ]

db = Database()