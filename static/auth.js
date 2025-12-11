export const API_BASE = "https://anon-talks.onrender.com";

export function initAuth() {
    // --- POPUPS ---
    const loginPopup = document.getElementById("loginPopup");
    const generatePopup = document.getElementById("generatePopup");

    const loginBtn = document.getElementById("loginBtn");
    const generateBtn = document.getElementById("generateBtn");
    const closeLogin = document.getElementById("closeLogin");
    const closeGenerate = document.getElementById("closeGenerate");
    const loginConfirm = document.getElementById("loginConfirm");
    const useIdentity = document.getElementById("useIdentity");

    // --- LOGIN ---
    if (loginBtn && loginPopup) {
        loginBtn.addEventListener("click", function() {
            loginPopup.classList.remove("hidden");
        });
    }

    if (closeLogin && loginPopup) {
        closeLogin.addEventListener("click", function() {
            loginPopup.classList.add("hidden");
        });
    }

    if (loginConfirm) {
        loginConfirm.addEventListener("click", async function() {
            const uInput = document.getElementById("loginUser");
            const pInput = document.getElementById("loginPass");
            const u = uInput ? uInput.value.trim() : "";
            const p = pInput ? pInput.value.trim() : "";
            if (!u || !p) return;

            try {
                const res = await fetch(API_BASE + "/api/login", {
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
                    const errMsg = document.getElementById("loginError");
                    if (errMsg) errMsg.style.display = "block";
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // --- GENERATE IDENTITY ---
    if (generateBtn) {
        generateBtn.addEventListener("click", async function() {
            try {
                const res = await fetch(API_BASE + "/api/generate", { method: "POST" });
                const data = await res.json();

                const genUserEl = document.getElementById("genUser");
                const genPassEl = document.getElementById("genPass");
                if (genUserEl) genUserEl.textContent = data.username || "";
                if (genPassEl) genPassEl.textContent = data.password || "";

                if (generatePopup) generatePopup.classList.remove("hidden");

                if (useIdentity) {
                    useIdentity.addEventListener("click", function() {
                        if (!data.username || !data.password) return;
                        localStorage.setItem("anon_username", data.username);
                        localStorage.setItem("anon_password", data.password);
                        window.location.href = "select.html";
                    }, { once: true });
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    if (closeGenerate && generatePopup) {
        closeGenerate.addEventListener("click", function() {
            generatePopup.classList.add("hidden");
        });
    }
}
