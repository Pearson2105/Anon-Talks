import { API_BASE } from "./auth.js";

export function initPosts() {
    const pathname = window.location.pathname.split("/").pop();
    const username = localStorage.getItem("anon_username");

    if (!username && pathname !== "index.html") {
        window.location.href = "index.html";
        return;
    }

    if (pathname === "select.html") {
        loadPosts();
    } else if (pathname === "my-posts.html") {
        loadUserPosts(username);
    }
}

export async function loadPosts(filter = "") {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;

        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;
        container.innerHTML = "";

        const filteredPosts = posts.filter(p =>
            (p.content || "").toLowerCase().includes(filter.toLowerCase())
        );

        if (!filteredPosts.length) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">No posts found.</p>`;
            return;
        }

        filteredPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            if (post.imageUrl) {
                const img = document.createElement("img");
                img.src = post.imageUrl;
                card.appendChild(img);
            }

            const text = document.createElement("div");
            text.className = "post-text";
            text.textContent = post.content || "";
            card.appendChild(text);

            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

export async function loadUserPosts(username) {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;

        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;

        const userPosts = posts.filter(p => p.username === username);
        container.innerHTML = "";

        if (!userPosts.length) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">You haven't made any posts yet.</p>`;
            return;
        }

        userPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            if (post.imageUrl) {
                const img = document.createElement("img");
                img.src = post.imageUrl;
                card.appendChild(img);
            }

            const text = document.createElement("div");
            text.className = "post-text";
            text.textContent = post.content || "";
            card.appendChild(text);

            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}
