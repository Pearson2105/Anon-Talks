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

    # run db.create_all() once (Flask 3.x compatible)
    tables_created = False

    @app.before_request
    def create_tables_once():
        nonlocal tables_created
        if not tables_created:
            with app.app_context():
                db.create_all()
            tables_created = True

    @app.route("/api/posts", methods=["GET"])
    def list_posts():
        posts = Post.query.order_by(Post.created_at.desc()).all()
        return jsonify([p.as_dict() for p in posts]), 200

    @limiter.limit("30 per hour")
    @app.route("/api/posts", methods=["POST"])
    def create_post():
        if not request.is_json:
            return jsonify({"error": "JSON body required"}), 400

        body = request.get_json()
        username = body.get("username")
        content = body.ge
