document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem("anon_username");

    if (!username) {
        window.location.href = "/select.html";
        return;
    }

    document.getElementById("headerUsername").innerText = username;
    loadUserPosts(username);

    // Dropdown toggle
    document.getElementById("headerUsername").addEventListener("click", () => {
        document.getElementById("usernameDropdown").classList.toggle("show");
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/select.html";
    });
});

async function loadUserPosts(username) {
    const res = await fetch("/api/posts");
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    const userPosts = posts.filter(p => p.username === username);

    if (userPosts.length === 0) {
        container.innerHTML = `<p style="text-align:center; margin-top:40px;">You have not created any posts yet.</p>`;
        return;
    }

    userPosts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post";

        const imgHtml = post.imageUrl ? `<img src="${post.imageUrl}">` : "";

        card.innerHTML = `
            ${imgHtml}
            <div class="post-content">
                <div class="meta">${new Date(post.createdAt).toLocaleString()}</div>
                <div class="text">${post.content || ""}</div>
            </div>
        `;

        container.appendChild(card);
    });
}
