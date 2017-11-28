'use strict';

//~ var detector_port = browser.runtime.connect({ name: "injector" });
//~ detector_port.postMessage({ msg: "Test message from CS" });
//~ detector_port.onMessage.addListener(function (m) {
    //~ console.log(m.msg);
//~ });

//~ function onError(error) {
    //~ console.log(`Error: ${error}`);
//~ };


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
});
