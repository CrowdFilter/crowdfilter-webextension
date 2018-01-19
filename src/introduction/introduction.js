function handleConfirmation(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.innerText = "Addon activated, thanks!";

    let button = document.querySelector("#confirmation");
    browser.storage.local.set({ user_confirmed: true });
    checkConfirmed();
}

function checkConfirmed() {
    // Check the storage user_confirmed to replace the dialog
    let confirmed = browser.storage.local.get("user_confirmed");
    confirmed.then(storage => {
        if (storage.user_confirmed == true) {
            document.querySelector("#confirmation-dialog").innerText = browser.i18n.getMessage("confirmationAlreadyGiven");
        }
    });
}

checkConfirmed();
document.querySelector("#confirmation").addEventListener("click", handleConfirmation);
