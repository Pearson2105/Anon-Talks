import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or f"sqlite:///{os.path.join(BASE_DIR, 'data.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    RATELIMIT_DEFAULT = "200 per day;50 per hour"   # Fixed typo
    RATELIMIT_STORAGE_URI = "memory://"            # Fixed extra quote
