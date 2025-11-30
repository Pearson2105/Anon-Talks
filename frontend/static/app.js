const backendURL = "http://127.0.0.1:8080";

// popup
const popup = document.getElementById("popupOverlay");
document.getElementById("createBtn").onclick = () => popup.style.display = "flex";
document.getElementById("closePopup").onclick = () => popup.style.display = "none";

// Submit post
document.getElementById("submitPost").onclick = async () => {
    const data = {
        username: document.getElementById("username").value,
        text: document.getElementById("text").value,
        image_url: document.getElementById("imageUrl").value
    };

    await fetch(backendURL + "/api/create_post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    popup.style.display = "none";
    loadPosts();
};

// Load posts
async function loadPosts() {
    const res = await fetch(backendURL + "/api/posts");
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    posts.reverse().forEach(p => {
        const el = document.createElement("div");
        el.className = "post";

        el.innerHTML = `
            <img src="${p.image_url || 'https://via.placeholder.com/200'}">

            <div class="post-content">
                <div class="meta">${p.username} | Posted: ${p.timestamp}</div>
                
                <div class="text">${p.text}</div>

                <div class="reactions">
                    <span>👍 ${p.likes}</span>
                    <span>👎 ${p.dislikes}</span>
                    <span>💬 ${p.comments.length}</span>
                </div>
            </div>
        `;

        container.appendChild(el);
    });
}

loadPosts();
