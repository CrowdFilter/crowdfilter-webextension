function handleConfirmation(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.innerText = "Addon activated, thanks!";

    let button = document.querySelector("#confirmation");
    browser.storage.local.set({ user_confirmed: true });
}

document.querySelector("#confirmation").addEventListener("click", handleConfirmation);
