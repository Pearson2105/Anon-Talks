const API_BASE = "https://anon-talks.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const pathname = window.location.pathname.split("/").pop();
    const username = localStorage.getItem("anon_username");

    // -----------------------
    // INDEX PAGE
    // -----------------------
    if (pathname === "index.html" || pathname === "") {
        const loginPopup = document.getElementById("loginPopup");
        const generatePopup = document.getElementById("generatePopup");

        document.getElementById("loginBtn").onclick = () => loginPopup.style.display = "flex";
        document.getElementById("closeLogin").onclick = () => loginPopup.style.display = "none";
        document.getElementById("closeGenerate").onclick = () => generatePopup.style.display = "none";

        document.getElementById("generateBtn").onclick = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/generate`, { method: "POST" });
                const data = await res.json();

                document.getElementById("genUser").innerText = data.username;
                document.getElementById("genPass").innerText = data.password;
                generatePopup.style.display = "flex";

                document.getElementById("useIdentity").onclick = () => {
                    localStorage.setItem("anon_username", data.username);
                    localStorage.setItem("anon_password", data.password);
                    window.location.href = "select.html";
                };
            } catch (err) {
                alert("Failed to generate identity");
                console.error(err);
            }
        };

        // LOGIN
        document.getElementById("loginConfirm").onclick = async () => {
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

                if (data.success) {
                    localStorage.setItem("anon_username", u);
                    localStorage.setItem("anon_password", p);
                    window.location.href = "select.html";
                } else {
                    document.getElementById("loginError").style.display = "block";
                }
            } catch (err) {
                alert("Login failed");
                console.error(err);
            }
        };
    }

    // -----------------------
    // SELECT PAGE
    // -----------------------
    if (pathname === "select.html") {
        if (!username) {
            window.location.href = "index.html";
            return;
        }

        document.getElementById("headerUsername")?.innerText = username;

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
                    body: JSON.stringify({ username, content, image_url: imageUrl })
                });

                if (res.ok) {
                    document.getElementById("popupOverlay").style.display = "none";
                    document.getElementById("text").value = "";
                    document.getElementById("imageUrl").value = "";
                    loadPosts();
                } else alert("Failed to create post.");
            } catch (err) {
                alert("Failed to create post.");
                console.error(err);
            }
        });

        document.getElementById("editPosts")?.addEventListener("click", () => {
            window.location.href = "my-posts.html";
        });

        document.getElementById("searchBox")?.addEventListener("input", (e) => {
            loadPosts(e.target.value);
        });

        // Load all posts
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
        headerUsername.addEventListener("click", () => dropdown.classList.toggle("show"));
        document.addEventListener("click", (e) => {
            if (!headerUsername.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove("show");
            }
        });

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });

        document.getElementById("backBtn").addEventListener("click", () => {
            window.location.href = "select.html";
        });

        // EDIT MODAL
        const cancelBtn = document.getElementById("cancelEdit");
        const saveBtn = document.getElementById("saveEdit");

        cancelBtn?.addEventListener("click", () => {
            document.getElementById("editModalBg").style.display = "none";
            editingPostId = null;
        });

        saveBtn?.addEventListener("click", async () => {
            if (!editingPostId) return alert("No post selected to edit.");

            const newText = document.getElementById("editText").value;
            const newImage = document.getElementById("editImageUrl").value;

            try {
                const res = await fetch(`${API_BASE}/api/posts/${editingPostId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: newText, image_url: newImage })
                });

                if (res.ok) {
                    document.getElementById("editModalBg").style.display = "none";
                    editingPostId = null;
                    loadUserPosts(username);
                } else alert("Failed to save edit");
            } catch (err) {
                alert("Failed to save edit");
                console.error(err);
            }
        });
    }
});

// -----------------------
// GLOBAL VARIABLES
// -----------------------
let editingPostId = null;

// -----------------------
// LOAD ALL POSTS (for SELECT PAGE)
// -----------------------
async function loadPosts(filter = "") {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        container.innerHTML = "";

        const filteredPosts = posts.filter(post => 
            post.content?.toLowerCase().includes(filter.toLowerCase()) ||
            post.username?.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredPosts.length === 0) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">No posts found.</p>`;
            return;
        }

        filteredPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            const imgHtml = post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image">` : "";

            card.innerHTML = `
                ${imgHtml}
                <div class="post-text">
                    <div class="post-meta">${post.username} • ${new Date(post.createdAt).toLocaleString()}</div>
                    <div>${post.content || ""}</div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

// -----------------------
// LOAD USER POSTS (for MY POSTS PAGE)
// -----------------------
async function loadUserPosts(username) {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const posts = await res.json();
        const container = document.getElementById("postsContainer");
        container.innerHTML = "";

        const userPosts = posts.filter(p => p.username === username);
        if (userPosts.length === 0) {
            container.innerHTML = `<p style="text-align:center;margin-top:40px;">You have not created any posts yet.</p>`;
            return;
        }

        userPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            const imgHtml = post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image">` : "";

            card.innerHTML = `
                ${imgHtml}
                <div class="post-text">
                    <div class="post-meta">${new Date(post.createdAt).toLocaleString()}</div>
                    <div>${post.content || ""}</div>
                    <div class="post-actions">
                        <button class="edit-btn" data-id="${post.id}" data-content="${post.content}" data-image="${post.imageUrl}">Edit</button>
                        <button class="delete-btn" data-id="${post.id}">Delete</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // DELETE BUTTONS
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                try {
                    const res = await fetch(`${API_BASE}/api/posts/${id}`, { method: "DELETE" });
                    if (res.ok) loadUserPosts(username);
                    else alert("Failed to delete post");
                } catch (err) {
                    alert("Failed to delete post");
                    console.error(err);
                }
            });
        });

        // EDIT BUTTONS
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                editingPostId = btn.getAttribute("data-id");
                document.getElementById("editText").value = btn.getAttribute("data-content");
                document.getElementById("editImageUrl").value = btn.getAttribute("data-image");
                document.getElementById("editModalBg").style.display = "flex";
            });
        });

    } catch (err) {
        console.error("Error loading user posts:", err);
    }
}
