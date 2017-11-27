'use strict';

function onError(error) {
    console.log(`Error: ${error}`);
};

(function() {
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
            author: author,
            timestamp: timestamp_unix,
            text: text
        };

        browser.runtime.sendMessage(payload);
    });



}());
