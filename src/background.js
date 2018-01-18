'use strict';
const stGet = browser.storage.local.get;
const stSet = browser.storage.local.set;
const lang = browser.i18n.getUILanguage().startsWith("de") ? "de" : "en";

var client_id = Math.floor(Math.random() * (2**32 - 10**9 + 1)) + 10**9;
var sentData = [];

// Set default HTTPS endpoint
var collectorHostname = "https://crowdfilter.bitkeks.eu/collector";

const classifiers = [
    {
        "keyword": {
            "en": "Harassment",
            "de": "Belästigung"
        },
        "description": {
            "en": "Content that primarily attacks someone",
            "de": "Inhalte, die vorrangig jemanden belästigen sollen"
        }
    },

    {
        "keyword": {
            "en": "Trolling",
            "de": "Trolling"
        },
        "description": {
            "en": "Content intended to provoke extrem reactions",
            "de": "Inhalte, die extreme Reaktionen hervorrufen sollen"
        }
    },

    {
        "keyword": {
            "en": "Racism",
            "de": "Rassismus"
        },
        "description": {
            "en": "Bad content that aims at race, origin or ethnic of the poster",
            "de": "Beiträge, die sich vorrangig gegen Rasse, Herkunft oder Ethnie richten"
        }
    },

    {
        "keyword": {
            "en": "Fake News",
            "de": "Fake News"
        },
        "description": {
            "en": "Content that is provable factually false",
            "de": "Belegbar falsche bzw. unwahre Aussagen"
        }
    },

    {
        "keyword": {
            "en": "Useless contribution",
            "de": "Unbrauchbarer Beitrag"
        },
        "description": {
            "en": "Contribution does not add value to the discussion",
            "de": "Inhalt leistet keinen sinnvollen Beitrag zur Diskussion"
        }
    },

    {
        "keyword": {
            "en": "Sexism",
            "de": "Sexismus"
        },
        "description": {
            "en": "Targeting the sex of the attacked person",
            "de": "Angriff, der sich vorwiegend auf das Geschlecht der anderen Person bezieht"
        }
    },

    {
        "keyword": {
            "en": "Xenophobia",
            "de": "Fremdenfeindlichkeit"
        },
        "description": {
            "en": "Attacking a person because of their geographical origin",
            "de": "Verurteilung einer Person basierend auf deren geographischer Herkunft"
        }
    }
];

/*
 * Setup and handling of the context menu items which are used in this addon
 */

// Create an ID to classification mapping to look up the classification
// after the user clicks on the context menu item. (the info object does
// not provide the title attribute..)
var classification_mapping = {};

// Create the context menu top item
browser.contextMenus.create({
    id: "cf-top",
    title: "CrowdFilter",
    contexts: ["selection"]
});

// And all children items, the classifications
var sort_function = function(a, b) { return a.keyword[lang] < b.keyword[lang] ? -1 : 1 };
for (let classification of classifiers.sort(sort_function)) {
    let classification_title = classification.keyword[lang];
    let converted_title = classification.keyword[lang].toLowerCase().replace(" ", "_");

    // Add both strings to mapping
    classification_mapping[converted_title] = classification_title;

    // Create the context menu child item
    browser.contextMenus.create({
        id: "cf-classification-" + converted_title,
        parentId: "cf-top",
        title: classification_title
    });
}

// Event handling of clicking on an item
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (!info.menuItemId.startsWith("cf-")) {
        // Ignore any clicks on other context menu items
        return;
    }

    let url = tab.url;
    let page_title = tab.title;

    let itemId = info.menuItemId;
    let selection = info.selectionText;

    if (itemId == "cf-top") {
        return;
    }

    // Fetch the classifications original title from the mapping
    let classification = classification_mapping[itemId.substr("cf-classification-".length)];

    let payload = {
        original_url: url,
        page_title: page_title,
        selection: selection,
        classification: classification
    };

    sendData(payload);
});


/*
 * Fetch client_id from storage, if exists. Else create a new ID and store it.
 * Client ID is a 10-digit number between 1000000000 and 2**32.
 */
stGet().then((storage) => {
    if (storage.client_id == null) {
        stSet({ client_id: client_id });
    } else {
        client_id = storage.client_id;
    }

    if (storage.sentData == null) {
        stSet({ sentData: [] });
    } else {
        sentData = storage.sentData;
    }

    stSet({ classifiers: classifiers });
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

    var req = new Request(collectorHostname + "/collect/sendto/v2", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json_data),
        redirect: 'follow',
        referrer: 'client',
        mode: 'cors'
    });

    fetch(req).then(function(response) {
        appendSentData(json_data);
    }).catch(error => { console.error(error); });
}

/*
 * Send feedback from options form to endpoint
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
        referrer: 'client',
        mode: 'cors'
    });

    fetch(req).then(function(response) {
        appendSentData(json_data);
    }).catch(error => { console.error(error); });
}

/*
 * Handle clicks on the toolbar button.
 */
function handleActionClick(tab) {
    let url = lang == "de"? "/infopage/index-de.html":"/infopage/index.html";
    let new_tab = browser.tabs.create({
        active: true,
        index: tab.index + 1,
        url: url
    });
}

/*
 * Handle messages from infopage
 */
function handleMessage(message, sender, respond) {
    // Handle request for client ID to display in popup
    if (message.subject == "feedback") {
        if (message.content.length < 1) return;
        sendFeedback(message.content);
    }
}

/*
 * Add listeners for events.
 */
browser.runtime.onMessage.addListener(handleMessage);
browser.storage.onChanged.addListener(handleStorageChange);
browser.browserAction.onClicked.addListener(handleActionClick);
