import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initPosts();
});
