from datetime import datetime
from .extensions import db
import random
import string

def gen_anon():
  return "anon" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class Post(db.Model):
  __tablename__ = "posts"
  id = db.Column(db.Integer, primary_key=True)
  username = db.Column(db.String(64), nullable=True) 
  content = db.Column(db.Text, nullable=True)
  image_url = db.Column(db.String(1000), nullable=True)
  created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    @staticmethod
    def normalize_username(username: str | None):
        if not username:
            return "Anon"

        username = username.strip()

        if username == "":
            return "Anon"

        # Limit size (optional)
        return username[:30]

def as_dict(self):
    return {
        "id": self.id,
        "username": self.username,
        "content": self.content,
        "imageUrl": self.image_url,
        "createdAt": self.created_at.isoformat() + "Z"
    }

@staticmethod
def normalize_username(username):
  if not username or not username.strip():
    return gen_anon()
  u = username.strip()
  return u[:32]
