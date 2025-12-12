import { API_BASE } from "./auth.js";

export function initPosts() {
    const username = localStorage.getItem("anon_username");

    // Top-right buttons
    const createBtn = document.getElementById("createBtn");
    const popupOverlay = document.getElementById("popupOverlay");
    const closePopup = document.getElementById("closePopup");
    const submitPost = document.getElementById("submitPost");
    const searchBox = document.getElementById("searchBox");

    // Dropdown
    const headerUsernameEl = document.getElementById("headerUsername");
    const dropdown = document.getElementById("usernameDropdown");
    if (headerUsernameEl) headerUsernameEl.textContent = username;
    if (headerUsernameEl && dropdown) {
        headerUsernameEl.addEventListener("click", () => {
            dropdown.classList.toggle("show");
        });
        document.addEventListener("click", e => {
            if (!headerUsernameEl.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove("show");
            }
        });
    }

    // Dropdown actions
    const logoutBtn = document.getElementById("logoutBtn");
    const editPostsBtn = document.getElementById("editPosts");
    logoutBtn?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
    editPostsBtn?.addEventListener("click", () => {
        window.location.href = "my-posts.html";
    });

    // Create post popup
    createBtn?.addEventListener("click", () => popupOverlay?.classList.remove("hidden"));
    closePopup?.addEventListener("click", () => popupOverlay?.classList.add("hidden"));

    submitPost?.addEventListener("click", async () => {
        const content = document.getElementById("text")?.value.trim();
        const imageUrl = document.getElementById("imageUrl")?.value.trim();
        if (!content && !imageUrl) return alert("Post must have content or an image.");

        try {
            await fetch(`${API_BASE}/api/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, content, imageUrl })
            });
            document.getElementById("text").value = "";
            document.getElementById("imageUrl").value = "";
            popupOverlay?.classList.add("hidden");
            loadPosts();
        } catch (err) {
            console.error(err);
        }
    });

    // Search
    searchBox?.addEventListener("input", e => loadPosts(e.target.value));

    loadPosts();
}

// Load posts (all users)
async function loadPosts(filter = "") {
    const container = document.getElementById("postsContainer");
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = await res.json();

        // Filter
        let filtered = posts.filter(p =>
            (p.content || "").toLowerCase().includes(filter.toLowerCase()) ||
            (p.username || "").toLowerCase().includes(filter.toLowerCase())
        );

        // Sort newest first
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = filtered.length
            ? ""
            : `<p style="text-align:center;margin-top:40px;">No posts found.</p>`;

        filtered.forEach(p => {
            const card = document.createElement("div");
            card.className = "post-card";

            if (p.imageUrl) {
                const img = document.createElement("img");
                img.src = p.imageUrl;
                img.alt = "post image";
                card.appendChild(img);
            }

            const text = document.createElement("div");
            text.className = "post-text";
            const date = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
            text.innerHTML = `<div class="post-meta">@${p.username} • ${date}</div>${p.content || ""}`;
            card.appendChild(text);

            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading posts.</p>";
    }
}
