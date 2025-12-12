import { API_BASE } from "./auth.js";

export function initPosts() {
    const username = localStorage.getItem("anon_username");

    // Set header username in select.html
    const headerUsername = document.getElementById("headerUsername");
    if (headerUsername) headerUsername.innerText = username || "Anonymous";

    // Dropdown
    const dropdown = document.getElementById("usernameDropdown");
    headerUsername?.addEventListener("click", () => dropdown?.classList.toggle("show"));
    document.addEventListener("click", (e) => {
        if (!headerUsername?.contains(e.target) && !dropdown?.contains(e.target)) {
            dropdown?.classList.remove("show");
        }
    });

    // Dropdown actions
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
    document.getElementById("editPosts")?.addEventListener("click", () => {
        window.location.href = "my-posts.html";
    });

    // Create post
    const createBtn = document.getElementById("createBtn");
    const popupOverlay = document.getElementById("popupOverlay");
    const closePopup = document.getElementById("closePopup");
    const submitPost = document.getElementById("submitPost");

    createBtn?.addEventListener("click", () => popupOverlay?.classList.remove("hidden"));
    closePopup?.addEventListener("click", () => popupOverlay?.classList.add("hidden"));

    submitPost?.addEventListener("click", async () => {
        const content = document.getElementById("text")?.value.trim();
        const imageUrl = document.getElementById("imageUrl")?.value.trim();
        if (!content && !imageUrl) return alert("Post must have content or an image.");

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
            }
        } catch (err) { console.error(err); }
    });

    const searchBox = document.getElementById("searchBox");
    searchBox?.addEventListener("input", (e) => loadPosts(e.target.value));

    // Load posts
    if (window.location.pathname.endsWith("select.html")) loadPosts();
    if (window.location.pathname.endsWith("my-posts.html")) loadUserPosts(username);
}

// Load all posts for select.html
export async function loadPosts(filter = "") {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;
        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;

        container.innerHTML = "";

        const filtered = (posts || []).filter(p => {
            return (p.content || "").toLowerCase().includes(filter.toLowerCase()) ||
                   (p.username || "").toLowerCase().includes(filter.toLowerCase());
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

            const meta = document.createElement("div");
            meta.className = "post-meta";
            meta.textContent = `${post.username} — ${new Date(post.createdAt).toLocaleString()}`;
            card.appendChild(meta);

            const text = document.createElement("div");
            text.className = "post-text";
            text.textContent = post.content || "";
            card.appendChild(text);

            container.appendChild(card);
        });

    } catch (err) { console.error(err); }
}

// Load only user's posts for my-posts.html
export async function loadUserPosts(username, filter = "") {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;
        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;

        container.innerHTML = "";

        const userPosts = (posts || []).filter(p => p.username === username && 
            ((p.content || "").toLowerCase().includes(filter.toLowerCase()))
        );

        if (!userPosts.length) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">You haven't created any posts yet.</p>`;
            return;
        }

        userPosts.forEach(post => {
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
            text.textContent = post.content || "";
            card.appendChild(text);

            container.appendChild(card);
        });
    } catch (err) { console.error(err); }
}
