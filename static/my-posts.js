import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("my-posts loaded");

    const username = localStorage.getItem("anon_username");
    const password = localStorage.getItem("anon_password");

    // If user not logged in
    if (!username || !password) {
        window.location.href = "index.html";
        return;
    }

    // Set username in header
    document.getElementById("headerUsername").textContent = username;

    // ---- DROPDOWN ----
    const headerWrap = document.getElementById("headerWrap");
    const dropdown = document.getElementById("usernameDropdown");

    headerWrap.addEventListener("click", () => {
        dropdown.classList.toggle("show");
    });

    // HOME BUTTON
    document.getElementById("homeBtn").addEventListener("click", () => {
        window.location.href = "select.html";
    });

    // LOGOUT BUTTON
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

    // Load posts
    loadMyPosts(username);
});


// -------------------------------------------
// LOAD ONLY USER'S POSTS
// -------------------------------------------
async function loadMyPosts(username) {
    const postsContainer = document.getElementById("postsContainer");

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const allPosts = await res.json();

        console.log("Loaded posts:", allPosts);

        const mine = allPosts.filter(p => p.username === username);

        postsContainer.innerHTML = "";

        if (mine.length === 0) {
            postsContainer.innerHTML = `<p>No posts yet.</p>`;
            return;
        }

        mine.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            const img = post.imageUrl && post.imageUrl !== "" 
                ? post.imageUrl 
                : "https://via.placeholder.com/180x140?text=No+Image";

            card.innerHTML = `
                <img src="${img}">
                <div class="post-text">
                    <div class="post-meta">@${post.username} • ${new Date(post.createdAt).toLocaleString()}</div>
                    <div>${post.content}</div>
                </div>
            `;

            postsContainer.appendChild(card);
        });

    } catch (err) {
        console.error("Failed to load posts", err);
        postsContainer.innerHTML = "<p>Error loading posts.</p>";
    }
}
