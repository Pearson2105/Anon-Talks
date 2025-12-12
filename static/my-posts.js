import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("headerUsername").textContent = username;

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
    container.innerHTML = "";

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();
        const mine = posts.filter(p => p.username === username)
                           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (mine.length === 0) {
            container.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        mine.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";
            card.dataset.postId = p.id;

            card.innerHTML = `
                <img src="${p.imageUrl || 'https://via.placeholder.com/180x140'}">
                <div class="post-text">
                    <div class="post-meta">@${p.username} • ${p.createdAt}</div>
                    <div class="post-content">${p.content}</div>
                </div>
                <div class="post-buttons">
                    <button class="edit-btn small-btn">Edit</button>
                    <button class="delete-btn small-btn">Delete</button>
                </div>
            `;

            container.appendChild(card);
        });

        setupPostButtons();
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}

// ------------------ POST BUTTONS ------------------
function setupPostButtons() {
    const editModal = document.getElementById("editModalBg");
    const deleteModal = document.getElementById("deleteModalBg");

    let currentPostId = null;

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const card = e.target.closest(".post-card");
            currentPostId = card.dataset.postId;

            const content = card.querySelector(".post-content").textContent;
            const img = card.querySelector("img").src;

            document.getElementById("editText").value = content;
            document.getElementById("editImageUrl").value = img.includes("placeholder") ? "" : img;

            editModal.classList.remove("hidden");
        });
    });

    document.getElementById("cancelEdit").addEventListener("click", () => {
        editModal.classList.add("hidden");
    });

    document.getElementById("saveEdit").addEventListener("click", async () => {
        const content = document.getElementById("editText").value;
        const imageUrl = document.getElementById("editImageUrl").value;

        try {
            await fetch(`${API_BASE}/api/posts/${currentPostId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, imageUrl })
            });
            editModal.classList.add("hidden");
            loadMyPosts(localStorage.getItem("anon_username"));
        } catch (err) {
            console.error(err);
        }
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const card = e.target.closest(".post-card");
            currentPostId = card.dataset.postId;
            deleteModal.classList.remove("hidden");
        });
    });

    document.getElementById("cancelDelete").addEventListener("click", () => {
        deleteModal.classList.add("hidden");
    });

    document.getElementById("confirmDelete").addEventListener("click", async () => {
        try {
            await fetch(`${API_BASE}/api/posts/${currentPostId}`, { method: "DELETE" });
            deleteModal.classList.add("hidden");
            loadMyPosts(localStorage.getItem("anon_username"));
        } catch (err) {
            console.error(err);
        }
    });
}
