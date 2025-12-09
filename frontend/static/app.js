document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) window.location.href = "/select.html";

    document.getElementById("headerUsername").innerText = username;

    loadUserPosts(username);

    document.getElementById("headerUsername").addEventListener("click", () => {
        document.getElementById("usernameDropdown").classList.toggle("show");
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/select.html";
    });

    document.getElementById("cancelEdit").addEventListener("click", () => {
        document.getElementById("editModalBg").style.display = "none";
    });

    document.getElementById("saveEdit").addEventListener("click", saveEdit);
});

async function loadUserPosts(username) {
    const res = await fetch("/api/posts");
    const posts = await res.json();
    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    posts.filter(p => p.username === username).forEach(post => {
        const card = document.createElement("div");
        card.className = "post";
        card.innerHTML = `
            ${post.imageUrl ? `<img src="${post.imageUrl}">` : ""}
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

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            await fetch(`/api/posts/${btn.dataset.id}`, {method:"DELETE"});
            loadUserPosts(username);
        });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => openEditModal(btn));
    });
}

let editingPostId = null;
function openEditModal(btn) {
    editingPostId = btn.dataset.id;
    document.getElementById("editText").value = btn.dataset.content;
    document.getElementById("editModalBg").style.display = "flex";
}

async function saveEdit() {
    const newText = document.getElementById("editText").value;
    await fetch(`/api/posts/${editingPostId}`, {
        method:"PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({content:newText})
    });
    document.getElementById("editModalBg").style.display = "none";
    const username = localStorage.getItem("anon_username");
    loadUserPosts(username);
}
