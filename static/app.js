import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initPosts();  // runs only on select.html because it checks elements
});
