'use strict';

function onError(error) {
    console.log(`Error: ${error}`);
};

(function() {
    //~ var comments = document.getElementsByClassName('comment timeline-comment');
    //~ console.log(comments);

    var text = $(".comment-body p")
        //~ .css("border", "3px solid red")
        .text();

    $(".comment.timeline-comment h3.timeline-comment-header-text")
        .append("<button class=\"cf-dontlike\">Dislike</button>");

    console.log(text);


    var payload = {
        "timestamp": Date.now()
    };

    var msg = browser.runtime.sendMessage(payload);
    //~ msg.then((response) => {
      //~ console.log(response);
    //~ });
}());
