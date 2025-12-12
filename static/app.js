import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";
import { initMyPosts } from "./my-posts.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("app DOMContentLoaded");

    initAuth(); // safe, only binds where elements exist

    const page = window.location.pathname;

    // select.html → load public posts system
    if (page.endsWith("select.html")) {
        initPosts();
    }

    // my-posts.html → load ONLY user’s own posts
    if (page.endsWith("my-posts.html")) {
        initMyPosts();
    }
});
