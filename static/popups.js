export function showPopup(el) {
    if (!el) return;
    el.classList.remove("hidden");
}

export function hidePopup(el) {
    if (!el) return;
    el.classList.add("hidden");
}
