from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime
import random
import string
import os
import bleach

# ----------------------
# CONFIG
# ----------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'data.db')}"

# ----------------------
# APP SETUP
# ----------------------
app = Flask(
    __name__,
    static_folder="../frontend/static",
    static_url_path="/static"
)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL") or DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JSON_SORT_KEYS"] = False

db = SQLAlchemy(app)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
limiter = Limiter(app, key_func=get_remote_address)

# ----------------------
# MODELS
# ----------------------
def gen_anon():
    return "anon" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), nullable=True)
    content = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(1000), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

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
        if not username or not username.strip():
            return gen_anon()
        return username.strip()[:32]

# Create tables
with app.app_context():
    db.create_all()

# ----------------------
# ROUTES
# ----------------------

# Serve frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
    if path == "" or path == "index.html":
        return send_from_directory(frontend_dir, "index.html")
    elif path == "my-posts.html":
        return send_from_directory(frontend_dir, "my-posts.html")
    elif path == "select.html":
        return send_from_directory(frontend_dir, "select.html")
    return send_from_directory(frontend_dir, path)

# List posts
@app.route("/api/posts", methods=["GET"])
def list_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([p.as_dict() for p in posts])

# Create post
@app.route("/api/posts", methods=["POST"])
@limiter.limit("30 per hour")
def create_post():
    if not request.is_json:
        return jsonify({"error": "JSON body required"}), 400
    body = request.get_json()
    username = Post.normalize_username(body.get("username"))
    content = (body.get("content") or "").strip()
    image_url = (body.get("imageUrl") or body.get("image_url") or "").strip()

    if not content and not image_url:
        return jsonify({"error": "content or imageUrl required"}), 400

    if content:
        content = bleach.clean(content[:4096], tags=[], attributes={}, strip=True)
    if image_url:
        image_url = image_url[:1000]

    post = Post(username=username, content=content or None, image_url=image_url or None)
    db.session.add(post)
    db.session.commit()
    return jsonify(post.as_dict()), 201

# Edit / Delete post
@app.route("/api/posts/<int:post_id>", methods=["PUT", "DELETE"])
def modify_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if request.method == "PUT":
        data = request.get_json()
        content = (data.get("content") or "").strip()
        if content:
            post.content = bleach.clean(content[:4096], tags=[], attributes={}, strip=True)
        db.session.commit()
        return jsonify(post.as_dict())

    if request.method == "DELETE":
        db.session.delete(post)
        db.session.commit()
        return jsonify({"success": True})

# Generate identity
@app.route("/api/generate", methods=["GET", "POST"])
def generate_identity():
    username = gen_anon()
    password = ''.join(random.choices(string.digits, k=6))
    return jsonify({"username": username, "password": password})

# Login
@app.route("/api/login", methods=["POST"])
def login():
    if not request.is_json:
        return jsonify({"success": False, "error": "JSON required"}), 400
    body = request.get_json()
    username = body.get("username", "").strip()
    password = body.get("password", "").strip()

    if username.startswith("anon") and password.isdigit() and len(password) == 6:
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Invalid username or password"}), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
