const API_BASE = "https://anon-talks.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem("anon_username");
    if (!username) {
        window.location.href = "/select.html";
        return;
    }

    document.getElementById("headerUsername").innerText = username;

    loadUserPosts(username);

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

    document.getElementById("backBtn").addEventListener("click", () => {
        window.location.href = "/";
    });
});

let editingPostId = null;

async function loadUserPosts(username) {
    const res = await fetch(`${API_BASE}/api/posts`);
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
                <button class="edit-btn" data-id="${post.id}" data-content="${post.content || ""}" data-image="${post.imageUrl || ""}">Edit</button>
                <button class="delete-btn" data-id="${post.id}">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });

    // DELETE
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            const res = await fetch(`${API_BASE}/api/posts/${id}`, { method: "DELETE" });
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

document.getElementById("cancelEdit").addEventListener("click", () => {
    document.getElementById("editModalBg").style.display = "none";
});

document.getElementById("saveEdit").addEventListener("click", async () => {
    const newText = document.getElementById("editText").value;
    const newImage = document.getElementById("editImageUrl").value;
    const username = localStorage.getItem("anon_username");

    const res = await fetch(`${API_BASE}/api/posts/${editingPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newText, image_url: newImage })
    });

    if (res.ok) {
        document.getElementById("editModalBg").style.display = "none";
        loadUserPosts(username);
    } else {
        alert("Failed to save edit");
    }
});
