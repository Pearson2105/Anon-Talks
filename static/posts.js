import { API_BASE } from "./auth.js";

export function initPosts() {
    console.log("initPosts running");

    const isSelectPage = window.location.pathname.includes("select.html");

    if (!isSelectPage) {
        console.log("Not on select.html — skipping feed setup");
        return;
    }

    const username = localStorage.getItem("anon_username");
    const password = localStorage.getItem("anon_password");

    if (!username || !password) {
        window.location.href = "index.html";
        return;
    }

    // Set username in top-left
    const headerUser = document.getElementById("headerUsername");
    if (headerUser) headerUser.textContent = username;

    setupDropdown();
    setupCreatePost();
    setupSearch();

    loadAllPosts();
}

/* --------------------------------------
   DROPDOWN MENU
--------------------------------------- */
function setupDropdown() {
    const wrap = document.getElementById("headerWrap");
    const menu = document.getElementById("usernameDropdown");
    const logoutBtn = document.getElementById("logoutBtn");
    const editPostsBtn = document.getElementById("editPosts");

    if (!wrap || !menu) return;

    wrap.addEventListener("click", () => {
        menu.classList.toggle("show");
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }

    if (editPostsBtn) {
        editPostsBtn.addEventListener("click", () => {
            window.location.href = "my-posts.html";
        });
    }
}

/* --------------------------------------
   LOAD ALL POSTS
--------------------------------------- */
async function loadAllPosts() {
    const container = document.getElementById("postsContainer");
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        window._ALL_POSTS = posts; // for filtering
        renderPosts(posts);

    } catch (err) {
        console.error("Failed to load posts", err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}

function renderPosts(posts) {
    const container = document.getElementById("postsContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!posts.length) {
        container.innerHTML = "<p>No posts available.</p>";
        return;
    }

    posts.forEach(p => {
        const card = document.createElement("div");
        card.className = "post-card";

        const img = p.imageUrl || "https://via.placeholder.com/180x140";

        card.innerHTML = `
            <img src="${img}">
            <div class="post-text">
                <div class="post-meta">@${p.username} • ${new Date(p.createdAt).toLocaleString()}</div>
                <div>${p.content}</div>
            </div>
        `;

        container.appendChild(card);
    });
}

/* --------------------------------------
   SEARCH FILTER
--------------------------------------- */
function setupSearch() {
    const box = document.getElementById("searchBox");
    if (!box) return;

    box.addEventListener("input", () => {
        const term = box.value.toLowerCase();
        const posts = window._ALL_POSTS || [];

        const filtered = posts.filter(p =>
            p.content.toLowerCase().includes(term) ||
            p.username.toLowerCase().includes(term)
        );

        renderPosts(filtered);
    });
}

/* --------------------------------------
   CREATE POST POPUP
--------------------------------------- */
function setupCreatePost() {
    const btn = document.getElementById("createBtn");
    const overlay = document.getElementById("popupOverlay");
    const closeBtn = document.getElementById("closePopup");
    const submitBtn = document.getElementById("submitPost");

    if (!btn || !overlay) return;

    btn.addEventListener("click", () => overlay.classList.remove("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));

    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            const content = document.getElementById("text").value.trim();
            const imageUrl = document.getElementById("imageUrl").value.trim();

            const username = localStorage.getItem("anon_username");
            const password = localStorage.getItem("anon_password");

            if (!content) return;

            try {
                await fetch(`${API_BASE}/api/posts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, content, imageUrl })
                });

                overlay.classList.add("hidden");
                loadAllPosts();

            } catch (err) {
                console.error("Post failed", err);
            }
        });
    }
}
