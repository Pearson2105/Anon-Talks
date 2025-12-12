import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("my-posts loaded");

    const username = localStorage.getItem("anon_username");
    const password = localStorage.getItem("anon_password");

    if (!username || !password) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("headerUsername").textContent = username;

    setupDropdown();
    loadMyPosts(username);
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

    document.getElementById("homeBtn")?.addEventListener("click", () => {
        window.location.href = "select.html";
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}

// ----------------------
// LOAD ONLY USER POSTS
// ----------------------
async function loadMyPosts(username) {
    const container = document.getElementById("postsContainer");

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        // Filter posts by current user
        const mine = posts.filter(p => p.username === username);

        // Sort posts by createdAt descending (latest first)
        mine.sort((a, b) => new Date(b.createdAt.split("/").reverse().join("-")) - new Date(a.createdAt.split("/").reverse().join("-")));

        container.innerHTML = "";

        if (mine.length === 0) {
            container.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        mine.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";

            const imgSrc = p.imageUrl || "https://via.placeholder.com/180x140";

            card.innerHTML = `
                <img src="${imgSrc}">
                <div class="post-text">
                    <div class="post-meta">@${p.username} • ${p.createdAt}</div>
                    <div>${p.content}</div>
                    <div class="post-actions">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                </div>
            `;

            container.appendChild(card);

            // ----------------------
            // EDIT BUTTON
            // ----------------------
            card.querySelector(".edit-btn").addEventListener("click", () => {
                const newContent = prompt("Edit your post:", p.content);
                const newImage = prompt("Edit image URL (optional):", p.imageUrl || "");
                if (newContent !== null) {
                    p.content = newContent;
                    p.imageUrl = newImage;
                    // Update post on backend
                    updatePost(p.id, p);
                    card.querySelector(".post-text > div:nth-child(2)").textContent = newContent;
                    card.querySelector("img").src = newImage || "https://via.placeholder.com/180x140";
                }
            });

            // ----------------------
            // DELETE BUTTON
            // ----------------------
            card.querySelector(".delete-btn").addEventListener("click", () => {
                if (confirm("Are you sure you want to delete this post?")) {
                    deletePost(p.id);
                    card.remove();
                }
            });
        });

    } catch (err) {
        console.error("Failed to load posts", err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}

// ----------------------
// BACKEND UPDATE FUNCTIONS
// ----------------------
async function updatePost(postId, data) {
    // Replace with actual API call if backend supports edit
    console.log(`Updating post ${postId}`, data);
    // For now, just updating in memory
}

async function deletePost(postId) {
    // Replace with actual API call if backend supports delete
    console.log(`Deleting post ${postId}`);
    // For now, just removing from memory
}
