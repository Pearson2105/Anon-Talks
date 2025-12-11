// static/popups.js
export function showPopup(popup) {
    popup?.classList.remove("hidden");
}

export function hidePopup(popup) {
    popup?.classList.add("hidden");
}
