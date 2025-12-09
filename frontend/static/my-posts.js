// Redirect if not logged in
document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem("anon_username");

    if (!username) {
        window.location.href = "/select.html";
        return;
    }

    // Show username
    document.getElementById("headerUsername").innerText = username;

    loadUserPosts(username);
});

// Load only user posts
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

                <button class="deletePostBtn" data-id="${post.id}">Delete</button>
            </div>
        `;

        container.appendChild(div);
    });

    // Enable delete buttons
    document.querySelectorAll(".deletePostBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const postId = btn.getAttribute("data-id");

            const res = await fetch(`/api/posts/${postId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                loadUserPosts(username);
            } else {
                alert("Failed to delete post.");
            }
        });
    });
}

// Logout button
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/select.html";
});
