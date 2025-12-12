# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import string
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True)

# In-memory storage
users = {}
posts = []

# ---------- UTILS ----------
def gen_anon():
    return "anon" + ''.join(random.choices(string.digits, k=6))

def current_iso():
    return datetime.now().isoformat()  # current timestamp in ISO format

# ---------- IDENTITY ----------
@app.route("/api/generate", methods=["POST"])
def generate_identity():
    username = gen_anon()
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    users[username] = password
    return jsonify({"username": username, "password": password})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    u = data.get("username")
    p = data.get("password")
    if users.get(u) == p:
        return jsonify({"success": True})
    return jsonify({"success": False}), 401

# ---------- POSTS CRUD ----------
@app.route("/api/posts", methods=["GET", "POST", "OPTIONS"])
def handle_posts():
    global posts
    if request.method == "OPTIONS":
        return '', 200  # preflight

    if request.method == "POST":
        data = request.get_json()
        post = {
            "id": len(posts) + 1,
            "username": data.get("username"),
            "content": data.get("content"),
            "imageUrl": data.get("imageUrl"),
            "createdAt": data.get("createdAt") or current_iso()
        }
        posts.append(post)
        return jsonify(post)

    # GET
    return jsonify(posts)

@app.route("/api/posts/<int:post_id>", methods=["PATCH", "DELETE", "OPTIONS"])
def update_delete_post(post_id):
    global posts
    if request.method == "OPTIONS":
        return '', 200

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

# ---------- RUN ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
