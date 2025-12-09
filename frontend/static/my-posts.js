document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem("anon_username");
    if (!username) return window.location.href = "/select.html";

    document.getElementById("headerUsername").innerText = username;
    await loadUserPosts(username);

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
});

let editingPostId = null;

async function loadUserPosts(username) {
    const res = await fetch("/api/posts");
    const posts = await res.json();
    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    const userPosts = posts.filter(p => p.username === username);
    if (!userPosts.length) {
        container.innerHTML = `<p style="text-align:center; margin-top:40px;">You have not created any posts yet.</p>`;
        return;
    }

    userPosts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post";
        card.innerHTML = `
            ${post.imageUrl ? `<img src="${post.imageUrl}">` : ""}
            <div class="post-content">
                <div class="meta">${new Date(post.createdAt).toLocaleString()}</div>
                <div class="text">${post.content || ""}</div>
                <div class="post-actions">
                    <button class="edit-btn" data-id="${post.id}" data-content="${post.content || ""}">Edit</button>
                    <button class="delete-btn" data-id="${post.id}">Delete</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
            if (res.ok) loadUserPosts(username);
            else alert("Failed to delete");
        });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            editingPostId = btn.getAttribute("data-id");
            document.getElementById("editText").value = btn.getAttribute("data-content");
            document.getElementById("editModalBg").style.display = "flex";
        });
    });
}

document.getElementById("cancelEdit").addEventListener("click", () => {
    document.getElementById("editModalBg").style.display = "none";
});

document.getElementById("saveEdit").addEventListener("click", async () => {
    const newText = document.getElementById("editText").value.trim();
    const username = localStorage.getItem("anon_username");
    if (!editingPostId || !newText) return alert("Content required");

    const res = await fetch(`/api/posts/${editingPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newText })
    });

    if (res.ok) {
        document.getElementById("editModalBg").style.display = "none";
        await loadUserPosts(username);
    } else {
        alert("Failed to save edit");
    }
});
