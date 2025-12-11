import { showPopup, hidePopup } from "./popups.js";

export const API_BASE = "https://anon-talks.onrender.com";

let editingPostId = null;

export function initPosts() {
    const username = localStorage.getItem("anon_username");
    const pathname = window.location.pathname.split("/").pop();

    // -------------------
    // SELECT.HTML DROPDOWN
    // -------------------
    const headerUsernameEl = document.getElementById("headerUsername");
    const dropdown = document.getElementById("usernameDropdown");

    if (headerUsernameEl) {
        headerUsernameEl.textContent = username || "Anonymous";

        headerUsernameEl.addEventListener("click", () => {
            dropdown?.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!headerUsernameEl.contains(e.target) && !dropdown?.contains(e.target)) {
                dropdown?.classList.remove("show");
            }
        });
    }

    // -------------------
    // LOGOUT
    // -------------------
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

    // -------------------
    // NAVIGATION BUTTONS
    // -------------------
    const editPostsBtn = document.getElementById("editPosts");
    editPostsBtn?.addEventListener("click", () => {
        window.location.href = "my-posts.html";
    });

    const backBtn = document.getElementById("backBtn");
    backBtn?.addEventListener("click", () => {
        window.location.href = "select.html";
    });

    if (pathname === "select.html") {
        const createBtn = document.getElementById("createBtn");
        const popupOverlay = document.getElementById("popupOverlay");
        const closePopup = document.getElementById("closePopup");
        const submitPost = document.getElementById("submitPost");

        createBtn?.addEventListener("click", () => showPopup(popupOverlay));
        closePopup?.addEventListener("click", () => hidePopup(popupOverlay));

        submitPost?.addEventListener("click", async () => {
            const content = document.getElementById("text")?.value.trim();
            const imageUrl = document.getElementById("imageUrl")?.value.trim();
            if (!content && !imageUrl) return alert("Post must have content or an image.");

            try {
                const res = await fetch(`${API_BASE}/api/posts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, content, imageUrl })
                });
                if (res.ok) {
                    hidePopup(popupOverlay);
                    document.getElementById("text").value = "";
                    document.getElementById("imageUrl").value = "";
                    loadPosts();
                }
            } catch (err) {
                console.error(err);
            }
        });

        loadPosts();
        const searchBox = document.getElementById("searchBox");
        searchBox?.addEventListener("input", (e) => loadPosts(e.target.value));
    }

    if (pathname === "my-posts.html") {
        loadUserPosts(username);
        const cancelEdit = document.getElementById("cancelEdit");
        const saveEdit = document.getElementById("saveEdit");

        cancelEdit?.addEventListener("click", () => hidePopup(document.getElementById("editModalBg")));

        saveEdit?.addEventListener("click", async () => {
            if (!editingPostId) return alert("No post selected.");
            const newText = document.getElementById("editText")?.value.trim();
            const newImage = document.getElementById("editImageUrl")?.value.trim();

            try {
                const res = await fetch(`${API_BASE}/api/posts/${editingPostId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: newText, imageUrl: newImage })
                });
                if (res.ok) {
                    hidePopup(document.getElementById("editModalBg"));
                    loadUserPosts(username);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
}

// -------------------
// FETCH POSTS
// -------------------
export async function loadPosts(filter = "") {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;
        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;

        container.innerHTML = "";
        const filteredPosts = (posts || []).filter(p => (p.content || "").toLowerCase().includes(filter.toLowerCase()));

        if (filteredPosts.length === 0) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">No posts found.</p>`;
            return;
        }

        filteredPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            if (post.imageUrl) {
                const img = document.createElement("img");
                img.src = post.imageUrl;
                card.appendChild(img);
            }

            const text = document.createElement("div");
            text.className = "post-text";
            text.textContent = post.content || "";
            card.appendChild(text);

            const meta = document.createElement("div");
            meta.className = "post-meta";
            meta.textContent = post.createdAt ? new Date(post.createdAt).toLocaleString() : "";
            card.appendChild(meta);

            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

export async function loadUserPosts(username) {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;
        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;

        container.innerHTML = "";
        const userPosts = (posts || []).filter(p => p.username === username);

        if (userPosts.length === 0) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">You have not created any posts yet.</p>`;
            return;
        }

        userPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            if (post.imageUrl) {
                const img = document.createElement("img");
                img.src = post.imageUrl;
                card.appendChild(img);
            }

            const text = document.createElement("div");
            text.className = "post-text";
            text.textContent = post.content || "";
            card.appendChild(text);

            const meta = document.createElement("div");
            meta.className = "post-meta";
            meta.textContent = post.createdAt ? new Date(post.createdAt).toLocaleString() : "";
            card.appendChild(meta);

            // EDIT/DELETE buttons
            const actions = document.createElement("div");
            actions.className = "post-actions";

            const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.textContent = "Edit";
            editBtn.dataset.id = post.id;
            editBtn.dataset.content = post.content || "";
            editBtn.dataset.image = post.imageUrl || "";
            actions.appendChild(editBtn);

            const delBtn = document.createElement("button");
            delBtn.className = "delete-btn";
            delBtn.textContent = "Delete";
            delBtn.dataset.id = post.id;
            actions.appendChild(delBtn);

            card.appendChild(actions);
            container.appendChild(card);

            // Event listeners for edit/delete
            editBtn.addEventListener("click", () => {
                editingPostId = editBtn.dataset.id;
                document.getElementById("editText").value = editBtn.dataset.content;
                document.getElementById("editImageUrl").value = editBtn.dataset.image;
                showPopup(document.getElementById("editModalBg"));
            });

            delBtn.addEventListener("click", async () => {
                const id = delBtn.dataset.id;
                if (!id) return alert("Invalid post ID");

                try {
                    const res = await fetch(`${API_BASE}/api/posts/${id}`, { method: "DELETE" });
                    if (res.ok) loadUserPosts(username);
                } catch (err) {
                    console.error(err);
                }
            });
        });
    } catch (err) {
        console.error(err);
    }
}
