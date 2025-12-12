import { API_BASE } from "./auth.js";

let editingPostId = null;

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    const password = localStorage.getItem("anon_password");

    if (!username || !password) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("headerUsername").textContent = username;

    setupDropdown();
    loadUserPosts(username);
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

    document.getElementById("homeBtn").addEventListener("click", () => {
        window.location.href = "select.html";
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}

// ----------------------
// LOAD USER POSTS
// ----------------------
async function loadUserPosts(username) {
    const container = document.getElementById("postsContainer");

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        const userPosts = posts.filter(p => p.username === username)
                               .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = "";

        if (userPosts.length === 0) {
            container.innerHTML = "<p style='text-align:center;margin-top:40px;'>No posts yet.</p>";
            return;
        }

        userPosts.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";

            card.innerHTML = `
                <img src="${p.imageUrl || 'https://via.placeholder.com/180x140'}">
                <div class="post-text">
                    <div class="post-meta">@${p.username} • ${new Date(p.createdAt).toLocaleString()}</div>
                    <div>${p.content}</div>
                    <div class="post-actions" style="justify-content:flex-end;">
                        <button class="edit-btn big-btn purple">Edit</button>
                        <button class="delete-btn big-btn" style="background:#e74c3c;">Delete</button>
                    </div>
                </div>
            `;

            const editBtn = card.querySelector(".edit-btn");
            const delBtn = card.querySelector(".delete-btn");

            editBtn.addEventListener("click", () => openEditPopup(p));
            delBtn.addEventListener("click", () => deletePost(p.id, username));

            container.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}

// ----------------------
// EDIT POST
// ----------------------
function openEditPopup(post) {
    editingPostId = post.id;
    document.getElementById("editText").value = post.content || "";
    document.getElementById("editImageUrl").value = post.imageUrl || "";
    document.getElementById("editPopup").classList.remove("hidden");

    document.getElementById("cancelEdit").onclick = () => {
        editingPostId = null;
        document.getElementById("editPopup").classList.add("hidden");
    };

    document.getElementById("saveEdit").onclick = async () => {
        const newText = document.getElementById("editText").value.trim();
        const newImage = document.getElementById("editImageUrl").value.trim();
        if (!editingPostId) return;

        try {
            const res = await fetch(`${API_BASE}/api/posts/${editingPostId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newText, imageUrl: newImage })
            });
            if (res.ok) {
                document.getElementById("editPopup").classList.add("hidden");
                loadUserPosts(localStorage.getItem("anon_username"));
            } else {
                alert("Failed to save edit.");
            }
        } catch (err) {
            console.error(err);
        }
    };
}

// ----------------------
// DELETE POST
// ----------------------
async function deletePost(id, username) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const res = await fetch(`${API_BASE}/api/posts/${id}`, { method: "DELETE" });
        if (res.ok) loadUserPosts(username);
        else alert("Failed to delete post.");
    } catch (err) {
        console.error(err);
    }
}
