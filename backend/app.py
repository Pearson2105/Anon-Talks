from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import string
from datetime import datetime

app = Flask(__name__)
CORS(app)

users = {}
posts = []

def gen_anon():
    return "anon" + ''.join(random.choices(string.digits, k=6))

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

@app.route("/api/posts", methods=["GET", "POST", "PUT", "DELETE"])
def handle_posts():
    if request.method == "POST":
        data = request.get_json()
        posts.append({
            "id": len(posts)+1,
            "username": data.get("username"),
            "content": data.get("content"),
            "imageUrl": data.get("imageUrl"),
            "createdAt": datetime.utcnow().isoformat()
        })
        return jsonify({"success": True})

    elif request.method == "PUT":
        data = request.get_json()
        post_id = data.get("id")
        for p in posts:
            if p["id"] == post_id:
                p["content"] = data.get("content", p["content"])
                p["imageUrl"] = data.get("imageUrl", p["imageUrl"])
                return jsonify({"success": True})
        return jsonify({"success": False, "error": "Post not found"}), 404

    elif request.method == "DELETE":
        post_id = int(request.args.get("id", 0))
        global posts
        posts = [p for p in posts if p["id"] != post_id]
        return jsonify({"success": True})

    return jsonify(posts)
