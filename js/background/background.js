'use strict';
const stGet = browser.storage.local.get;
const stSet = browser.storage.local.set;

const config = {
    "filters": {
        "github": "issues/[0-9]{1,10}\\??",
        "heise": "/(News-)?Kommentare/.*/(thread|posting)-",
        "twitter": "/status/[0-9]*(\\?conversation.*)?"
    },

    "classifiers": [
        {
            "keyword": {
                "en": "Harassment",
                "de": "Belästigung"
            },
            "description": {
                "en": "Content that primarily attacks someone",
                "de": "Inhalte, die vorrangig jemanden angreifen sollen"
            },
            "positive": false
        },

        {
            "keyword": {
                "en": "Trolling",
                "de": "Trolling"
            },
            "description": {
                "en": "Content intended to provoke extrem reactions",
                "de": "Inhalte, die extreme Reaktionen hervorrufen sollen"
            },
            "positive": false
        },

        {
            "keyword": {
                "en": "Racism",
                "de": "Rassismus"
            },
            "description": {
                "en": "Bad content that aims at race, origin or ethnic of the poster",
                "de": "Beiträge, die sich vorrangig gegen Rasse, Herkunft oder Ethnie richten"
            },
            "positive": false
        },

        {
            "keyword": {
                "en": "Fake News",
                "de": "Fake News"
            },
            "description": {
                "en": "Content that is provable factually false",
                "de": "Belegbar falsche bzw. unwahre Aussagen"
            },
            "positive": false
        },

        {
            "keyword": {
                "en": "Bad contribution",
                "de": "Schlechter Beitrag"
            },
            "description": {
                "en": "Generally bad contribution, does not add value to the discussion",
                "de": "Kein sinnvoller Beitrag zur Diskussion"
            },
            "positive": false
        },

        {
            "keyword": {
                "en": "Compliment",
                "de": "Kompliment"
            },
            "description": {
                "en": "This post is a compliment for someone else",
                "de": "Dieser Beitrag ist ein Kompliment für einen anderen Teilnehmer"
            },
            "positive": true
        },

        {
            "keyword": {
                "en": "Good contribution",
                "de": "Guter Beitrag"
            },
            "description": {
                "en": "Post is a good contribution to the debate",
                "de": "Inhalt ist guter Beitrag zur Diskussion"
            },
            "positive": true
        }
    ]
};

var client_id;
var lang = browser.i18n.getUILanguage();
var sentData;

// Set default HTTPS endpoint
var collectorHostname = "https://crowdfilter.bitkeks.eu/collector";


/*
 * Fetch client_id from storage, if exists. Else create a new ID and store it.
 * Client ID is a 10-digit number between 1000000000 and 2**32.
 */
stGet().then((storage) => {
    if (storage.client_id == null) {
        let id = Math.floor(Math.random() * (2**32 - 10**9 + 1)) + 10**9;
        stSet({ client_id: id });
        client_id = id;
    } else {
        client_id = storage.client_id;
    }

    if (storage.sentData == null) {
        stSet({ sentData: [] });
    } else {
        sentData = storage.sentData;
    }

    stSet({ classifiers: config.classifiers });
}, error => { console.error(error) });

/*
 * Listen for changes in the local storage and handle some option changes
 * as well as handling of comments sent as feedback. Needed, because the async
 * sendMessage broke in options page.
 */
function handleStorageChange(changes, areaName) {
    // Handle TOR checkbox
    if (changes["useTor"] != undefined) {
        if (changes["useTor"].newValue == true) {
            toggleTor(true);
            return;
        }
        toggleTor(false);
    }

    // Hack to buffer feedback comments.
    // Does not work with sendMessage in options page, so options page sets
    // a new value for the "setting", which triggers this function.
    // Second condition: handle ONLY new feedbacks, not removal.
    // storage.remove produces an object with no newValue.
    if (changes.feedback != null && changes.feedback.newValue != null) {
        let comment = changes.feedback.newValue;
        if (comment == "") return;
        sendFeedback(comment);
        browser.storage.local.remove("feedback")
            .then(null, error => { console.error(error); });
    }
}

/*
 * Toggle the collector hostname, triggered by a change of options
 * on the addon option page.
 */
function toggleTor(useTor) {
    if (useTor) {
        collectorHostname = "http://5yxnb2zpucxtxbls.onion/collector";
        return;
    }
    collectorHostname = "https://crowdfilter.bitkeks.eu/collector";
}

/*
 * Append a JSON item to sentData buffer and storage for persistence
 */
function appendSentData(item) {
    sentData.push(item);
    stSet({ sentData: sentData });
}

/*
 * Send JSON to collector endpoint
 */
function sendData(payload) {
    let json_data = {
        client_id: client_id,
        timestamp: Date.now(),
        payload: payload
    };

    var req = new Request(collectorHostname + "/collect/sendto", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json_data),
        redirect: 'follow',
        referrer: 'client'
    });

    fetch(req).then(function(response) {
      // .text returns another promise
      return response.json();
    }).then((json) => {
        appendSentData(json_data);
    }).catch(error => { console.error(error); });
}

/*
 *
 */
function sendFeedback(comment) {
    let json_data = {
        client_id: client_id,
        timestamp: Date.now(),
        comment: comment
    };

    var req = new Request(collectorHostname + "/collect/feedback", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json_data),
        redirect: 'follow',
        referrer: 'client'
    });

    fetch(req).then(function(response) {
      // .text returns another promise
      return response.json();
    }).then((json) => {
        appendSentData(json_data);
    }).catch(error => { console.error(error); });
}

/*
 * Handle messages from content scripts (injectors)
 */
function handleMessage(message, sender, respond) {
    // Filter messages from popup
    if (message.src == "popup") {
        // Handle request for client ID to display in popup
        if (message.msg == "getClientId") {
            respond({ msg: client_id });
        }

        // Handle request for latest sent data
        if (message.msg == "getSentData") {
            respond({ msg: sentData });
        }
    }

    if (message.src == "injector") {
        if (message.cmd != null) {
            switch (message.cmd) {
                case "getClassifiers":
                    respond({
                        type: "getClassifiers",
                        response: config.classifiers
                    });
                    break;
            }
        }

        if (message.payload != null) {
            // Injector content script send a payload to be saved in database
            sendData(message.payload);
        }
    }
}

/*
 * Handle clicks on the address bar button.
 */
function handleActionClick(tab) {
    let url = browser.i18n.getUILanguage() == "de"? "/infopage/index-de.html":"/infopage/index.html";
    let new_tab = browser.tabs.create({
        active: true,
        index: tab.index + 1,
        url: url
    });
}

/*
 * Add listeners for events.
 */
browser.runtime.onMessage.addListener(handleMessage);
browser.pageAction.onClicked.addListener(handleActionClick);
browser.storage.onChanged.addListener(handleStorageChange);
