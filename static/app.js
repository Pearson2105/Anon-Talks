import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("App.js loaded!");
    initAuth();
    initPosts();
});
