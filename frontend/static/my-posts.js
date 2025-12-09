document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem("anon_username");
    if (!username) {
        window.location.href = "/select.html";
        return;
    }

    document.getElementById("headerUsername").innerText = username;

    // Back button in dropdown
    document.getElementById("backBtn")?.addEventListener("click", () => {
        window.location.href = "/index.html";
    });

    // Header dropdown
    const headerUsername = document.getElementById("headerUsername");
    const dropdown = document.getElementById("usernameDropdown");
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

    await loadUserPosts(username);
});

let editingPostId = null;

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
        const imgHtml = post.imageUrl ? `<img src="${post.imageUrl}" style="max-width:100%;">` : "";
        card.innerHTML = `
            ${imgHtml}
            <div class="post-meta">${new Date(post.createdAt).toLocaleString()}</div>
            <div class="post-text">${post.content || ""}</div>
            <div class="post-actions" style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
                <button class="edit-btn big-btn purple" data-id="${post.id}" data-content="${post.content}" data-image="${post.imageUrl || ''}" style="width:120px;">Edit</button>
                <button class="delete-btn big-btn" data-id="${post.id}" style="width:120px;">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });

    // DELETE
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
            if (res.ok) loadUserPosts(username);
            else alert("Failed to delete");
        });
    });

    // EDIT
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            editingPostId = btn.getAttribute("data-id");
            document.getElementById("editText").value = btn.getAttribute("data-content");
            document.getElementById("editImageUrl").value = btn.getAttribute("data-image");
            document.getElementById("editModalBg").style.display = "flex";
        });
    });
}

// CANCEL EDIT
document.getElementById("cancelEdit").addEventListener("click", () => {
    document.getElementById("editModalBg").style.display = "none";
    editingPostId = null;
});

// SAVE EDIT
document.getElementById("saveEdit").addEventListener("click", async () => {
    const newText = document.getElementById("editText").value.trim();
    const newImageUrl = document.getElementById("editImageUrl").value.trim();
    const username = localStorage.getItem("anon_username");

    if (!newText && !newImageUrl) {
        alert("Please provide content or image URL.");
        return;
    }

    const res = await fetch(`/api/posts/${editingPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newText, imageUrl: newImageUrl })
    });

    if (res.ok) {
        document.getElementById("editModalBg").style.display = "none";
        editingPostId = null;
        loadUserPosts(username);
    } else {
        alert("Failed to save edit");
    }
});
