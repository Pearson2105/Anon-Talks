import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) window.location.href = "index.html";

    document.getElementById("headerUsername").textContent = username;

    setupDropdown();
    loadMyPosts(username);
});

let currentEditPost = null;

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
// LOAD POSTS
// ----------------------
async function loadMyPosts(username) {
    const container = document.getElementById("postsContainer");

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        const mine = posts.filter(p => p.username === username);
        mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = "";

        if (!mine.length) {
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
                    <div class="post-meta">@${p.username} • ${formatDate(p.createdAt)}</div>
                    <div>${p.content}</div>
                    <div class="post-actions" style="justify-content:flex-end;">
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
                currentEditPost = p;
                document.getElementById("editText").value = p.content;
                document.getElementById("editImageUrl").value = p.imageUrl || "";
                showPopup("editPostPopup");
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

        // ----------------------
        // EDIT MODAL BUTTONS
        // ----------------------
        document.getElementById("saveEdit").onclick = () => {
            if (!currentEditPost) return;
            const newContent = document.getElementById("editText").value.trim();
            const newImage = document.getElementById("editImageUrl").value.trim();
            currentEditPost.content = newContent;
            currentEditPost.imageUrl = newImage;
            hidePopup("editPostPopup");
            loadMyPosts(username); // refresh posts
        };

        document.getElementById("cancelEdit").onclick = () => {
            hidePopup("editPostPopup");
        };

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}

// ----------------------
// POPUP HELPERS
// ----------------------
function showPopup(id) {
    document.getElementById(id)?.classList.remove("hidden");
}

function hidePopup(id) {
    document.getElementById(id)?.classList.add("hidden");
}

// ----------------------
// DELETE POST
// ----------------------
async function deletePost(postId) {
    console.log("Deleting post", postId);
    // replace with backend API call if available
}

// ----------------------
// FORMAT DATE
// ----------------------
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()} ` +
           `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}
