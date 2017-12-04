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
    let author = $(comment).children().find(".author").text();
    let timestamp = $(comment).children().find("relative-time").attr("datetime");
    let timestamp_unix = Date.parse(timestamp);

    // Get text contents
    let paragraphs = $(comment).find("p");
    if (paragraphs.length < 1) {
        // Handle email text input
        paragraphs = $(comment).find(".email-fragment");
    }

    let text = [];
    $.each(paragraphs, function(idx, obj) {
        text.push($(obj).text());
    });

    let payload = {
        source: "github",
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

    $(this).fadeOut(200, function() {
      $(this).addClass("sent").text("Sent!").unbind();
    }).fadeIn();
}

// Build the button with dropdown

var icon_url = browser.extension.getURL("icons/logo_16.png");
var dropdown = $(".comment.timeline-comment h3.timeline-comment-header-text")
    .append("<div class=\"cf-classifier\"></div>")
    .children(".cf-classifier")
    .append("<button class=\"cf-dontlike\"><img src=\""+icon_url+"\" /> CrowdFilter</button>")
    .append("<div class=\"cf-dropdown\"></div>")
    .children(".cf-dropdown");

for (let c in classifiers) {
    $(dropdown).append("<a class=\"cf-dropdown-option\" href=\"#\">" + classifiers[c] + "</a>");
}


// Add onClick handler to the buttons
$(".cf-dontlike").click(handleClickOpen);
$(".cf-dropdown-option").click(function(e) {
    e.preventDefault();

    // Hide the popup when option is clicked
    $(this).parents(".cf-dropdown").hide();

    // Make button open menu again
    $(this).parents(".cf-dropdown").siblings("button").click(handleClickOpen);

    // Get comment object, text and URL and call handler
    let comment = $(this).parents(".comment");
    let classification = $(this).text();
    let currentURL = location.href;
    optionClicked(currentURL, comment, classification);
})

// Response that will be passed back by "executeScript"
var result = "Injection complete!";
result;
