document.addEventListener("DOMContentLoaded", () => {
    loadMyPosts();
});

function loadMyPosts() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Not logged in");

    const posts = JSON.parse(localStorage.getItem("posts") || "[]")
        .filter(p => p.username === user.username);

    $("my-posts-container").innerHTML = posts.length === 0
        ? "<p>You have no posts yet.</p>"
        : posts.map(p => `
            <div class="my-post-card">
                <div class="post-title">${p.title}</div>
                <div class="post-body">${p.body}</div>
                <br>
                <button class="edit-btn" onclick="editPost(${p.id})">Edit</button>
                <button class="delete-btn" onclick="deletePost(${p.id})">Delete</button>
            </div>
        `).join("");
}

function deletePost(id) {
    let posts = JSON.parse(localStorage.getItem("posts") || "[]");
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem("posts", JSON.stringify(posts));
    loadMyPosts();
}

function editPost(id) {
    const newBody = prompt("Edit your post:");
    if (newBody === null) return;

    let posts = JSON.parse(localStorage.getItem("posts") || "[]");

    const index = posts.findIndex(p => p.id === id);
    posts[index].body = newBody;

    localStorage.setItem("posts", JSON.stringify(posts));
    loadMyPosts();
}
