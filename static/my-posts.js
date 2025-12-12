import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("headerUsername").textContent = username;

    setupDropdown();
    loadMyPosts(username);
});

function setupDropdown() {
    const wrap = document.getElementById("headerWrap");
    const menu = document.getElementById("usernameDropdown");

    wrap.addEventListener("click", () => menu.classList.toggle("show"));

    document.getElementById("homeBtn").addEventListener("click", () => {
        window.location.href = "select.html";
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}

async function loadMyPosts(username) {
    const container = document.getElementById("postsContainer");

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        const mine = posts.filter(p => p.username === username)
                           .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = "";

        if (mine.length === 0) {
            container.innerHTML = `
                <div class="no-posts-box">
                    <p>No posts yet.</p>
                    <p>Do you want to go and create a post?</p>
                    <button class="big-btn purple" id="goCreate">Create Post</button>
                </div>
            `;
            document.getElementById("goCreate").addEventListener("click", () => {
                window.location.href = "select.html";
            });
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
                <div class="post-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            container.appendChild(card);

            // Buttons
            const editBtn = card.querySelector(".edit-btn");
            const deleteBtn = card.querySelector(".delete-btn");

            editBtn.addEventListener("click", () => showEditPopup(p, username));
            deleteBtn.addEventListener("click", () => showDeletePopup(p, username));
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}

// ---------------- EDIT POPUP ----------------
function showEditPopup(post, username) {
    const editModal = document.getElementById("editModalBg");
    const editText = document.getElementById("editText");
    const editImageUrl = document.getElementById("editImageUrl");
    const saveBtn = document.getElementById("saveEdit");
    const cancelBtn = document.getElementById("cancelEdit");

    editText.value = post.content;
    editImageUrl.value = post.imageUrl || "";

    editModal.classList.remove("hidden");

    const saveHandler = async () => {
        post.content = editText.value;
        post.imageUrl = editImageUrl.value;

        await fetch(`${API_BASE}/api/posts/${post.id}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(post)
        });

        editModal.classList.add("hidden");
        saveBtn.removeEventListener("click", saveHandler);
        cancelBtn.removeEventListener("click", cancelHandler);
        loadMyPosts(username);
    };

    const cancelHandler = () => {
        editModal.classList.add("hidden");
        saveBtn.removeEventListener("click", saveHandler);
        cancelBtn.removeEventListener("click", cancelHandler);
    };

    saveBtn.addEventListener("click", saveHandler);
    cancelBtn.addEventListener("click", cancelHandler);
}

// ---------------- DELETE POPUP ----------------
function showDeletePopup(post, username) {
    const deleteModal = document.getElementById("deleteModalBg");
    const confirmBtn = document.getElementById("confirmDelete");
    const cancelBtn = document.getElementById("cancelDelete");

    deleteModal.classList.remove("hidden");

    const confirmHandler = async () => {
        await fetch(`${API_BASE}/api/posts/${post.id}`, { method: "DELETE" });
        deleteModal.classList.add("hidden");
        confirmBtn.removeEventListener("click", confirmHandler);
        cancelBtn.removeEventListener("click", cancelHandler);
        loadMyPosts(username);
    };

    const cancelHandler = () => {
        deleteModal.classList.add("hidden");
        confirmBtn.removeEventListener("click", confirmHandler);
        cancelBtn.removeEventListener("click", cancelHandler);
    };

    confirmBtn.addEventListener("click", confirmHandler);
    cancelBtn.addEventListener("click", cancelHandler);
}
