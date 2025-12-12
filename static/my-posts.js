import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) return window.location.href = "index.html";

    document.getElementById("headerUsername").textContent = username;
    setupDropdown();
    loadMyPosts(username);
});

function setupDropdown() {
    const wrap = document.getElementById("headerWrap");
    const menu = document.getElementById("usernameDropdown");
    wrap.addEventListener("click", () => menu.classList.toggle("show"));

    document.getElementById("homeBtn").addEventListener("click", () => window.location.href = "select.html");
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}

async function loadMyPosts(username) {
    const container = document.getElementById("postsContainer");
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = (await res.json())
                        .filter(p => p.username === username)
                        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = "";

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="no-posts-box">
                    <p>No posts yet.</p>
                    <p>Do you want to go and create a post?</p>
                    <button class="big-btn purple" id="goCreate">Create Post</button>
                </div>
            `;
            document.getElementById("goCreate").addEventListener("click", () => window.location.href="select.html");
            return;
        }

        posts.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";
            const img = p.imageUrl || "https://via.placeholder.com/180x140";

            card.innerHTML = `
                <img src="${img}">
                <div class="post-text">
                    <div class="post-meta">@${p.username} • ${p.createdAt}</div>
                    <div>${p.content}</div>
                </div>
                <div class="post-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            container.appendChild(card);

            // EDIT
            card.querySelector(".edit-btn").addEventListener("click", async () => {
                const newText = prompt("Edit post text:", p.content);
                if (newText !== null) {
                    await fetch(`${API_BASE}/api/posts`, {
                        method: "PATCH",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({id: p.id, content: newText, imageUrl: p.imageUrl})
                    });
                    loadMyPosts(username);
                }
            });

            // DELETE
            card.querySelector(".delete-btn").addEventListener("click", async () => {
                if (confirm("Delete this post?")) {
                    await fetch(`${API_BASE}/api/posts`, {
                        method: "DELETE",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({id: p.id})
                    });
                    loadMyPosts(username);
                }
            });
        });

    } catch(e) {
        console.error(e);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}
