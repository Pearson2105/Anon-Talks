# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random
import string

app = Flask(__name__)
CORS(app)  # allow frontend JS to call API

# In-memory "database" for testing
users = {}
posts = []

# --------------------------
# UTILITY FUNCTIONS
# --------------------------
def gen_anon():
    return "anon" + ''.join(random.choices(string.digits, k=6))

def current_timestamp():
    # dd/mm/yyyy hh:mm:ss
    return datetime.now().strftime("%d/%m/%Y %H:%M:%S")

# --------------------------
# AUTHENTICATION ROUTES
# --------------------------
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

# --------------------------
# POSTS ROUTES
# --------------------------
@app.route("/api/posts", methods=["GET", "POST"])
def handle_posts():
    global posts
    if request.method == "POST":
        data = request.get_json()
        posts.append({
            "id": len(posts) + 1,
            "username": data.get("username"),
            "content": data.get("content"),
            "imageUrl": data.get("imageUrl"),
            "createdAt": current_timestamp()
        })
        return jsonify({"success": True})
    # return posts sorted chronologically (oldest first)
    sorted_posts = sorted(posts, key=lambda x: datetime.strptime(x["createdAt"], "%d/%m/%Y %H:%M:%S"))
    return jsonify(sorted_posts)

@app.route("/api/posts/<int:post_id>", methods=["PUT", "DELETE"])
def modify_post(post_id):
    global posts
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if request.method == "PUT":
        data = request.get_json()
        post["content"] = data.get("content", post["content"])
        post["imageUrl"] = data.get("imageUrl", post["imageUrl"])
        return jsonify({"success": True, "post": post})

    if request.method == "DELETE":
        posts = [p for p in posts if p["id"] != post_id]
        return jsonify({"success": True})

# --------------------------
# RUN APP
# --------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
