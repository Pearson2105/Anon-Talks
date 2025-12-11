import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("JS loaded!");
    initAuth();   // username + dropdown
    initPosts();  // posts, search, create
});
