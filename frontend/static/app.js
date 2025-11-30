const backendURL = "/api";

// open popup
const popup = document.getElementById("popupOverlay");
document.getElementById("createBtn").onclick = () => popup.style.display = "flex";
document.getElementById("closePopup").onclick = () => popup.style.display = "none";

// submit post
document.getElementById("submitPost").onclick = async () => {
    const data = {
        username: document.getElementById("username").value,
        content: document.getElementById("text").value,
        imageUrl: document.getElementById("imageUrl").value
    };

    await fetch(backendURL + "/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    popup.style.display = "none";
    loadPosts();
};

// load posts
async function loadPosts() {
    const res = await fetch(backendURL + "/posts");
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    posts.forEach(p => {
        const el = document.createElement("div");
        el.className = "post";

        el.innerHTML = `
            <img src="${p.imageUrl || 'https://via.placeholder.com/200'}">
            <div class="post-content">
                <div class="meta">${p.username} | ${p.createdAt}</div>
                <div class="text">${p.content || ""}</div>
            </div>
        `;

        container.appendChild(el);
    });
}

loadPosts();
