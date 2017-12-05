/*
 * Handler for click event on cf-dontlike button
 */
function handleClickOpen(e) {
    // "this" is the button
    let dropdown = $(this).siblings(".cf-dropdown");
    dropdown.show();
    $(dropdown).click(function(e) {
        e.stopPropagation();
    });

    $("body").click(handleClickClose);
    e.stopPropagation();
}

/*
 * Handler for click event that should close the popup
 */
function handleClickClose(e) {
    $(".cf-dropdown").hide();
    $(".cf-dontlike").click(handleClickOpen);
    $("body").unbind("click");
    e.stopPropagation();
}

/*
 * Sending the payload object to the background script,
 * which forwards it towards the remote API
 */
function sendPayloadToBackground(payload) {
    browser.runtime.sendMessage({
        src: "injector",
        payload: payload
    });
}

/*
 * Handler for click event on option in popup.
 */
function optionClicked(currentURL, comment, classification, source) {
    let payload = {
        source: source,
        original_url: currentURL,
        html: $(comment).html(),
        classification: classification
    };

    sendPayloadToBackground(payload);
}

/*
 * This function appends the button and dropdown to an element,
 * which is passed as string (e.g. name of class) into it.
 */
function getDropdown(element) {
    return $(element)
        .append("<div class=\"cf-classifier\"></div>")
        .children(".cf-classifier")
        .append("<button class=\"cf-dontlike\"><img src=\""+icon_url+"\" /> CrowdFilter</button>")
        .append("<div class=\"cf-dropdown\"></div>")
        .children(".cf-dropdown");
}

var classifiers = [
    "Dislike",
    "Spam",
    "Harassment",
    "Racism"
];

var icon_url = browser.extension.getURL("icons/logo_16.png");

