import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("JS loaded!");

    // Auth (login / generate identity)
    initAuth();

    // Posts and select.html page functionality
    initPosts();
});
