import { API_BASE } from "./auth.js";

export function initPosts() {
    const pathname = window.location.pathname.split("/").pop();
    const username = localStorage.getItem("anon_username");

    // Only load posts if select.html or my-posts.html
    if (pathname === "select.html") loadPosts();
    if (pathname === "my-posts.html" && username) loadUserPosts(username);
}

// Load all posts
export async function loadPosts(filter = "") {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;
        const posts = await res.json();

        const container = document.getElementById("postsContainer");
        if (!container) return;
        container.innerHTML = "";

        const filtered = posts.filter(p => (p.content || "").toLowerCase().includes(filter.toLowerCase()));
        if (!filtered.length) container.innerHTML = `<p>No posts found.</p>`;

        filtered.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";
            card.innerHTML = `
                ${p.imageUrl ? `<img src="${p.imageUrl}" alt="post image">` : ""}
                <div class="post-meta">${new Date(p.createdAt).toLocaleString()}</div>
                <div class="post-text">${p.content || ""}</div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

// Load user posts
export async function loadUserPosts(username) {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;
        const posts = await res.json();

        const container = document.getElementById("postsContainer");
        if (!container) return;
        container.innerHTML = "";

        const userPosts = posts.filter(p => p.username === username);
        if (!userPosts.length) container.innerHTML = `<p>You haven't made any posts yet.</p>`;

        userPosts.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";
            card.innerHTML = `
                ${p.imageUrl ? `<img src="${p.imageUrl}" alt="post image">` : ""}
                <div class="post-meta">${new Date(p.createdAt).toLocaleString()}</div>
                <div class="post-text">${p.content || ""}</div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}
