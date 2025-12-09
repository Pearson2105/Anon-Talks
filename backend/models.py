from .extensions import db
from datetime import datetime
import random
import string

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    content = db.Column(db.String(4096))
    image_url = db.Column(db.String(1000))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def as_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "content": self.content,
            "imageUrl": self.image_url,
            "createdAt": self.created_at.isoformat()
        }

    @staticmethod
    def normalize_username(username):
        return username.strip() if username else "anon"

def gen_anon():
    return "anon" + ''.join(random.choices(string.digits, k=6))
