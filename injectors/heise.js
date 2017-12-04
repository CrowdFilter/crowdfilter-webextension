'use strict';

var classifiers = [
    "Dislike",
    "Spam",
    "Harassment",
    "Racism"
];

function handleClickOpen(e) {
    // "this" is the button
    $(this).siblings(".cf-dropdown").show();
    $(this).click(handleClickClose);
}

function handleClickClose(e) {
    // "this" is button
    $(this).siblings(".cf-dropdown").hide();
    $(this).click(handleClickOpen);
}

function optionClicked(currentURL, comment, classification) {
    // Get metadata
    let author = $(comment).find(".full_user_string").text();
    let timestamp = $(comment).find(".posting_timestamp").data("mysql-beautify-date");
    let timestamp_unix = Date.parse(timestamp);

    // Get post content as HTML (for now, handling quotes can be done in backend)
    let text = []
    text.push($(comment).find(".post").html());

    let payload = {
        source: "heise",
        author: author,
        original_url: currentURL,
        timestamp: timestamp_unix,
        text: text,
        classification: classification
    };

    browser.runtime.sendMessage({
        src: "injector",
        payload: payload
    });
}

// Build the button with dropdown

var icon_url = browser.extension.getURL("icons/logo_16.png");
var dropdown = $(".metabar")
    .append("<div class=\"cf-classifier\"></div>")
    .children(".cf-classifier")
    .append("<button class=\"cf-dontlike\"><img src=\""+icon_url+"\" /> CrowdFilter</button>")
    .append("<div class=\"cf-dropdown\"></div>")
    .children(".cf-dropdown");

for (let c in classifiers) {
    $(dropdown).append("<a class=\"cf-dropdown-option\" href=\"#\">" + classifiers[c] + "</a>");
};


// Add onClick handler to the buttons
$(".cf-dontlike").click(handleClickOpen);
$(".cf-dropdown-option").click(function(e) {
    e.preventDefault();

    // Hide the popup when option is clicked
    $(this).parents(".cf-dropdown").hide();

    // Make button open menu again
    $(this).parents(".cf-dropdown").siblings("button").click(handleClickOpen);

    // Get comment object, text and URL and call handler
    let comment = $(this).parents("div[id^='posting_']");
    let classification = $(this).text();
    let currentURL = location.href;
    optionClicked(currentURL, comment, classification);
})

// Response that will be passed back by "executeScript"
var result = "Injection complete!";
result;
