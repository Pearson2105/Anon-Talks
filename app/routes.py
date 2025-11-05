from flask import Blueprint, request, jsonify, current_app, send_from_directory
from .models import db, Post
import os, secrets
from werkzeug.utils import secure_filename

bp = Blueprint("api", __name__)

def random_name():
    return "Anon" + secrets.token_hex(3)

def allowed(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@bp.route('/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created.desc()).all()
    data = [{
        "id": p.id,
        "username": p.username,
        "text": p.text,
        "image": p.image,
        "likes": p.likes,
        "dislikes": p.dislikes,
        "created": p.created.isoformat()
    } for p in posts]
    return jsonify(data)

@bp.route('/api/posts', methods=['POST'])
def new_post():
    username = random_name()
    text = request.form.get("text")
    image_file = request.files.get("image")
    filename = None
    if image_file and allowed(image_file.filename):
        filename = secure_filename(image_file.filename)
        path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        image_file.save(path)
    post = Post(username=username, text=text, image=filename)
    db.session.add(post)
    db.session.commit()
    return jsonify({"message": "Post created"})

@bp.route('/api/posts/<int:post_id>/react', methods=['POST'])
def react(post_id):
    data = request.get_json()
    kind = data.get("kind")
    post = Post.query.get_or_404(post_id)
    if kind == "like":
        post.likes += 1
    else:
        post.dislikes += 1
    db.session.commit()
    return jsonify({"likes": post.likes, "dislikes": post.dislikes})

@bp.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
