const API_BASE = "https://anon-talks.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const pathname = window.location.pathname.split("/").pop();
    const username = localStorage.getItem("anon_username");

    // ---------------------------------------------------
    // INDEX PAGE  (login + generated identity popup)
    // ---------------------------------------------------
    if (pathname === "" || pathname === "index.html") {
        const loginBtn = document.getElementById("loginBtn");
        const generateBtn = document.getElementById("generateBtn");

        const loginPopup = document.getElementById("loginPopup");
        const generatePopup = document.getElementById("generatePopup");

        const closeLogin = document.getElementById("closeLogin");
        const closeGenerate = document.getElementById("closeGenerate");

        const loginConfirm = document.getElementById("loginConfirm");

        // Ensure buttons exist (prevents silent JS errors)
        if (loginBtn) loginBtn.onclick = () => loginPopup.style.display = "flex";
        if (closeLogin) closeLogin.onclick = () => loginPopup.style.display = "none";

        if (generateBtn) generateBtn.onclick = fetchGeneratedIdentity;
        if (closeGenerate) closeGenerate.onclick = () => generatePopup.style.display = "none";

        // LOGIN
        if (loginConfirm) {
            loginConfirm.onclick = async () => {
                const u = document.getElementById("loginUser").value.trim();
                const p = document.getElementById("loginPass").value.trim();
                const errorMsg = document.getElementById("loginError");

                if (!u || !p) return;

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
                    if (errorMsg) errorMsg.style.display = "block";
                }
            };
        }

        // Generate identity
        async function fetchGeneratedIdentity() {
            const res = await fetch(`${API_BASE}/api/generate`, { method: "POST" });
            const data = await res.json();

            const genUser = document.getElementById("genUser");
            const genPass = document.getElementById("genPass");
            const useIdentity = document.getElementById("useIdentity");

            if (genUser) genUser.innerText = data.username;
            if (genPass) genPass.innerText = data.password;

            if (generatePopup) generatePopup.style.display = "flex";

            if (useIdentity) {
                useIdentity.onclick = () => {
                    localStorage.setItem("anon_username", data.username);
                    localStorage.setItem("anon_password", data.password);
                    window.location.href = "select.html";
                };
            }
        }
    }

    // ---------------------------------------------------
    // SELECT PAGE  (main feed)
    // ---------------------------------------------------
    if (pathname === "select.html") {
        if (!username) {
            window.location.href = "index.html";
            return;
        }

        // Username in header
        const headerUsername = document.getElementById("headerUsername");
        if (headerUsername) headerUsername.innerText = username;

        const dropdown = document.getElementById("usernameDropdown");

        // Username dropdown
        headerUsername?.addEventListener("click", () => {
            dropdown?.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!headerUsername?.contains(e.target) && !dropdown?.contains(e.target)) {
                dropdown?.classList.remove("show");
            }
        });

        // Logout
        document.getElementById("logoutBtn")?.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });

        // Create post popup
        document.getElementById("createBtn")?.addEventListener("click", () => {
            document.getElementById("popupOverlay").style.display = "flex";
        });

        document.getElementById("closePopup")?.addEventListener("click", () => {
            document.getElementById("popupOverlay").style.display = "none";
        });

        // Submit post
        document.getElementById("submitPost")?.addEventListener("click", async () => {
            const content = document.getElementById("text").value.trim();
            const imageUrl = document.getElementById("imageUrl").value.trim();

            if (!content && !imageUrl) return alert("Post must have content or an image.");

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
            } else {
                alert("Failed to create post.");
            }
        });

        // Edit posts button
        document.getElementById("editPosts")?.addEventListener("click", () => {
            window.location.href = "my-posts.html";
        });

        // Search bar
        document.getElementById("searchBox")?.addEventListener("input", (e) => {
            loadPosts(e.target.value);
        });

        loadPosts();
    }

    // ---------------------------------------------------
    // MY POSTS PAGE
    // ---------------------------------------------------
    if (pathname === "my-posts.html") {
        if (!username) {
            window.location.href = "index.html";
            return;
        }

        const headerUsername = document.getElementById("headerUsername");
        const dropdown = document.getElementById("usernameDropdown");

        if (headerUsername) headerUsername.innerText = username;

        headerUsername?.addEventListener("click", () =>
            dropdown?.classList.toggle("show")
        );

        document.addEventListener("click", (e) => {
            if (!headerUsername?.contains(e.target) && !dropdown?.contains(e.target)) {
                dropdown?.classList.remove("show");
            }
        });

        document.getElementById("logoutBtn")?.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });

        // FIX: Back goes to SELECT (not index)
        document.getElementById("backBtn")?.addEventListener("click", () => {
            window.location.href = "select.html";
        });

        loadUserPosts(username);
    }
});

// -------------------------------------------------------
// POSTS FUNCTIONS (PREVENT JS BREAKING IF NOT ADDED YET)
// -------------------------------------------------------
async function loadPosts(filter = "") {
    // TODO: Insert your real implementation
}

async function loadUserPosts(username) {
    // TODO: Insert your real implementation
}
