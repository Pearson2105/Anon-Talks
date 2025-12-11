const API_BASE = "https://anon-talks.onrender.com";

export function initAuth() {
    const loginBtn = document.getElementById("loginBtn");
    const generateBtn = document.getElementById("generateBtn");
    const loginConfirm = document.getElementById("loginConfirm");
    const useIdentity = document.getElementById("useIdentity");
    const loginPopup = document.getElementById("loginPopup");
    const generatePopup = document.getElementById("generatePopup");
    const closeLogin = document.getElementById("closeLogin");
    const closeGenerate = document.getElementById("closeGenerate");

    // Login popup
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

    // Generate identity
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
}
