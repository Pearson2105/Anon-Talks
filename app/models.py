from . import dp
from datetime import datetime

class Post(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  username = db.Column(db.String(50))
  text = db.Column(db.Text)
  image = db.Column(db.String(255), nullable=True)
  likes = db.Column(db.Integer, deafult=0)
  dislikes = db.Column(db.Integer, deafult=0)
  created = db.Column(db.DateTime, deafult=datetime.utcnow)
