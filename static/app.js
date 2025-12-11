import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("JS loaded!");
    initAuth();
    initPosts();

    // USERNAME DROPDOWN (works on select.html & my-posts.html)
    const headerUsername = document.getElementById("headerUsername");
    const dropdown = document.getElementById("usernameDropdown");
    if (headerUsername && dropdown) {
        headerUsername.innerText = localStorage.getItem("anon_username") || "Anonymous";

        headerUsername.addEventListener("click", () => {
            dropdown.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!headerUsername.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove("show");
            }
        });

        // DROPDOWN ACTIONS
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });

        const editPostsBtn = document.getElementById("editPosts");
        if (editPostsBtn) editPostsBtn.addEventListener("click", () => {
            window.location.href = "my-posts.html";
        });

        const homeBtn = document.getElementById("homeBtn");
        if (homeBtn) homeBtn.addEventListener("click", () => {
            window.location.href = "select.html";
        });
    }
});
