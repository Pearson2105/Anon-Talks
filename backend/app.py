from flask import Flask, request, jsonify
from .config import Config
from .extensions import db, cors, limiter
from .models import Post
import bleach

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    limiter.init_app(app)

   
    @app.before_first_request
    def create_tables():
        db.create_all()

    @app.route("/api/posts", methods=["GET"])
    def list_posts():
        posts = Post.query.order_by(Post.created_at.desc()).all()
        return jsonify([p.as_dict() for p in posts]), 200

    @app.route("/api/posts", methods=["POST"])
    @limiter.limit("30 per hour")
    def create_post():
        if not request.is_json:
            return jsonify({"error": "JSON body required"}), 400

        body = request.get_json()
        username = body.get("username")
        content = body.get("content")
        image_url = body.get("imageUrl") or body.get("image_url")

        if (not content or not content.strip()) and (not image_url or not image_url.strip()):
            return jsonify({"error": "content or imageUrl required"}), 400

        username = Post.normalize_username(username)
        content = (content or "").strip()

        if content and len(content) > 4096:
            content = content[:4096]

        content = bleach.clean(content, tags=[], attributes={}, strip=True)

        if image_url:
            image_url = image_url.strip()
            if len(image_url) > 1000:
                image_url = image_url[:1000]

        post = Post(username=username, content=content or None, image_url=image_url or None)
        db.session.add(post)
        db.session.commit()

        return jsonify(post.as_dict()), 201

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8080)
