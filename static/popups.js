// Simple helpers for showing/hiding popups
export function showPopup(el) {
    el?.classList.remove("hidden");
}

export function hidePopup(el) {
    el?.classList.add("hidden");
}
