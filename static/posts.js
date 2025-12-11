// static/posts.js
import { API_BASE } from "./auth.js";
import { showPopup, hidePopup } from "./popups.js";

export function initPosts() {
    document.addEventListener("DOMContentLoaded", () => {
        const username = localStorage.getItem("anon_username");
        const pathname = window.location.pathname.split("/").pop();

        if (!username) return;

        // SELECT PAGE
        if (pathname === "select.html") {
            const headerUsernameEl = document.getElementById("headerUsername");
            const dropdown = document.getElementById("usernameDropdown");
            headerUsernameEl && (headerUsernameEl.innerText = username);

            headerUsernameEl?.addEventListener("click", () => dropdown?.classList.toggle("show"));
            document.addEventListener("click", (e) => {
                if (!headerUsernameEl?.contains(e.target) && !dropdown?.contains(e.target)) {
                    dropdown?.classList.remove("show");
                }
            });

            document.getElementById("logoutBtn")?.addEventListener("click", () => {
                localStorage.clear();
                window.location.href = "index.html";
            });

            document.getElementById("createBtn")?.addEventListener("click", () => showPopup(document.getElementById("popupOverlay")));
            document.getElementById("closePopup")?.addEventListener("click", () => hidePopup(document.getElementById("popupOverlay")));

            document.getElementById("submitPost")?.addEventListener("click", async () => {
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
                        hidePopup(document.getElementById("popupOverlay"));
                        document.getElementById("text").value = "";
                        document.getElementById("imageUrl").value = "";
                        loadPosts();
                    } else {
                        const err = await res.json().catch(() => null);
                        alert("Failed to create post." + (err?.error ? " " + err.error : ""));
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            document.getElementById("editPosts")?.addEventListener("click", () => {
                window.location.href = "my-posts.html";
            });

            document.getElementById("searchBox")?.addEventListener("input", (e) => {
                loadPosts(e.target.value);
            });

            loadPosts();
        }

        // MY POSTS PAGE
        if (pathname === "my-posts.html") {
            document.getElementById("headerUsername")?.innerText = username;
            loadUserPosts(username);

            const headerUsername = document.getElementById("headerUsername");
            const dropdown = document.getElementById("usernameDropdown");

            headerUsername?.addEventListener("click", () => dropdown?.classList.toggle("show"));
            document.addEventListener("click", (e) => {
                if (!headerUsername?.contains(e.target) && !dropdown?.contains(e.target)) {
                    dropdown?.classList.remove("show");
                }
            });

            document.getElementById("logoutBtn")?.addEventListener("click", () => {
                localStorage.clear();
                window.location.href = "index.html";
            });

            document.getElementById("backBtn")?.addEventListener("click", () => window.location.href = "select.html");

            document.getElementById("cancelEdit")?.addEventListener("click", () => hidePopup(document.getElementById("editModalBg")));
            document.getElementById("saveEdit")?.addEventListener("click", async () => {
                const editingPostId = document.getElementById("saveEdit").dataset.id;
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
                    } else {
                        const err = await res.json().catch(() => null);
                        alert("Failed to save edit." + (err?.error ? " " + err.error : ""));
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        }
    });
}

// -----------------------
// POSTS FUNCTIONS
// -----------------------
export async function loadPosts(filter = "") {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;
        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;

        container.innerHTML = "";

        const filteredPosts = (posts || []).filter(p => (p.content || "").toLowerCase().includes(filter.toLowerCase()));

        if (!filteredPosts.length) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">No posts found.</p>`;
            return;
        }

        filteredPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            const imgSrc = post.imageUrl || "";
            if (imgSrc) {
                const img = document.createElement("img");
                img.src = imgSrc;
                img.alt = "post image";
                card.appendChild(img);
            }

            const meta = document.createElement("div");
            meta.className = "post-meta";
            meta.textContent = post.createdAt ? new Date(post.createdAt).toLocaleString() : "";
            card.appendChild(meta);

            const text = document.createElement("div");
            text.className = "post-text";
            text.textContent = post.content || "";
            card.appendChild(text);

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

        if (!userPosts.length) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">You have not created any posts yet.</p>`;
            return;
        }

        userPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            const imgSrc = post.imageUrl || "";
            if (imgSrc) {
                const img = document.createElement("img");
                img.src = imgSrc;
                img.alt = "post image";
                card.appendChild(img);
            }

            const meta = document.createElement("div");
            meta.className = "post-meta";
            meta.textContent = post.createdAt ? new Date(post.createdAt).toLocaleString() : "";
            card.appendChild(meta);

            const text = document.createElement("div");
            text.className = "post-text";
            text.textContent = post.content || "";
            card.appendChild(text);

            const actions = document.createElement("div");
            actions.className = "post-actions";

            const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.textContent = "Edit";
            editBtn.dataset.id = post.id;
            editBtn.dataset.content = post.content;
            editBtn.dataset.image = imgSrc;
            actions.appendChild(editBtn);

            const delBtn = document.createElement("button");
            delBtn.className = "delete-btn";
            delBtn.textContent = "Delete";
            delBtn.dataset.id = post.id;
            actions.appendChild(delBtn);

            card.appendChild(actions);
            container.appendChild(card);
        });

        // EDIT
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.getElementById("editText").value = btn.dataset.content || "";
                document.getElementById("editImageUrl").value = btn.dataset.image || "";
                document.getElementById("saveEdit").dataset.id = btn.dataset.id;
                showPopup(document.getElementById("editModalBg"));
            });
        });

        // DELETE
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (!id) return alert("Invalid post id");

                try {
                    const res = await fetch(`${API_BASE}/api/posts/${id}`, { method: "DELETE" });
                    if (res.ok) loadUserPosts(username);
                    else {
                        const err = await res.json().catch(() => null);
                        alert("Failed to delete." + (err?.error ? " " + err.error : ""));
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        });

    } catch (err) {
        console.error(err);
    }
}
