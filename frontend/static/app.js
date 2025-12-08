// ----------------------------
// POPUP ELEMENTS
// ----------------------------
const loginPopup = document.getElementById("loginPopup");
const generatePopup = document.getElementById("generatePopup");

// ----------------------------
// LOGIN BUTTON
// ----------------------------
document.getElementById("loginBtn").onclick = () => loginPopup.style.display = "flex";
document.getElementById("loginConfirm").onclick = async () => {
    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value.trim();

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

function closeLogin() { loginPopup.style.display = "none"; }

// ----------------------------
// GENERATE BUTTON
// ----------------------------
document.getElementById("generateBtn").onclick = fetchGeneratedIdentity;

async function fetchGeneratedIdentity() {
    const res = await fetch("/api/generate", { method: "GET" });
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

function closeGenerate() { generatePopup.style.display = "none"; }

// ----------------------------
// POSTS
// ----------------------------
async function loadPosts() {
    const res = await fetch("/api/posts");
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";

        let imgHtml = post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image">` : "";
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

// Load posts when page loads
document.addEventListener("DOMContentLoaded", loadPosts);
