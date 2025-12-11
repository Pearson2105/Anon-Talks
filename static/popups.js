export function initPopups() {
    const headerUsernameEl = document.getElementById("headerUsername");
    const dropdown = document.getElementById("usernameDropdown");

    // Header dropdown
    headerUsernameEl?.addEventListener("click", () => dropdown?.classList.toggle("show"));

    document.addEventListener("click", (e) => {
        if (!headerUsernameEl?.contains(e.target) && !dropdown?.contains(e.target)) {
            dropdown?.classList.remove("show");
        }
    });
}
