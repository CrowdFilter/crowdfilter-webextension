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
        .catch(onError);
}

/*
 * Inject an injector script into the page.
 */
function inject(injector) {
    browser.tabs.executeScript({
        file: "/injectors/" + injector + ".js"
    }).then(function(result) {
    }, onError);
}


function url_catcher(details) {
    let url = details.url;

    if (url.includes("/issues/")) {
        show_page_action();
        inject("github");
    }
}

// only in background scripts!
browser.webRequest.onCompleted.addListener(
    url_catcher,
    {  // Filter
        urls: [
            "https://github.com/*/*"
        ]
    }
);
