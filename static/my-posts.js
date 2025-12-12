import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) return (window.location.href = "index.html");

    document.getElementById("headerUsername").textContent = username;

    setupDropdown();
    loadMyPosts(username);
});

function setupDropdown() {
    const wrap = document.getElementById("headerWrap");
    const menu = document.getElementById("usernameDropdown");

    wrap.addEventListener("click", () => menu.classList.toggle("show"));
    document.addEventListener("click", e => {
        if (!wrap.contains(e.target) && !menu.contains(e.target)) menu.classList.remove("show");
    });

    const homeBtn = document.getElementById("homeBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    homeBtn?.addEventListener("click", () => window.location.href = "select.html");
    logoutBtn?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}

async function loadMyPosts(username) {
    const container = document.getElementById("postsContainer");
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        const mine = posts
            .filter(p => p.username === username)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = mine.length ? "" : "<p>No posts yet.</p>";

        mine.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";

            if (p.imageUrl) {
                const img = document.createElement("img");
                img.src = p.imageUrl;
                img.alt = "post image";
                card.appendChild(img);
            }

            const text = document.createElement("div");
            text.className = "post-text";
            const date = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
            text.innerHTML = `<div class="post-meta">@${p.username} • ${date}</div>${p.content || ""}`;
            card.appendChild(text);

            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}
