import { API_BASE } from "./auth.js";

export function initPosts() {
    const postsContainer = document.getElementById("postsContainer");
    const createBtn = document.getElementById("createBtn");
    const popup = document.getElementById("popupOverlay");
    const closePopup = document.getElementById("closePopup");
    const submitPost = document.getElementById("submitPost");
    const searchBox = document.getElementById("searchBox");
    const username = localStorage.getItem("anon_username");

    async function loadPosts(filter="") {
        try {
            const res = await fetch(`${API_BASE}/api/posts`);
            if (!res.ok) return;
            const posts = await res.json();

            postsContainer.innerHTML = "";
            const filtered = (posts || []).filter(p => {
                const text = (p.content || "").toLowerCase();
                const user = (p.username || "").toLowerCase();
                const f = filter.toLowerCase();
                return text.includes(f) || user.includes(f);
            });

            if (filtered.length === 0) {
                postsContainer.innerHTML = `<p style="text-align:center;margin-top:40px;">No posts found.</p>`;
                return;
            }

            filtered.forEach(post => {
                const card = document.createElement("div");
                card.className = "post-card";

                if (post.imageUrl) {
                    const img = document.createElement("img");
                    img.src = post.imageUrl;
                    img.alt = "post image";
                    card.appendChild(img);
                }

                const meta = document.createElement("div");
                meta.className = "post-meta";
                meta.textContent = `${post.username} — ${new Date(post.createdAt).toLocaleString()}`;
                card.appendChild(meta);

                const text = document.createElement("div");
                text.className = "post-text";
                text.textContent = post.content;
                card.appendChild(text);

                postsContainer.appendChild(card);
            });
        } catch (err) { console.error(err); }
    }

    loadPosts();
    searchBox?.addEventListener("input", e => loadPosts(e.target.value));

    createBtn?.addEventListener("click", () => popup.classList.remove("hidden"));
    closePopup?.addEventListener("click", () => popup.classList.add("hidden"));

    submitPost?.addEventListener("click", async () => {
        const content = document.getElementById("text").value.trim();
        const imageUrl = document.getElementById("imageUrl").value.trim();
        if (!content && !imageUrl) return alert("Post must have text or image.");

        try {
            const res = await fetch(`${API_BASE}/api/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, content, imageUrl })
            });

            if (res.ok) {
                popup.classList.add("hidden");
                document.getElementById("text").value = "";
                document.getElementById("imageUrl").value = "";
                loadPosts();
            } else {
                const err = await res.json().catch(()=>null);
                alert("Failed to create post." + (err?.error ? " " + err.error : ""));
            }
        } catch (err) { console.error(err); }
    });
}
