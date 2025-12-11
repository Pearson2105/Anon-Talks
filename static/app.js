console.log("JS loaded!"); // verify JS loads

const API_BASE = "https://anon-talks.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    // --- Get elements ---
    const loginPopup = document.getElementById("loginPopup");
    const generatePopup = document.getElementById("generatePopup");

    const loginBtn = document.getElementById("loginBtn");
    const generateBtn = document.getElementById("generateBtn");
    const closeLogin = document.getElementById("closeLogin");
    const closeGenerate = document.getElementById("closeGenerate");
    const loginConfirm = document.getElementById("loginConfirm");
    const useIdentity = document.getElementById("useIdentity");

    // --- LOGIN BUTTON ---
    loginBtn?.addEventListener("click", () => {
        loginPopup?.classList.remove("hidden");
    });

    closeLogin?.addEventListener("click", () => {
        loginPopup?.classList.add("hidden");
    });

    loginConfirm?.addEventListener("click", async () => {
        const username = document.getElementById("loginUser")?.value.trim();
        const password = document.getElementById("loginPass")?.value.trim();
        if (!username || !password) return;

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem("anon_username", username);
                localStorage.setItem("anon_password", password);
                window.location.href = "select.html";
            } else {
                document.getElementById("loginError")?.style.display = "block";
            }
        } catch (err) {
            console.error(err);
        }
    });

    // --- GENERATE IDENTITY BUTTON ---
    generateBtn?.addEventListener("click", async () => {
        try {
            const res = await fetch(`${API_BASE}/api/generate`, { method: "POST" });
            const data = await res.json();

            document.getElementById("genUser").innerText = data.username || "";
            document.getElementById("genPass").innerText = data.password || "";

            generatePopup?.classList.remove("hidden");

            // Remove previous listener to prevent duplicate execution
            useIdentity?.replaceWith(useIdentity.cloneNode(true));
            const newUseIdentity = document.getElementById("useIdentity");

            newUseIdentity?.addEventListener("click", () => {
                if (!data.username || !data.password) return;
                localStorage.setItem("anon_username", data.username);
                localStorage.setItem("anon_password", data.password);
                window.location.href = "select.html";
            });

        } catch (err) {
            console.error(err);
        }
    });

    closeGenerate?.addEventListener("click", () => {
        generatePopup?.classList.add("hidden");
    });
});
