const API_BASE = "https://anon-talks.onrender.com";

const pathname = window.location.pathname;
const onSelectPage = pathname.includes("select.html");
const onIndexPage = pathname.includes("index.html") || pathname.endsWith("/") || pathname.includes("Anon-Talks");

document.addEventListener("DOMContentLoaded", () => {

    // INDEX PAGE
    if (onIndexPage) {
        const username = localStorage.getItem("anon_username");

        if (!username) {
            window.location.href = "select.html";
            return;
        }

        document.getElementById("headerUsername").innerText = username;
        document.getElementById("username").value = username;

        loadPosts();

        // Dropdown
        const headerUsername = document.getElementById("headerUsername");
        const dropdown = document.getElementById("usernameDropdown");
        headerUsername?.addEventListener("click", () => dropdown.classList.toggle("show"));

        document.addEventListener("click", (e) => {
            if (!headerUsername.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove("show");
            }
        });

        document.getElementById("editPosts").onclick = () => window.location.href = "my-posts.html";
        document.getElementById("logoutBtn").onclick = () => {
            localStorage.clear();
            window.location.href = "select.html";
        };

        // Popup create
        const popupOverlay = document.getElementById("popupOverlay");
        document.getElementById("createBtn").onclick = () => popupOverlay.style.display = "flex";
        document.getElementById("closePopup").onclick = () => popupOverlay.style.display = "none";

        document.getElementById("submitPost").onclick = async () => {
            const username = document.getElementById("username").value.trim();
            const content = document.getElementById("text").value.trim();
            const imageUrl = document.getElementById("imageUrl").value.trim();

            if (!username || (!content && !imageUrl)) {
                alert("Username and content or image required.");
                return;
            }

            const res = await fetch(`${API_BASE}/api/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    content,
                    image_url: imageUrl
                })
            });

            if (res.ok) {
                popupOverlay.style.display = "none";
                document.getElementById("text").value = "";
                document.getElementById("imageUrl").value = "";
                loadPosts();
            } else {
                alert("Failed to create post");
            }
        };

        // Search
        document.getElementById("searchBox").addEventListener("input", (e) => {
            loadPosts(e.target.value);
        });
    }

    // SELECT PAGE
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
                window.location.href = "index.html";
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
                window.location.href = "index.html";
            };
        }
    }
});

async function loadPosts(filter = "") {
    const res = await fetch(`${API_BASE}/api/posts`);
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
    if (!container) return;

    container.innerHTML = "";

    posts
        .filter(p =>
            !filter ||
            (p.username && p.username.toLowerCase().includes(filter.toLowerCase())) ||
            (p.content && p.content.toLowerCase().includes(filter.toLowerCase()))
        )
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
