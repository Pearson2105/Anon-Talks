import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("my-posts loaded");

    const user = localStorage.getItem("anon_username");
    const pw = localStorage.getItem("anon_password");

    // If not logged in → back to index
    if (!user || !pw) {
        window.location.href = "index.html";
        return;
    }

    // Set header username
    const header = document.getElementById("headerUsername");
    if (header) header.textContent = user;

    // Dropdown toggle
    const headerWrap = document.getElementById("headerWrap");
    const dropdown = document.getElementById("usernameDropdown");

    headerWrap.addEventListener("click", () => {
        dropdown.classList.toggle("show");
    });

    // HOME BUTTON → go back to select.html
    const homeBtn = document.getElementById("homeBtn");
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "select.html";
        });
    }

    // LOG OUT BUTTON
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }

    // Load ONLY user's own posts
    loadMyPosts(user);
});

async function loadMyPosts(username) {
    const postsContainer = document.getElementById("postsContainer");

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        const mine = posts.filter(p => p.username === username);

        postsContainer.innerHTML = "";

        if (mine.length === 0) {
            postsContainer.innerHTML = `<p>No posts yet.</p>`;
            return;
        }

        mine.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            card.innerHTML = `
                <img src="${post.image || "https://via.placeholder.com/150"}" />
                <div class="post-text">
                    <div class="post-meta">@${post.username}</div>
                    <div>${post.text}</div>
                </div>
            `;

            postsContainer.appendChild(card);
        });

    } catch (e) {
        console.error("Failed to load posts", e);
    }
}
