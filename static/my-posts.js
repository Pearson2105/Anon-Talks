import { API_BASE } from "./auth.js";

export function initMyPosts() {
    console.log("initMyPosts running");

    const username = localStorage.getItem("anon_username");
    const password = localStorage.getItem("anon_password");

    if (!username || !password) {
        window.location.href = "index.html";
        return;
    }

    const headerUser = document.getElementById("headerUsername");
    if (headerUser) headerUser.textContent = username;

    setupDropdown();
    loadMyPosts(username);
}

/* --------------------------------------
   DROPDOWN MENU
--------------------------------------- */
function setupDropdown() {
    const wrap = document.getElementById("headerWrap");
    const menu = document.getElementById("usernameDropdown");

    if (!wrap || !menu) return;

    wrap.addEventListener("click", () => {
        menu.classList.toggle("show");
    });

    const homeBtn = document.getElementById("homeBtn");
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "select.html";
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }
}

/* --------------------------------------
   LOAD ONLY USER'S POSTS
--------------------------------------- */
async function loadMyPosts(username) {
    const container = document.getElementById("postsContainer");
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        const mine = posts.filter(p => p.username === username);

        container.innerHTML = "";

        if (mine.length === 0) {
            container.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        mine.forEach(p => {
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

    } catch (err) {
        console.error("Failed to load posts", err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}
