from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
import os

db = SQLAlchemy()

def create_app():
  app = Flask(__name__)
  app.config.from_object(Config)
  CORS(app)
  db.init_app(app)
  os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

  from .routes import bp
  app.register_blueprint(bp)

  with app.app_context():
    db.create_all()

  return app
