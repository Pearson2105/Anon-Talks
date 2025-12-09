document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) {
        window.location.href = "/select.html";
        return;
    }

    // HEADER DROPDOWN
    const headerUsername = document.getElementById("headerUsername");
    const dropdown = document.getElementById("usernameDropdown");
    headerUsername.innerText = username;

    headerUsername.addEventListener("click", () => dropdown.classList.toggle("show"));
    document.addEventListener("click", (e) => {
        if (!headerUsername.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/select.html";
    });

    // REDIRECT DROPDOWN
    const editPostsBtn = document.getElementById("editPostsBtn");
    if (editPostsBtn) {
        editPostsBtn.addEventListener("click", () => {
            window.location.href = "/my-posts.html";
        });
    }

    // MODAL ELEMENTS
    const editModal = document.getElementById("editModalBg");
    const editText = document.getElementById("editText");
    let editingPostId = null;

    document.getElementById("cancelEdit").addEventListener("click", () => {
        editModal.style.display = "none";
        editingPostId = null;
    });

    document.getElementById("saveEdit").addEventListener("click", async () => {
        if (!editingPostId) return;

        const newContent = editText.value.trim();
        if (!newContent) {
            alert("Post content cannot be empty.");
            return;
        }

        const res = await fetch(`/api/posts/${editingPostId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent })
        });

        if (res.ok) {
            editModal.style.display = "none";
            editingPostId = null;
            loadUserPosts(username);
        } else {
            alert("Failed to save changes.");
        }
    });

    // LOAD USER POSTS
    loadUserPosts(username);

    async function loadUserPosts(username) {
        const res = await fetch("/api/posts");
        const posts = await res.json();

        const container = document.getElementById("postsContainer");
        container.innerHTML = "";

        const userPosts = posts.filter(p => p.username === username);
        if (!userPosts.length) {
            container.innerHTML = `<p style="text-align:center; margin-top:40px;">No posts yet.</p>`;
            return;
        }

        userPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post";

            const imgHtml = post.imageUrl ? `<img src="${post.imageUrl}">` : "";

            card.innerHTML = `
                ${imgHtml}
                <div class="post-content">
                    <div class="meta">${new Date(post.createdAt).toLocaleString()}</div>
                    <div class="text">${post.content || ""}</div>
                    <div class="post-actions">
                        <button class="edit-btn" data-id="${post.id}" data-content="${post.content}">Edit</button>
                        <button class="delete-btn" data-id="${post.id}">Delete</button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        // ATTACH EDIT EVENTS
        container.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                editingPostId = btn.dataset.id;
                editText.value = btn.dataset.content;
                editModal.style.display = "flex";
            });
        });

        // ATTACH DELETE EVENTS
        container.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (!confirm("Are you sure you want to delete this post?")) return;

                const res = await fetch(`/api/posts/${btn.dataset.id}`, {
                    method: "DELETE"
                });

                if (res.ok) {
                    loadUserPosts(username);
                } else {
                    alert("Failed to delete post.");
                }
            });
        });
    }
});
