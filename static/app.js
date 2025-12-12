import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";

// Initialize login system and posts system when page loads
document.addEventListener("DOMContentLoaded", ()=>{
    initAuth();
    initPosts();
});
