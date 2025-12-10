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
        document.getElementById("generateBtn").onclick = fetchGeneratedIdentity;
        document.getElementById("closeLogin").onclick = () => loginPopup.style.display = "none";
        document.getElementById("closeGenerate").onclick = () => generatePopup.style.display = "none";

        // LOGIN
        document.getElementById("loginConfirm").onclick = async () => {
            const u = document.getElementById("loginUser").value.trim();
            const p = document.getElementById("loginPass").value.trim();
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
                window.location.href = "select.html";
            };
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
    }
});

// -----------------------
// POSTS FUNCTIONS (same as before)
// -----------------------
async function loadPosts(filter = "") { /* ... */ }
async function loadUserPosts(username) { /* ... */ }
