document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem("anon_username");

    if (!username) {
        window.location.href = "/select.html";
        return;
    }

    document.getElementById("headerUsername").innerText = username;
    loadUserPosts(username);

    // Dropdown toggle
    document.getElementById("headerUsername").addEventListener("click", () => {
        document.getElementById("usernameDropdown").classList.toggle("show");
    });
});

async function loadUserPosts(username) {
    const res = await fetch("/api/posts");
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    const userPosts = posts.filter(p => p.username === username);

    if (userPosts.length === 0) {
        container.innerHTML = `<p style="text-align:center; margin-top:40px;">You have not created any posts yet.</p>`;
        return;
    }

    userPosts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post-card";

        const imgHtml = post.imageUrl ? `<img src="${post.imageUrl}">` : "";

        card.innerHTML = `
            ${imgHtml}
            <div class="post-meta">${new Date(post.createdAt).toLocaleString()}</div>
            <div class="post-text">${post.content || ""}</div>

            <div class="post-actions">
                <button class="edit-btn" data-id="${post.id}" data-content="${post.content}">Edit</button>
                <button class="delete-btn" data-id="${post.id}">Delete</button>
            </div>
        `;

        container.appendChild(card);
    });

    // Event listeners
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            await fetch(`/api/posts/${id}`, { method: "DELETE" });
            loadUserPosts(username);
        });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => openEditModal(btn));
    });
}

/* ------------------------
   EDIT MODAL FUNCTIONS
------------------------ */

let editingPostId = null;

function openEditModal(btn) {
    editingPostId = btn.getAttribute("data-id");
    document.getElementById("editText").value = btn.getAttribute("data-content");
    document.getElementById("editModalBg").style.display = "flex";
}

document.getElementById("cancelEdit").addEventListener("click", () => {
    document.getElementById("editModalBg").style.display = "none";
});

document.getElementById("saveEdit").addEventListener("click", async () => {
    const newText = document.getElementById("editText").value;

    await fetch(`/api/posts/${editingPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newText })
    });

    document.getElementById("editModalBg").style.display = "none";

    const username = localStorage.getItem("anon_username");
    loadUserPosts(username);
});

/* Logout */
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/select.html";
});
