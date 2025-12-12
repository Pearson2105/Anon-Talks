# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import string
from datetime import datetime

app = Flask(__name__)
CORS(app)  # allow frontend JS to call API

# In-memory "database" for testing
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

@app.route("/api/posts", methods=["GET", "POST"])
def handle_posts():
    if request.method == "POST":
        data = request.get_json()
        now = datetime.utcnow()  # current UTC time
        timestamp = now.strftime("%d/%m/%Y %H:%M:%S")  # dd/mm/yyyy hh:mm:ss format

        posts.append({
            "id": len(posts) + 1,
            "username": data.get("username"),
            "content": data.get("content"),
            "imageUrl": data.get("imageUrl"),
            "createdAt": timestamp
        })
        return jsonify({"success": True})
    return jsonify(posts)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
