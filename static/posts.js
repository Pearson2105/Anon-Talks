import { API_BASE } from "./auth.js";

export function initPosts() {
    const username = localStorage.getItem("anon_username") || "Anonymous";
    const headerUsernameEl = document.getElementById("headerUsername");
    if (headerUsernameEl) headerUsernameEl.textContent = username;

    setupDropdown();
    loadPosts();
    setupCreatePopup();
    setupSearch();

    function setupDropdown() {
        const wrap = document.getElementById("headerWrap");
        const menu = document.getElementById("usernameDropdown");
        if (!wrap || !menu) return;

        wrap.addEventListener("click", () => menu.classList.toggle("show"));

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });

        const editPostsBtn = document.getElementById("editPosts");
        if (editPostsBtn) editPostsBtn.addEventListener("click", () => window.location.href = "my-posts.html");
    }

    // Load all posts from backend
    async function loadPosts(filter="") {
        const container = document.getElementById("postsContainer");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/api/posts`);
            const posts = (await res.json()).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            container.innerHTML = "";
            posts.filter(p => {
                if(!filter) return true;
                return p.content.toLowerCase().includes(filter) || p.username.toLowerCase().includes(filter);
            }).forEach(p => {
                const card = document.createElement("div");
                card.className = "post-card";
                const img = p.imageUrl || "https://via.placeholder.com/180x140";
                card.innerHTML = `
                    <img src="${img}">
                    <div class="post-text">
                        <div class="post-meta">@${p.username} • ${p.createdAt}</div>
                        <div>${p.content}</div>
                    </div>
                `;
                container.appendChild(card);
            });
        } catch(e) {
            container.innerHTML = "<p>Error loading posts.</p>";
            console.error(e);
        }
    }

    // Show popup for creating new post
    function setupCreatePopup() {
        const popup = document.getElementById("popupOverlay");
        const createBtn = document.getElementById("createBtn");
        const closeBtn = document.getElementById("closePopup");
        const submitBtn = document.getElementById("submitPost");
        if (!popup || !createBtn || !closeBtn || !submitBtn) return;

        createBtn.addEventListener("click", () => popup.classList.remove("hidden"));
        closeBtn.addEventListener("click", () => popup.classList.add("hidden"));

        submitBtn.addEventListener("click", async () => {
            const textEl = document.getElementById("text");
            const imageEl = document.getElementById("imageUrl");
            const text = textEl ? textEl.value : "";
            const imageUrl = imageEl ? imageEl.value : "";
            if(!text) return alert("Post text required");

            const post = {
                username,
                content: text,
                imageUrl,
                createdAt: new Date().toLocaleString()
            };
            try {
                await fetch(`${API_BASE}/api/posts`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(post)
                });
                popup.classList.add("hidden");
                if (textEl) textEl.value = "";
                if (imageEl) imageEl.value = "";
                loadPosts();
            } catch(e) { console.error(e); }
        });
    }

    // Search filter
    function setupSearch() {
        const search = document.getElementById("searchBox");
        if (!search) return;
        search.addEventListener("input", e => loadPosts(e.target.value.toLowerCase()));
    }
}
