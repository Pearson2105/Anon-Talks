from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import random
from datetime import datetime, timezone

app = Flask(__name__, static_folder="static")
CORS(app)

DATA_FILE = "data.json"


# ----------------------------
# DATA STORAGE
# ----------------------------
def load_data():
    if not os.path.exists(DATA_FILE):
        return {"users": [], "posts": []}
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)


# ----------------------------
# HELPER: GENERATE UNIQUE USERNAME
# ----------------------------
def generate_unique_username(existing):
    while True:
        num = random.randint(100, 999)
        username = f"Anon{num}"
        if username not in existing:
            return username


# ----------------------------
# ROUTE – GENERATE ACCOUNT
# ----------------------------
@app.route("/api/generate", methods=["GET"])
def generate_account():
    data = load_data()

    existing_usernames = [u["username"] for u in data["users"]]
    username = generate_unique_username(existing_usernames)
    password = str(random.randint(100000, 999999))

    data["users"].append({
        "username": username,
        "password": password
    })
    save_data(data)

    return jsonify({
        "username": username,
        "password": password
    })


# ----------------------------
# ROUTE – LOGIN
# ----------------------------
@app.route("/api/login", methods=["POST"])
def login():
    req = request.json
    username = req.get("username", "").strip()
    password = req.get("password", "").strip()

    data = load_data()

    for user in data["users"]:
        if user["username"] == username and user["password"] == password:
            return jsonify({"success": True})

    return jsonify({"success": False, "error": "Invalid username or password"}), 401


# ----------------------------
# ROUTE – GET POSTS
# ----------------------------
@app.route("/api/posts", methods=["GET"])
def get_posts():
    data = load_data()
    return jsonify(data["posts"][::-1])  # newest first


# ----------------------------
# ROUTE – CREATE POST
# ----------------------------
@app.route("/api/posts", methods=["POST"])
def create_post():
    req = request.json

    username = req.get("username", "").strip()
    text = req.get("content", "").strip()
    image_url = req.get("imageUrl", "").strip()

    if username == "":
        return jsonify({"error": "Username required"}), 400

    data = load_data()

    post = {
        "username": username,
        "content": text,
        "imageUrl": image_url,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

    data["posts"].append(post)
    save_data(data)

    return jsonify({"success": True})


# ----------------------------
# STATIC FILES
# ----------------------------
@app.route("/")
def home():
    return send_from_directory("", "index.html")


@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("", path)


# ----------------------------
# RUN SERVER
# ----------------------------
if __name__ == "__main__":
    app.run(debug=True)
