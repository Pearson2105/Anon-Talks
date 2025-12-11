import { initAuth } from "./auth.js";
import { initPopups } from "./popups.js";
import { initPosts } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Main JS loaded!");

    // Initialize modules
    initPopups();
    initAuth();
    initPosts();
});
