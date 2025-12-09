// =====================================================
//  PAGE DETECTION
// =====================================================
const onSelectPage = window.location.pathname.includes("select.html");
const onIndexPage =
    window.location.pathname === "/" ||
    window.location.pathname.includes("index.html");

// =====================================================
//  HEADER LOGIC FOR select.html
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    if (onSelectPage) {
        const storedUser = localStorage.getItem("anon_username");
        const headerUser = document.getElementById("headerUsernameSelect");
        const dropdown = document.getElementById("usernameDropdownSelect");

        // Show username or default to "Welcome"
        if (headerUser) {
            headerUser.innerText = storedUser ? storedUser : "Welcome";
        }

        // Dropdown behavior only if logged in
        headerUser?.addEventListener("click", () => {
            if (storedUser) dropdown?.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (
                !headerUser?.contains(e.target) &&
                !dropdown?.contains(e.target)
            ) {
                dropdown?.classList.remove("show");
            }
        });

        document.getElementById("logoutBtnSelect")?.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "/select.html";
        });
    }
});

// =====================================================
//  INDEX PAGE – REDIRECT IF NOT LOGGED IN
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    if (onIndexPage) {
        const username = localStorage.getItem("anon_username");

        if (!username) {
            window.location.href = "/select.html";
            return;
        }

        // Fill header + post popup username
        document.getElementById("headerUsername").innerText = username;
        document.getElementById("username").value = username;

        loadPosts();
    }
});

// =====================================================
//  POPUPS (index.html)
// =====================================================
const popupOverlay = document.getElementById("popupOverlay");

document.getElementById("createBtn")?.addEventListener("click", () => {
    popupOverlay.style.display = "flex";
});

document.getElementById("closePopup")?.addEventListener("click", () => {
    popupOverlay.style.display = "none";
});

// =====================================================
//  LOAD POSTS (index.html)
// =====================================================
async function loadPosts(filter = "") {
    const res = await fetch("/api/posts");
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

            const imgHtml = post.imageUrl
                ? `<img src="${post.imageUrl}" alt="Post image">`
                : "";

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

// =====================================================
//  SEARCH FILTER (index.html)
// =====================================================
document.getElementById("searchBox")?.addEventListener("input", (e) => {
    loadPosts(e.target.value);
});

// =====================================================
//  CREATE POST (index.html)
// =====================================================
document.getElementById("submitPost")?.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const content = document.getElementById("text").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim();

    if (!username || (!content && !imageUrl)) {
        alert("Username and at least content or image URL required.");
        return;
    }

    const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, content, imageUrl })
    });

    if (res.ok) {
        popupOverlay.style.display = "none";
        document.getElementById("text").value = "";
        document.getElementById("imageUrl").value = "";
        loadPosts();
    } else {
        const data = await res.json();
        alert(data.error || "Failed to create post");
    }
});

// =====================================================
//  HEADER DROPDOWN (index.html)
// =====================================================
const headerUsername = document.getElementById("headerUsername");
const dropdown = document.getElementById("usernameDropdown");

headerUsername?.addEventListener("click", () => dropdown.classList.toggle("show"));

document.addEventListener("click", (e) => {
    if (!headerUsername?.contains(e.target) && !dropdown?.contains(e.target)) {
        dropdown?.classList.remove("show");
    }
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/select.html";
});

document.getElementById("editPosts")?.addEventListener("click", () => {
    alert("Feature coming soon: edit your posts!");
});

// =====================================================
//  SELECT PAGE POPUPS & AUTH
// =====================================================
if (onSelectPage) {
    const loginPopup = document.getElementById("loginPopup");
    const generatePopup = document.getElementById("generatePopup");

    // Open popups
    document.getElementById("loginBtn").onclick = () => loginPopup.style.display = "flex";
    document.getElementById("generateBtn").onclick = fetchGeneratedIdentity;

    // Close popups
    document.getElementById("closeLogin").onclick = () => loginPopup.style.display = "none";
    document.getElementById("closeGenerate").onclick = () => generatePopup.style.display = "none";

    // LOGIN SUBMIT
    document.getElementById("loginConfirm").onclick = async () => {
        const username = document.getElementById("loginUser").value;
        const password = document.getElementById("loginPass").value;

        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("anon_username", username);
            localStorage.setItem("anon_password", password);
            window.location.href = "/";
        } else {
            document.getElementById("loginError").style.display = "block";
        }
    };

    // GENERATE IDENTITY
    async function fetchGeneratedIdentity() {
        const res = await fetch("/api/generate", { method: "POST" });
        const data = await res.json();

        document.getElementById("genUser").innerText = data.username;
        document.getElementById("genPass").innerText = data.password;

        generatePopup.style.display = "flex";

        document.getElementById("useIdentity").onclick = () => {
            localStorage.setItem("anon_username", data.username);
            localStorage.setItem("anon_password", data.password);
            window.location.href = "/";
        };
    }
}
