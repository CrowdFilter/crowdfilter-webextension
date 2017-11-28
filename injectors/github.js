'use strict';

$(".comment.timeline-comment h3.timeline-comment-header-text")
    .append("<button class=\"cf-dontlike\">Dislike</button>");

$(".cf-dontlike").click(function() {
    let comment = $(this).parents(".comment");

    // Get metadata
    let author = $(this).parent().find(".author").text();
    let timestamp = $(this).parent().find("relative-time").attr("datetime");
    let timestamp_unix = Date.parse(timestamp);

    // Get text contents
    let paragraphs = $(comment).find("p");
    let text = [];
    $.each(paragraphs, function(idx, obj) {
        text.push($(obj).text());
    });

    let payload = {
        source: "github",
        author: author,
        timestamp: timestamp_unix,
        text: text
    };

    browser.runtime.sendMessage(payload);

    $(this).fadeOut(200, function() {
      $(this).addClass("sent").text("Sent!").unbind();
    }).fadeIn();
});

// Response that will be passed back by "executeScript"
var result = "Injection complete!";
result;
