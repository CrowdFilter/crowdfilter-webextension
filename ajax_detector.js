function onError(error) {
    console.log(`Error: ${error}`);
}

function url_catcher(details) {
    let url = details.url;

    if (url.includes("/issues/")) {
        browser.tabs.executeScript({
            file: "/injectors/github.js"
        }).then(function(result) {
            //~ console.log(result);
        }, onError);
    }
}

// only in background scripts!
browser.webRequest.onCompleted.addListener(
    url_catcher,
    {  // Filter
        urls: [
            "https://github.com/*/*",
            "https://github.com/*/*/*"
        ]
    }
);


// Messaging with content script
//~ var content_port;
//~ browser.runtime.onConnect.addListener(function(port) {
    //~ content_port = port;
    //~ console.log(port);
    //~ content_port.onMessage.addListener(function (m) {
        //~ console.log(m.msg);
    //~ });
//~ });
