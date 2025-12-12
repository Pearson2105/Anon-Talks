// static/auth.js
export const API_BASE = "https://anon-talks.onrender.com";

export function initAuth() {
    console.log("initAuth running");

    // Popup elements (may be undefined on pages that don't include them)
    var loginPopup = document.getElementById("loginPopup");
    var generatePopup = document.getElementById("generatePopup");

    var loginBtn = document.getElementById("loginBtn");
    var generateBtn = document.getElementById("generateBtn");
    var closeLogin = document.getElementById("closeLogin");
    var closeGenerate = document.getElementById("closeGenerate");
    var loginConfirm = document.getElementById("loginConfirm");
    var useIdentity = document.getElementById("useIdentity");

    // ---------- LOGIN ----------
    if (loginBtn && loginPopup) {
        loginBtn.addEventListener("click", function () {
            loginPopup.classList.remove("hidden");
        });
    }

    if (closeLogin && loginPopup) {
        closeLogin.addEventListener("click", function () {
            loginPopup.classList.add("hidden");
        });
    }

    if (loginConfirm) {
        loginConfirm.addEventListener("click", async function () {
            var uIn = document.getElementById("loginUser");
            var pIn = document.getElementById("loginPass");
            var u = uIn ? String(uIn.value).trim() : "";
            var p = pIn ? String(pIn.value).trim() : "";
            if (!u || !p) return;

            try {
                var res = await fetch(API_BASE + "/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: u, password: p })
                });
                var data = await res.json();
                if (res.ok && data && data.success) {
                    localStorage.setItem("anon_username", u);
                    localStorage.setItem("anon_password", p);
                    window.location.href = "select.html";
                } else {
                    var errEl = document.getElementById("loginError");
                    if (errEl) errEl.style.display = "block";
                }
            } catch (e) {
                console.error("login request failed", e);
            }
        });
    }

    // ---------- GENERATE IDENTITY ----------
    if (generateBtn) {
        generateBtn.addEventListener("click", async function () {
            try {
                var res = await fetch(API_BASE + "/api/generate", { method: "POST" });
                var data = await res.json();

                var genUserEl = document.getElementById("genUser");
                var genPassEl = document.getElementById("genPass");
                if (genUserEl) genUserEl.textContent = data.username || "";
                if (genPassEl) genPassEl.textContent = data.password || "";

                if (generatePopup) generatePopup.classList.remove("hidden");

                // Attach onclick handler the safe (assign) way
                if (useIdentity) {
                    // remove previous assignment to be safe
                    try { useIdentity.onclick = null; } catch(e) {}
                    useIdentity.onclick = function () {
                        if (!data || !data.username || !data.password) return;
                        localStorage.setItem("anon_username", data.username);
                        localStorage.setItem("anon_password", data.password);
                        window.location.href = "select.html";
                    };
                }
            } catch (e) {
                console.error("generate request failed", e);
            }
        });
    }

    if (closeGenerate && generatePopup) {
        closeGenerate.addEventListener("click", function () {
            generatePopup.classList.add("hidden");
        });
    }

    console.log("initAuth finished");
}
