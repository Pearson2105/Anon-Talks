// =====================================================
//  PAGE DETECTION
// =====================================================
const onSelectPage = window.location.pathname.includes("select.html");
const onIndexPage = window.location.pathname === "/" || window.location.pathname.includes("index.html");

// =====================================================
//  HANDLE SELECT.HTML HEADER
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    if (onSelectPage) {
        const user = localStorage.getItem("anon_username");
        const headerUser = document.getElementById("headerUsernameSelect");

        if (headerUser && user) headerUser.innerText = user;

        const dropdown = document.getElementById("usernameDropdownSelect");

        headerUser?.addEventListener("click", () => {
            dropdown.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!headerUser?.contains(e.target) && !dropdown?.contains(e.target)) {
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
//  REDIRECT IF NOT LOGGED IN (index.html)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    if (onIndexPage) {
        const username = localStorage.getItem("anon_username");
        if (!username) {
            window.location.href = "/select.html";
            return;
        }

        document.getElementById("headerUsername").innerText = username;
        document.getElementById("username").value = username;

        loadPosts();
    }
});

// =====================================================
//  POPUPS FOR INDEX
// =====================================================
const popupOverlay = document.getElementById("popupOverlay");
document.getElementById("createBtn")?.addEventListener("click", () => {
    popupOverlay.style.display = "flex";
});
document.getElementById("closePopup")?.addEventListener("click", () => {
    popupOverlay.style.display = "none";
});

// =====================================================
//  POSTS (index.html)
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

            const imgHtml = post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image">` : "";

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
//  SEARCH
// =====================================================
document.getElementById("searchBox")?.addEventListener("input", (e) => {
    loadPosts(e.target.value);
});

// =====================================================
//  CREATE POST
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
        document.getElementById("imageUrl")
