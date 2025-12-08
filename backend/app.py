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

    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    limiter.init_app(app)

    tables_created = False

    @app.before_request
    def create_tables_once():
        nonlocal tables_created
        if not tables_created:
            with app.app_context():
                db.create_all()
            tables_created = True

    # ============================
    # FRONTEND ROUTE
    # ============================

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        frontend_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "frontend")
        )

        if path == "" or path == "index.html":
            return send_from_directory(frontend_dir, "index.html")

        return send_from_directory(frontend_dir, path)

    # ============================
    # API ROUTES
    # ============================

    # ---- GET POSTS ----
    @app.route("/api/posts", methods=["GET"])
    def list_posts():
        posts = Post.query.order_by(Post.created_at.desc()).all()
        return jsonify([p.as_dict() for p in posts]), 200

    # ---- CREATE POST ----
    @limiter.limit("30 per hour")
    @app.route("/api/posts", methods=["POST"])
    def create_post():
        if not request.is_json:
            return jsonify({"error": "JSON body required"}), 400

        body = request.get_json()
        username = body.get("username")
        content = body.get("content")
        image_url = body.get("imageUrl") or body.get("image_url")

        # At least text or image
        if (not content or not content.strip()) and (not image_url or not image_url.strip()):
            return jsonify({"error": "content or imageUrl required"}), 400

        # Clean + normalize
        username = Post.normalize_username(username)

        content = (content or "").strip()
        if content:
            content = content[:4096]
            content = bleach.clean(content, tags=[], attributes={}, strip=True)

        if image_url:
            image_url = image_url.strip()[:1000]

        post = Post(
            username=username,
            content=content or None,
            image_url=image_url or None
        )
        db.session.add(post)
        db.session.commit()

        return jsonify(post.as_dict()), 201

    # ============================
    # GENERATE ACCOUNT
    # ============================

    @app.route("/api/generate", methods=["GET", "POST"])
    def generate_identity():
        """Generate a unique username + password."""
        from .models import gen_anon
        username = gen_anon()
        password = ''.join(random.choices(string.digits, k=6))

        return jsonify({
            "username": username,
            "password": password
        })

    return app


# ============================
# RUN SERVER
# ============================
if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8080)
