from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
import os

db = SQLAlchemy()

def create_app():
  app = Flask(__name__)
  app.config.from_oejct(Config)
  CORS(app)
  db.init_app(app)
  os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

  from .routes import db
  app.register_blueprint(db)

  with app.app_context():
    db.create_all()

  return app
