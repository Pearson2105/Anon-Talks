// static/auth.js
export const API_BASE = "https://anon-talks.onrender.com";

export function initAuth() {
    console.log("initAuth running");

    const loginPopup = document.getElementById("loginPopup");
    const generatePopup = document.getElementById("generatePopup");
    const loginBtn = document.getElementById("loginBtn");
    const generateBtn = document.getElementById("generateBtn");
    const closeLogin = document.getElementById("closeLogin");
    const closeGenerate = document.getElementById("closeGenerate");
    const loginConfirm = document.getElementById("loginConfirm");
    const useIdentity = document.getElementById("useIdentity");

    if (loginBtn && loginPopup) loginBtn.addEventListener("click", () => loginPopup.classList.remove("hidden"));
    if (closeLogin && loginPopup) closeLogin.addEventListener("click", () => loginPopup.classList.add("hidden"));

    if (loginConfirm) {
        loginConfirm.addEventListener("click", async () => {
            const uIn = document.getElementById("loginUser");
            const pIn = document.getElementById("loginPass");
            const u = uIn ? uIn.value.trim() : "";
            const p = pIn ? pIn.value.trim() : "";
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
                    const errEl = document.getElementById("loginError");
                    if (errEl) errEl.style.display = "block";
                }
            } catch (e) { console.error(e); }
        });
    }

    if (generateBtn) {
        generateBtn.addEventListener("click", async () => {
            try {
                const res = await fetch(`${API_BASE}/api/generate`, { method: "POST" });
                const data = await res.json();

                const genUserEl = document.getElementById("genUser");
                const genPassEl = document.getElementById("genPass");
                if (genUserEl) genUserEl.textContent = data.username || "";
                if (genPassEl) genPassEl.textContent = data.password || "";

                if (generatePopup) generatePopup.classList.remove("hidden");

                if (useIdentity) {
                    useIdentity.onclick = () => {
                        if (!data.username || !data.password) return;
                        localStorage.setItem("anon_username", data.username);
                        localStorage.setItem("anon_password", data.password);
                        window.location.href = "select.html";
                    };
                }
            } catch (e) { console.error(e); }
        });
    }

    if (closeGenerate && generatePopup) closeGenerate.addEventListener("click", () => generatePopup.classList.add("hidden"));

    console.log("initAuth finished");
}
