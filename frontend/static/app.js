const backendURL = "/api";

// POPUP HANDLERS
const popup = document.getElementById("popupOverlay");

document.getElementById("createBtn").onclick = () => {
    popup.style.display = "flex";
};

document.getElementById("closePopup").onclick = () => {
    popup.style.display = "none";
};

// TIME FORMATTER - LOCAL TIMEZONE
function formatTimestamp(iso) {
    const d = new Date(iso);

    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    return `${hours}:${minutes} on ${day}/${month}/${year}`;
}

// SUBMIT POST
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

// LOAD POSTS
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
                <div class="meta">${p.username} | ${formatTimestamp(p.createdAt)}</div>
                <div class="text">${p.content || ""}</div>
            </div>
        `;

        container.appendChild(el);
    });
}

loadPosts();
