const API_BASE = "https://anon-talks.onrender.com";
let editingPostId = null;

document.addEventListener("DOMContentLoaded", () => {
    const pathname = window.location.pathname.split("/").pop();
    const username = localStorage.getItem("anon_username");

    // -----------------------
    // INDEX PAGE BUTTONS
    // -----------------------
    const loginPopup = document.getElementById("loginPopup");
    const generatePopup = document.getElementById("generatePopup");
    const loginBtn = document.getElementById("loginBtn");
    const generateBtn = document.getElementById("generateBtn");
    const closeLogin = document.getElementById("closeLogin");
    const closeGenerate = document.getElementById("closeGenerate");
    const useIdentity = document.getElementById("useIdentity");
    const loginConfirm = document.getElementById("loginConfirm");

    if (loginBtn) loginBtn.onclick = () => { if (loginPopup) loginPopup.style.display = "flex"; };
    if (generateBtn) generateBtn.onclick = fetchGeneratedIdentity;
    if (closeLogin) closeLogin.onclick = () => { if (loginPopup) loginPopup.style.display = "none"; };
    if (closeGenerate) closeGenerate.onclick = () => { if (generatePopup) generatePopup.style.display = "none"; };

    if (loginConfirm) loginConfirm.onclick = async () => {
        const u = document.getElementById("loginUser").value.trim();
        const p = document.getElementById("loginPass").value.trim();
        if (!u || !p) return;

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: u, password: p })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem("anon_username", u);
                localStorage.setItem("anon_password", p);
                window.location.href = "select.html";
            } else {
                document.getElementById("loginError").style.display = "block";
            }
        } catch (err) {
            console.error(err);
        }
    };

    async function fetchGeneratedIdentity() {
        try {
            const res = await fetch(`${API_BASE}/api/generate`, { method: "POST" });
            const data = await res.json();

            document.getElementById("genUser").innerText = data.username || "";
            document.getElementById("genPass").innerText = data.password || "";
            if (generatePopup) generatePopup.style.display = "flex";

            if (useIdentity) useIdentity.onclick = () => {
                if (!data.username || !data.password) return;
                localStorage.setItem("anon_username", data.username);
                localStorage.setItem("anon_password", data.password);
                window.location.href = "select.html";
            };
        } catch (err) {
            console.error(err);
        }
    }

    // -----------------------
    // SELECT PAGE
    // -----------------------
    if (pathname === "select.html") {
        if (!username) {
            window.location.href = "index.html";
            return;
        }

        const headerUsernameEl = document.getElementById("headerUsername");
        if (headerUsernameEl) headerUsernameEl.innerText = username;

        const usernameInput = document.getElementById("username");
        if (usernameInput) usernameInput.value = username;

        const dropdown = document.getElementById("usernameDropdown");

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

        document.getElementById("createBtn")?.addEventListener("click", () => {
            document.getElementById("popupOverlay").style.display = "flex";
        });
        document.getElementById("closePopup")?.addEventListener("click", () => {
            document.getElementById("popupOverlay").style.display = "none";
        });

        document.getElementById("submitPost")?.addEventListener("click", async () => {
            const content = document.getElementById("text").value.trim();
            const imageUrl = document.getElementById("imageUrl").value.trim();
            if (!content && !imageUrl) return alert("Post must have content or an image.");

            try {
                const res = await fetch(`${API_BASE}/api/posts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, content, imageUrl })
                });
                if (res.ok) {
                    document.getElementById("popupOverlay").style.display = "none";
                    document.getElementById("text").value = "";
                    document.getElementById("imageUrl").value = "";
                    loadPosts();
                } else {
                    const err = await res.json().catch(()=>null);
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

    // -----------------------
    // MY POSTS PAGE
    // -----------------------
    if (pathname === "my-posts.html") {
        if (!username) {
            window.location.href = "index.html";
            return;
        }

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

        document.getElementById("backBtn")?.addEventListener("click", () => {
            window.location.href = "select.html";
        });

        // Edit modal
        document.getElementById("cancelEdit")?.addEventListener("click", () => {
            document.getElementById("editModalBg").style.display = "none";
        });

        document.getElementById("saveEdit")?.addEventListener("click", async () => {
            if (!editingPostId) return alert("No post selected.");

            const newText = document.getElementById("editText").value.trim();
            const newImage = document.getElementById("editImageUrl").value.trim();

            try {
                const res = await fetch(`${API_BASE}/api/posts/${editingPostId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: newText, imageUrl: newImage })
                });
                if (res.ok) {
                    document.getElementById("editModalBg").style.display = "none";
                    loadUserPosts(username);
                } else {
                    const err = await res.json().catch(()=>null);
                    alert("Failed to save edit." + (err?.error ? " " + err.error : ""));
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
});

// -----------------------
// POSTS FUNCTIONS
// -----------------------
async function loadPosts(filter = "") {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;

        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;

        container.innerHTML = "";

        const filteredPosts = (posts || []).filter(p => {
            const content = (p.content || p.text || "").toString();
            return content.toLowerCase().includes(filter.toLowerCase());
        });

        if (filteredPosts.length === 0) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">No posts found.</p>`;
            return;
        }

        filteredPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            const imgSrc = post.imageUrl || post.image_url || "";
            if (imgSrc) {
                const img = document.createElement("img");
                img.src = imgSrc;
                img.alt = "post image";
                card.appendChild(img);
            }

            const meta = document.createElement("div");
            meta.className = "post-meta";
            const created = post.createdAt || post.created_at || "";
            meta.textContent = created ? new Date(created).toLocaleString() : "";
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

async function loadUserPosts(username) {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) return;

        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        if (!container) return;

        container.innerHTML = "";

        const userPosts = (posts || []).filter(p => {
            return (p.username || p.user) === username;
        });

        if (userPosts.length === 0) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">You have not created any posts yet.</p>`;
            return;
        }

        userPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            const imgSrc = post.imageUrl || post.image_url || "";
            if (imgSrc) {
                const img = document.createElement("img");
                img.src = imgSrc;
                img.alt = "post image";
                card.appendChild(img);
            }

            const meta = document.createElement("div");
            meta.className = "post-meta";
            const created = post.createdAt || post.created_at || "";
            meta.textContent = created ? new Date(created).toLocaleString() : "";
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
            editBtn.dataset.id = post.id || post.post_id || "";
            editBtn.dataset.content = post.content || "";
            editBtn.dataset.image = imgSrc || "";
            actions.appendChild(editBtn);

            const delBtn = document.createElement("button");
            delBtn.className = "delete-btn";
            delBtn.textContent = "Delete";
            delBtn.dataset.id = post.id || post.post_id || "";
            actions.appendChild(delBtn);

            card.appendChild(actions);
            container.appendChild(card);
        });

        // EDIT
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                editingPostId = btn.dataset.id;
                document.getElementById("editText").value = btn.dataset.content || "";
                document.getElementById("editImageUrl").value = btn.dataset.image || "";
                document.getElementById("editModalBg").style.display = "flex";
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
                        const err = await res.json().catch(()=>null);
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
