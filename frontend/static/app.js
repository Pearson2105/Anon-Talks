// ----------------------------
// HEADER & USERNAME
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if (!username) {
        window.location.href = "/select.html";
        return;
    }

    // Header username
    const headerElem = document.getElementById("headerUsername");
    if (headerElem) headerElem.innerText = username;

    // Auto-fill username in create post popup
    const usernameInput = document.getElementById("username");
    if (usernameInput) usernameInput.value = username;

    loadPosts();
});

// ----------------------------
// POPUP ELEMENTS
// ----------------------------
const popupOverlay = document.getElementById("popupOverlay");
const createBtn = document.getElementById("createBtn");
const closePopupBtn = document.getElementById("closePopup");

createBtn.onclick = () => popupOverlay.style.display = "flex";
closePopupBtn.onclick = () => popupOverlay.style.display = "none";

// ----------------------------
// POSTS
// ----------------------------
async function loadPosts(filter = "") {
    const res = await fetch("/api/posts");
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
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

// ----------------------------
// SEARCH / FILTER
// ----------------------------
const searchBox = document.getElementById("searchBox");
if (searchBox) {
    searchBox.addEventListener("input", () => loadPosts(searchBox.value));
}

// ----------------------------
// CREATE POST
// ----------------------------
document.getElementById("submitPost").onclick = async () => {
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
};

// ----------------------------
// USERNAME DROPDOWN
// ----------------------------
const headerUsername = document.getElementById("headerUsername");
const usernameDropdown = document.getElementById("usernameDropdown");

headerUsername.addEventListener("click", () => {
    usernameDropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
    if (!headerUsername.contains(e.target) && !usernameDropdown.contains(e.target)) {
        usernameDropdown.classList.remove("show");
    }
});

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("anon_username");
    localStorage.removeItem("anon_password");
    window.location.href = "/select.html";
});

// EDIT POSTS
document.getElementById("editPosts").addEventListener("click", () => {
    alert("Feature coming soon: edit your posts!");
});
