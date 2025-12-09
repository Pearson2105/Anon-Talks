from flask import Flask, request, jsonify, send_from_directory
from .config import Config
from .extensions import db, cors, limiter
from .models import Post, gen_anon
import bleach
import os
import random
import string

def create_app():
    app = Flask(
        __name__,
        static_folder="../frontend/static",
        static_url_path="/static"
    )

    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    limiter.init_app(app)

    # ---------------------------
    # CREATE TABLES ON STARTUP
    # ---------------------------
    @app.before_serving
    def create_tables():
        db.create_all()

    # ---------------------------
    # FRONTEND ROUTES
    # ---------------------------
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
        if path in ["", "index.html"]:
            return send_from_directory(frontend_dir, "index.html")
        elif path == "my-posts.html":
            return send_from_directory(frontend_dir, "my-posts.html")
        elif path == "select.html":
            return send_from_directory(frontend_dir, "select.html")
        return send_from_directory(frontend_dir, path)

    # ---------------------------
    # POSTS API
    # ---------------------------
    @app.route("/api/posts", methods=["GET"])
    def list_posts():
        posts = Post.query.order_by(Post.created_at.desc()).all()
        return jsonify([p.as_dict() for p in posts]), 200

    @app.route("/api/posts", methods=["POST"])
    @limiter.limit("30 per hour")
    def create_post():
        if not request.is_json:
            return jsonify({"error": "JSON body required"}), 400
        data = request.get_json()
        username = Post.normalize_username(data.get("username"))
        content = (data.get("content") or "").strip()
        image_url = (data.get("imageUrl") or data.get("image_url") or "").strip()

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

    @app.route("/api/posts/<int:post_id>", methods=["PUT"])
    def edit_post(post_id):
        if not request.is_json:
            return jsonify({"error": "JSON required"}), 400
        data = request.get_json()
        content = (data.get("content") or "").strip()
        if not content:
            return jsonify({"error": "content required"}), 400

        post = Post.query.get_or_404(post_id)
        post.content = bleach.clean(content[:4096], tags=[], attributes={}, strip=True)
        db.session.commit()
        return jsonify(post.as_dict()), 200

    @app.route("/api/posts/<int:post_id>", methods=["DELETE"])
    def delete_post(post_id):
        post = Post.query.get_or_404(post_id)
        db.session.delete(post)
        db.session.commit()
        return jsonify({"success": True}), 200

    # ---------------------------
    # GENERATE ACCOUNT
    # ---------------------------
    @app.route("/api/generate", methods=["GET", "POST"])
    def generate_identity():
        username = gen_anon()
        password = ''.join(random.choices(string.digits, k=6))
        return jsonify({"username": username, "password": password})

    # ---------------------------
    # LOGIN
    # ---------------------------
    @app.route("/api/login", methods=["POST"])
    def login():
        if not request.is_json:
            return jsonify({"success": False, "error": "JSON required"}), 400
        data = request.get_json()
        username = (data.get("username") or "").strip()
        password = (data.get("password") or "").strip()

        if username.startswith("anon") and password.isdigit() and len(password) == 6:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Invalid username or password"}), 401

    return app

# ---------------------------
# RUN APP
# ---------------------------
if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8080, debug=True)
