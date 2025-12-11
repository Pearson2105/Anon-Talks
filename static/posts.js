export function initPosts() {
    updateHeaderUsername();

    const headerUsername = document.getElementById("headerUsername");
    const dropdown = document.getElementById("usernameDropdown");

    headerUsername?.addEventListener("click", () => dropdown?.classList.toggle("show"));

    document.addEventListener("click", (e) => {
        if (!headerUsername?.contains(e.target) && !dropdown?.contains(e.target)) {
            dropdown?.classList.remove("show");
        }
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

    document.getElementById("editPosts")?.addEventListener("click", () => {
        window.location.href = "my-posts.html";
    });
}

function updateHeaderUsername() {
    const username = localStorage.getItem("anon_username") || "Anonymous";
    const el = document.getElementById("headerUsername");
    if (el) el.textContent = username;
}
