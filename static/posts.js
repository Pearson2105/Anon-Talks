import { API_BASE } from "./auth.js";

export function initPosts() {
    const username = localStorage.getItem("anon_username") || "Anonymous";
    const headerUsername = document.getElementById("headerUsername");
    const dropdown = document.getElementById("usernameDropdown");

    if (headerUsername) headerUsername.textContent = username;

    headerUsername?.addEventListener("click", () => dropdown?.classList.toggle("show"));
    document.addEventListener("click", e => {
        if (!headerUsername?.contains(e.target) && !dropdown?.contains(e.target)) {
            dropdown?.classList.remove("show");
        }
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

    document.getElementById("editPosts")?.addEventListener("click", () => {
        window.location.href = "my-posts.html";
    });

    // CREATE POST POPUP
    const popupOverlay = document.getElementById("popupOverlay");
    document.getElementById("createBtn")?.addEventListener("click", () => popupOverlay?.classList.remove("hidden"));
    document.getElementById("closePopup")?.addEventListener("click", () => popupOverlay?.classList.add("hidden"));
    document.getElementById("submitPost")?.addEventListener("click", async () => {
        const content = document.getElementById("text")?.value.trim();
        const imageUrl = document.getElementById("imageUrl")?.value.trim();
        if (!content && !imageUrl) return alert("Post must have content or image.");

        try {
            const res = await fetch(`${API_BASE}/api/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, content, imageUrl })
            });
            if (res.ok) {
                document.getElementById("text").value = "";
                document.getElementById("imageUrl").value = "";
                popupOverlay?.classList.add("hidden");
                loadPosts();
            } else alert("Failed to create post.");
        } catch (err) { console.error(err); }
    });

    document.getElementById("searchBox")?.addEventListener("input", e => loadPosts(e.target.value));

    // Initial posts load
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

        const filtered = (posts || []).filter(p => {
            const content = (p.content || "").toString().toLowerCase();
            const user = (p.username || "").toLowerCase();
            return content.includes(filter.toLowerCase()) || user.includes(filter.toLowerCase());
        });

        if (!filtered.length) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">No posts found.</p>`;
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

            const textDiv = document.createElement("div");
            textDiv.className = "post-text";
            textDiv.textContent = post.content || "";
            card.appendChild(textDiv);

            const metaDiv = document.createElement("div");
            metaDiv.className = "post-meta";
            metaDiv.textContent = `${post.username || ""} — ${new Date(post.createdAt || post.created_at).toLocaleString()}`;
            card.appendChild(metaDiv);

            container.appendChild(card);
        });

    } catch (err) { console.error(err); }
}
