/*
 * Show the icon (page_action) in the address bar.
 * Clicking on it shows a popup.
 */
function show_page_action() {
    // Enable popup for current tab
    browser.tabs.query({active: true, currentWindow: true})
        .then(function(tabs) {
            browser.pageAction.show(tabs[0].id);
        })
        .catch(error => { console.error(error) });
}

/*
 * Inject an injector script into the page.
 */
function inject(injector) {
    browser.tabs.executeScript({
        file: "/js/injectors/" + injector + ".js",
        allFrames: true,
        runAt: "document_idle"
    }).then(function(result) {
    }, function(error) {
        console.error(error);
    });
}


function url_catcher(details) {
    // Check each filter
    let url = details.url;
    let regexp;
    for (const key of Object.keys(filters)) {
        regexp = new RegExp(filters[key], "i");
        if (url.match(regexp) != null) {
            show_page_action();
            inject(key);
            break;
        }
    };
}

// only in background scripts!
browser.webRequest.onCompleted.addListener(
    url_catcher,
    {  // Filter
        urls: [
            "https://github.com/*/*",
            "https://www.heise.de/forum/*/News-Kommentare/*",
            "https://twitter.com/*/status/*"
        ]
    }
);
