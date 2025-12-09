// Safe element getter
function $(id) { return document.getElementById(id); }

// Load user from storage
let user = JSON.parse(localStorage.getItem("user") || "null");

// Init logic (safe on all pages)
document.addEventListener("DOMContentLoaded", () => {
    if ($("welcome-container")) updateLoginUI();
    loadFeed();
});

/* --------------------------- LOGIN ---------------------------- */

function showLoginForm() {
    $("login-container").style.display = "none";
    $("login-form").style.display = "block";
}
function hideLoginForm() {
    $("login-form").style.display = "none";
    $("login-container").style.display = "block";
}

function generateIdentity() {
    const u = "anon" + Math.floor(Math.random() * 100000);
    const p = Math.floor(Math.random() * 999999);

    $("gen-user").innerText = "Username: " + u;
    $("gen-pass").innerText = "Password: " + p;

    $("generated-identity").style.display = "block";
    $("login-container").style.display = "none";

    localStorage.setItem("generated", JSON.stringify({ username: u, password: p }));
}

function hideGenerated() {
    $("generated-identity").style.display = "none";
    $("login-container").style.display = "block";
}

function useGeneratedIdentity() {
    const g = JSON.parse(localStorage.getItem("generated"));
    localStorage.setItem("user", JSON.stringify(g));
    user = g;
    updateLoginUI();
}

function loginUser() {
    const u = $("login-username").value.trim();
    const p = $("login-password").value.trim();

    if (!u || !p) {
        alert("Enter username/password");
        return;
    }

    user = { username: u, password: p };
    localStorage.setItem("user", JSON.stringify(user));

    updateLoginUI();
}

function logoutUser() {
    localStorage.removeItem("user");
    user = null;
    location.reload();
}

/* ------------------------ UI UPDATE --------------------------- */

function updateLoginUI() {
    if (!$("welcome-container")) return; // not on homepage

    if (user) {
        $("welcome-container").style.display = "block";
        $("welcome-text").innerText = "Welcome, " + user.username;
        $("login-container").style.display = "none";
        $("post-area").style.display = "block";
    }
}

/* -------------------------- POSTS ----------------------------- */

function submitPost() {
    if (!user) return alert("Login first");

    const title = $("post-title").value.trim();
    const body = $("post-body").value.trim();
    if (!(title && body)) return alert("Fill both fields");

    const posts = JSON.parse(localStorage.getItem("posts") || "[]");

    posts.unshift({
        id: Date.now(),
        username: user.username,
        title,
        body
    });

    localStorage.setItem("posts", JSON.stringify(posts));

    $("post-title").value = "";
    $("post-body").value = "";

    loadFeed();
}

function loadFeed() {
    if (!$("posts-feed")) return;

    const posts = JSON.parse(localStorage.getItem("posts") || "[]");

    $("posts-feed").innerHTML = posts
        .map(p => `
        <div class="post">
            <div class="post-title">${p.title}</div>
            <div class="post-body">${p.body}</div>
            <div class="post-user">— ${p.username}</div>
        </div>
    `).join("");
}
