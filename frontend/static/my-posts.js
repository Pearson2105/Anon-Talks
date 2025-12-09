document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) {
        window.location.href = "/select.html";
        return;
    }

    // Header
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

    // Redirect from dropdown
    document.getElementById("editPostsBtn")?.addEventListener("click", () => {
        window.location.href = "/my-posts.html";
    });

    loadUserPosts(username);

    // Edit modal logic
    const editModal = document.getElementById("editModalBg");
    let editingPostId = null;

    function openEditModal(btn) {
        editingPostId = btn.getAttribute("data-id");
        document.getElementById("editText").value = btn.getAttribute("data-content");
        editModal.style.display = "flex";
    }

    document.getElementById("cancelEdit").addEventListener("click", () => {
        editModal.style.display = "none";
    });

    document.getElementById("saveEdit").addEventListener("click", async () => {
        const newText = document.getElementById("editText").value;
        await fetch(`/api/posts/${editingPostId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newText })
        });
        editModal.style.display = "none";
        loadUserPosts(username);
    });
});

// Load user posts
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

    // Event listeners
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            await fetch(`/api/posts/${btn.getAttribute("data-id")}`, { method: "DELETE" });
            loadUserPosts(username);
        });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById("editModalBg").style.display = "flex";
            document.getElementById("editText").value = btn.getAttribute("data-content");
            document.getElementById("saveEdit").dataset.id = btn.getAttribute("data-id");
        });
    });
}
