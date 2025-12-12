from flask import Flask, request, jsonify
from flask_cors import CORS
import random, string

app = Flask(__name__)
CORS(app, supports_credentials=True)  # allow preflight for all endpoints

users = {}
posts = []

# ... existing generate/login/routes ...

# POSTS CRUD
@app.route("/api/posts", methods=["GET", "POST", "OPTIONS"])
def handle_posts():
    if request.method == "OPTIONS":
        return '', 200  # handle preflight
    if request.method == "POST":
        data = request.get_json()
        post = {
            "id": len(posts) + 1,
            "username": data.get("username"),
            "content": data.get("content"),
            "imageUrl": data.get("imageUrl"),
            "createdAt": data.get("createdAt") or "2025-12-12T00:00:00"
        }
        posts.append(post)
        return jsonify(post)
    return jsonify(posts)

@app.route("/api/posts/<int:post_id>", methods=["PATCH", "DELETE", "OPTIONS"])
def update_delete_post(post_id):
    if request.method == "OPTIONS":
        return '', 200  # handle preflight

    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if request.method == "PATCH":
        data = request.get_json()
        post["content"] = data.get("content", post["content"])
        post["imageUrl"] = data.get("imageUrl", post["imageUrl"])
        return jsonify(post)

    if request.method == "DELETE":
        posts.remove(post)
        return jsonify({"success": True})
