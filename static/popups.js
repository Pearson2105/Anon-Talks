export function showPopup(el) { el?.classList.remove("hidden"); }
export function hidePopup(el) { el?.classList.add("hidden"); }

export function initDropdown() {
    document.querySelectorAll(".username-container").forEach(container => {
        const username = container.querySelector(".username");
        const dropdown = container.querySelector(".username-dropdown");

        username?.addEventListener("click", () => dropdown?.classList.toggle("show"));

        document.addEventListener("click", e => {
            if (!container.contains(e.target)) dropdown?.classList.remove("show");
        });
    });
}
