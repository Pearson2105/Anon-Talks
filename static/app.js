const API_BASE = "https://anon-talks.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const pathname = window.location.pathname.split("/").pop();
    const username = localStorage.getItem("anon_username");

    // -----------------------
    // INDEX / LOGIN PAGE
    // -----------------------
    if (pathname === "index.html" || pathname === "") {
        const loginPopup = document.getElementById("loginPopup");
        const generatePopup = document.getElementById("generatePopup");

        document.getElementById("loginBtn").onclick = () => loginPopup.style.display = "flex";
        document.getElementById("generateBtn").onclick = fetchGeneratedIdentity;
        document.getElementById("closeLogin").onclick = () => loginPopup.style.display = "none";
        document.getElementById("closeGenerate").onclick = () => generatePopup.style.display = "none";

        if (username) window.location.href = "select.html"; // Already logged in

        document.getElementById("loginConfirm").onclick = async () => {
            const username = document.getElementById("loginUser").value.trim();
            const password = document.getElementById("loginPass").value.trim();
            if (!username || !password) return;

            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem("anon_username", username);
                localStorage.setItem("anon_password", password);
                window.location.href = "select.html";
            } else {
                document.getElementById("loginError").style.display = "block";
            }
        };

        async function fetchGeneratedIdentity() {
            const res = await fetch(`${API_BASE}/api/generate`, { method: "POST" });
            const data = await res.json();

            document.getElementById("genUser").innerText = data.username;
            document.getElementById("genPass").innerText = data.password;
            generatePopup.style.display = "flex";

            document.getElementById("useIdentity").onclick = () => {
                localStorage.setItem("anon_username", data.username);
                localStorage.setItem("anon_password", data.password);
                window.location.href = "select.html";
            };
        }
    }
});
