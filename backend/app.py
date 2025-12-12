# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import string
from datetime import datetime

app = Flask(__name__)
CORS(app)

users = {}  # username: password
posts = []  # list of posts

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

@app.route("/api/posts", methods=["GET", "POST", "PATCH", "DELETE"])
def handle_posts():
    global posts
    if request.method == "GET":
        return jsonify(posts)

    data = request.get_json()

    # -------------------
    # CREATE POST
    # -------------------
    if request.method == "POST":
        post = {
            "id": len(posts) + 1,
            "username": data.get("username"),
            "content": data.get("content"),
            "imageUrl": data.get("imageUrl"),
            "createdAt": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        }
        posts.append(post)
        return jsonify({"success": True, "post": post})

    # -------------------
    # EDIT POST
    # -------------------
    if request.method == "PATCH":
        post_id = data.get("id")
        for p in posts:
            if p["id"] == post_id:
                p["content"] = data.get("content", p["content"])
                p["imageUrl"] = data.get("imageUrl", p["imageUrl"])
                return jsonify({"success": True, "post": p})
        return jsonify({"success": False, "error": "Post not found"}), 404

    # -------------------
    # DELETE POST
    # -------------------
    if request.method == "DELETE":
        post_id = data.get("id")
        posts = [p for p in posts if p["id"] != post_id]
        return jsonify({"success": True})
