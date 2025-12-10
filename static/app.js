const API_BASE = "https://anon-talks.onrender.com";

const pathname = window.location.pathname;
const onSelectPage = pathname.endsWith("index.html") || pathname === "/" || pathname.includes("index.html");
const onMyPostsPage = pathname.includes("my-posts.html");

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------
    // SELECT / LOGIN PAGE
    // -----------------------
    if (onSelectPage) {
        const loginPopup = document.getElementById("loginPopup");
        const generatePopup = document.getElementById("generatePopup");

        document.getElementById("loginBtn").onclick = () => loginPopup.style.display = "flex";
        document.getElementById("generateBtn").onclick = fetchGeneratedIdentity;

        document.getElementById("closeLogin").onclick = () => loginPopup.style.display = "none";
        document.getElementById("closeGenerate").onclick = () => generatePopup.style.display = "none";

        // LOGIN
        document.getElementById("loginConfirm").onclick = async () => {
            const username = document.getElementById("loginUser").value;
            const password = document.getElementById("loginPass").value;

            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem("anon_username", username);
                localStorage.setItem("anon_password", password);
                window.location.href = "frontend/select.html";
            } else {
                document.getElementById("loginError").style.display = "block";
            }
        };

        // GENERATE IDENTITY
        async function fetchGeneratedIdentity() {
            const res = await fetch(`${API_BASE}/api/generate`, { method: "POST" });
            const data = await res.json();

            document.getElementById("genUser").innerText = data.username;
            document.getElementById("genPass").innerText = data.password;

            generatePopup.style.display = "flex";

            document.getElementById("useIdentity").onclick = () => {
                localStorage.setItem("anon_username", data.username);
                localStorage.setItem("anon_password", data.password);
                window.location.href = "frontend/select.html";
            };
        }
    }

    // -----------------------
    // INDEX / POSTS PAGE
    // -----------------------
    if (!onSelectPage) {
        const username = localStorage.getItem("anon_username");
        if (!username) {
            window.location.href = "index.html";
            return;
        }

        const headerUsername = document.getElementById("headerUsername");
        if (headerUsername) headerUsername.innerText = username;

        const dropdown = document.getElementById("usernameDropdown");
        headerUsername?.addEventListener("click", () => dropdown.classList.toggle("show"));
        document.addEventListener("click", (e) => {
            if (!headerUsername?.contains(e.target) && !dropdown?.contains(e.target)) {
                dropdown?.classList.remove("show");
            }
        });

        document.getElementById("logoutBtn")?.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });

        if (onMyPostsPage) {
            // My Posts page logic handled separately
            loadUserPosts(username);

            document.getElementById("backBtn")?.addEventListener("click", () => {
                window.location.href = "frontend/select.html";
            });
        } else {
            // Normal posts page
            document.getElementById("username").value = username;

            const popupOverlay = document.getElementById("popupOverlay");
            document.getElementById("createBtn")?.addEventListener("click", () => popupOverlay.style.display = "flex");
            document.getElementById("closePopup")?.addEventListener("click", () => popupOverlay.style.display = "none");

            document.getElementById("submitPost")?.addEventListener("click", async () => {
                const content = document.getElementById("text").value.trim();
                const imageUrl = document.getElementById("imageUrl").value.trim();

                if (!content && !imageUrl) {
                    alert("Post must have content or an image.");
                    return;
                }

                const res = await fetch(`${API_BASE}/api/posts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, content, image_url: imageUrl })
                });

                if (res.ok) {
                    popupOverlay.style.display = "none";
                    document.getElementById("text").value = "";
                    document.getElementById("imageUrl").value = "";
                    loadPosts();
                } else {
                    alert("Failed to create post.");
                }
            });

            document.getElementById("searchBox")?.addEventListener("input", (e) => {
                loadPosts(e.target.value);
            });

            document.getElementById("editPosts")?.addEventListener("click", () => {
                window.location.href = "my-posts.html";
            });

            loadPosts();
        }
    }
});

// -----------------------
// LOAD POSTS FUNCTION
// -----------------------
async function loadPosts(filter = "") {
    const res = await fetch(`${API_BASE}/api/posts`);
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
    if (!container) return;

    container.innerHTML = "";

    posts
        .filter(p => !filter || (p.username?.toLowerCase().includes(filter.toLowerCase())) || (p.content?.toLowerCase().includes(filter.toLowerCase())))
        .forEach(post => {
            const div = document.createElement("div");
            div.className = "post";

            const imgHtml = post.image_url ? `<img src="${post.image_url}" alt="">` : "";

            div.innerHTML = `
                ${imgHtml}
                <div class="post-content">
                    <div class="meta">${post.username} • ${new Date(post.createdAt).toLocaleString()}</div>
                    <div class="text">${post.content || ""}</div>
                </div>
            `;
            container.appendChild(div);
        });
}

// -----------------------
// LOAD USER POSTS (my-posts.js logic inside app.js)
// -----------------------
async function loadUserPosts(username) {
    const res = await fetch(`${API_BASE}/api/posts`);
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
    if (!container) return;
    container.innerHTML = "";

    const userPosts = posts.filter(p => p.username === username);

    if (userPosts.length === 0) {
        container.innerHTML = `<p style="text-align:center;margin-top:40px;">You have not created any posts yet.</p>`;
        return;
    }

    userPosts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post-card";

        const imgHtml = post.image_url ? `<img src="${post.image_url}">` : "";

        card.innerHTML = `
            ${imgHtml}
            <div class="post-meta">${new Date(post.createdAt).toLocaleString()}</div>
            <div class="post-text">${post.content || ""}</div>
            <div class="post-actions">
                <button class="edit-btn" data-id="${post.id}" data-content="${post.content}" data-image="${post.image_url}">Edit</button>
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
    let editingPostId = null;
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            editingPostId = btn.getAttribute("data-id");
            document.getElementById("editText").value = btn.getAttribute("data-content");
            document.getElementById("editImageUrl").value = btn.getAttribute("data-image");
            document.getElementById("editModalBg").style.display = "flex";
        });
    });

    document.getElementById("cancelEdit")?.addEventListener("click", () => {
        document.getElementById("editModalBg").style.display = "none";
    });

    document.getElementById("saveEdit")?.addEventListener("click", async () => {
        const newText = document.getElementById("editText").value;
        const newImage = document.getElementById("editImageUrl").value;

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
}
