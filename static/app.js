import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("app DOMContentLoaded");

    initAuth();

    // only run post system on select.html
    if (window.location.pathname.endsWith("select.html")) {
        initPosts();
    }
});
