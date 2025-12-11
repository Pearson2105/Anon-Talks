export const API_BASE = "https://anon-talks.onrender.com";

export function initAuth() {
    const loginPopup = document.getElementById("loginPopup");
    const generatePopup = document.getElementById("generatePopup");
    const loginBtn = document.getElementById("loginBtn");
    const generateBtn = document.getElementById("generateBtn");
    const closeLogin = document.getElementById("closeLogin");
    const closeGenerate = document.getElementById("closeGenerate");
    const loginConfirm = document.getElementById("loginConfirm");
    const useIdentity = document.getElementById("useIdentity");

    // Index.html: LOGIN
    loginBtn?.addEventListener("click", () => loginPopup?.classList.remove("hidden"));
    closeLogin?.addEventListener("click", () => loginPopup?.classList.add("hidden"));

    loginConfirm?.addEventListener("click", async () => {
        const u = document.getElementById("loginUser")?.value.trim();
        const p = document.getElementById("loginPass")?.value.trim();
        if (!u || !p) return;

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: u, password: p })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem("anon_username", u);
                localStorage.setItem("anon_password", p);
                window.location.href = "select.html";
            } else {
                document.getElementById("loginError")?.style.display = "block";
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Index.html: GENERATE IDENTITY
    generateBtn?.addEventListener("click", async () => {
        try {
            const res = await fetch(`${API_BASE}/api/generate`, { method: "POST" });
            const data = await res.json();

            document.getElementById("genUser").innerText = data.username || "";
            document.getElementById("genPass").innerText = data.password || "";

            generatePopup?.classList.remove("hidden");

            useIdentity?.addEventListener("click", () => {
                if (!data.username || !data.password) return;
                localStorage.setItem("anon_username", data.username);
                localStorage.setItem("anon_password", data.password);
                window.location.href = "select.html";
            }, { once: true });
        } catch (err) {
            console.error(err);
        }
    });

    closeGenerate?.addEventListener("click", () => generatePopup?.classList.add("hidden"));


    // Select / My-posts dropdown logic
    const usernameEl = document.getElementById("headerUsername");
    const dropdown = document.getElementById("usernameDropdown");
    const username = localStorage.getItem("anon_username");
    if (username && usernameEl) usernameEl.textContent = username;

    usernameEl?.addEventListener("click", () => dropdown?.classList.toggle("show"));
    document.addEventListener("click", (e) => {
        if (!usernameEl?.contains(e.target) && !dropdown?.contains(e.target)) {
            dropdown?.classList.remove("show");
        }
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

    document.getElementById("editPosts")?.addEventListener("click", () => {
        window.location.href = "my-posts.html";
    });

    document.getElementById("homeBtn")?.addEventListener("click", () => {
        window.location.href = "select.html";
    });
}
