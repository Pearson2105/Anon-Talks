import { API_BASE } from "./auth.js";

// Run only on select.html
document.addEventListener("DOMContentLoaded", () => {
    console.log("select.js loaded");

    const username = localStorage.getItem("anon_username");
    const password = localStorage.getItem("anon_password");

    if (!username || !password) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("headerUsername").textContent = username;

    setupDropdown();
    loadPosts();
    setupCreatePost(username);
    setupSearch();
});


// ----------------------
// DROPDOWN
// ----------------------
function setupDropdown() {
    const wrap = document.getElementById("headerWrap");
    const menu = document.getElementById("usernameDropdown");

    wrap.addEventListener("click", () => {
        menu.classList.toggle("show");
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

    document.getElementById("editPosts").addEventListener("click", () => {
        window.location.href = "my-posts.html";
    });
}


// ----------------------
// LOAD ALL POSTS
// ----------------------
async function loadPosts() {
    const container = document.getElementById("postsContainer");

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        container.innerHTML = "";

        posts.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";

            const img = p.imageUrl ? p.imageUrl : "https://via.placeholder.com/180x140";

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
        console.error("Failed loading posts", err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}


// ----------------------
// CREATE POST
// ----------------------
function setupCreatePost(username) {
    const openBtn = document.getElementById("createBtn");
    const closeBtn = document.getElementById("closePopup");
    const popup = document.getElementById("popupOverlay");
    const submit = document.getElementById("submitPost");

    openBtn.addEventListener("click", () => popup.classList.remove("hidden"));
    closeBtn.addEventListener("click", () => popup.classList.add("hidden"));

    submit.addEventListener("click", async () => {
        const text = document.getElementById("text").value.trim();
        const imageUrl = document.getElementById("imageUrl").value.trim();

        if (!text) return;

        await fetch(`${API_BASE}/api/posts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                content: text,
                imageUrl
            })
        });

        popup.classList.add("hidden");
        loadPosts();
    });
}


// ----------------------
// SEARCH FILTER
// ----------------------
function setupSearch() {
    const box = document.getElementById("searchBox");

    box.addEventListener("input", () => {
        const value = box.value.toLowerCase();
        const cards = document.querySelectorAll(".post-card");

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(value) ? "flex" : "none";
        });
    });
}
