// static/my-posts.js
import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    // Show username
    const headerUsernameEl = document.getElementById("headerUsername");
    if (headerUsernameEl) headerUsernameEl.textContent = username;

    setupDropdown();
    loadMyPosts(username);
});

function setupDropdown() {
    const wrap = document.getElementById("headerWrap");
    const menu = document.getElementById("usernameDropdown");

    wrap.addEventListener("click", () => menu.classList.toggle("show"));

    document.getElementById("homeBtn").addEventListener("click", () => {
        window.location.href = "select.html";
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}

async function loadMyPosts(username) {
    const container = document.getElementById("postsContainer");

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        // Only user’s posts, newest first
        const mine = posts.filter(p => p.username === username)
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = "";

        if (mine.length === 0) {
            container.innerHTML = `
                <div class="no-posts-box">
                    <p>No posts yet.</p>
                    <p>Do you want to go and create a post?</p>
                    <button class="big-btn purple" id="goCreate">Create Post</button>
                </div>
            `;
            document.getElementById("goCreate").addEventListener("click", () => {
                window.location.href = "select.html";
            });
            return;
        }

        mine.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";

            const img = p.imageUrl || "https://via.placeholder.com/180x140";

            card.innerHTML = `
                <img src="${img}">
                <div class="post-text">
                    <div class="post-meta">@${p.username} • ${new Date(p.createdAt).toLocaleString()}</div>
                    <div>${p.content}</div>
                </div>
                <div class="post-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            container.appendChild(card);

            const editBtn = card.querySelector(".edit-btn");
            const deleteBtn = card.querySelector(".delete-btn");

            // ----------------------
            // EDIT POST
            // ----------------------
            editBtn.addEventListener("click", () => {
                const newText = prompt("Edit post text:", p.content);
                if (newText !== null) {
                    p.content = newText;
                    fetch(`${API_BASE}/api/posts`, {
                        method: "POST",  // backend needs PATCH ideally
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(p)
                    }).then(() => loadMyPosts(username));
                }
            });

            // ----------------------
            // DELETE POST
            // ----------------------
            deleteBtn.addEventListener("click", () => {
                if (confirm("Delete this post?")) {
                    fetch(`${API_BASE}/api/posts`, {
                        method: "DELETE",  // backend needs DELETE endpoint
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: p.id })
                    }).then(() => loadMyPosts(username));
                }
            });
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}
