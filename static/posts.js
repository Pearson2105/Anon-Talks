import { API_BASE } from "./auth.js";
import { initDropdown } from "./popups.js";

export function initPosts() {
    const username = localStorage.getItem("anon_username");
    if (username) document.getElementById("headerUsername")?.innerText = username;

    initDropdown();

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

    document.getElementById("editPosts")?.addEventListener("click", () => {
        window.location.href = "my-posts.html";
    });

    document.getElementById("homeBtn")?.addEventListener("click", () => {
        window.location.href = "select.html";
    });

    document.getElementById("submitPost")?.addEventListener("click", async () => {
        const content = document.getElementById("text")?.value.trim();
        const imageUrl = document.getElementById("imageUrl")?.value.trim();
        if (!content && !imageUrl) return alert("Post must have content or image.");

        try {
            await fetch(`${API_BASE}/api/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, content, imageUrl })
            });
            document.getElementById("popupOverlay")?.classList.add("hidden");
            document.getElementById("text").value = "";
            document.getElementById("imageUrl").value = "";
            loadPosts();
        } catch (err) { console.error(err); }
    });

    loadPosts();
}

export async function loadPosts(filter = "") {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;
        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;
        container.innerHTML = "";

        const filteredPosts = (posts || []).filter(p =>
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

            const meta = document.createElement("div");
            meta.className = "post-meta";
            meta.textContent = post.createdAt || "";
            card.appendChild(meta);

            container.appendChild(card);
        });
    } catch (err) { console.error(err); }
}
