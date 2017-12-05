'use strict';

var dropdown = getDropdown(".metabar");

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
    let comment = $(this).parents("[id^='posting_']");
    let classification = $(this).text();
    let currentURL = location.href;
    optionClicked(currentURL, comment, classification, "heise");
})

// Response that will be passed back by "executeScript"
var result = "Injection complete!";
result;
