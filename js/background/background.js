'use strict';
const stGet = browser.storage.local.get;
const stSet = browser.storage.local.set;

var client_id;
var sentDataBuffer = [];
var lang = browser.i18n.getUILanguage();

// Filters are key-value regexp used in the injector
var filters;
var classifiers;

function onError(error) {
    console.log(`Error: ${error}`);
}

/*
 * Fetch client_id from storage, if exists. Else create a new ID and store it.
 * Client ID is a 10-digit number between 1000000000 and 2**32.
 */
stGet().then((storage) => {
    if (storage.client_id == null) {
        let id = Math.floor(Math.random() * (2**32 - 10**9 + 1)) + 10**9;
        browser.storage.local.set({ client_id: id });
        client_id = id;
    } else {
        client_id = storage.client_id;
    }
}, onError);

fetchConfig("filters", function(res) {
    filters = res;
});

fetchConfig("classifiers/"+lang, function(res) {
    classifiers = res;
});

/*
 * Send JSON to collector endpoint
 */
function sendData(payload) {
    let json_data = {
        client_id: client_id,
        timestamp: Date.now(),
        payload: payload
    };

    var req = new Request("http://localhost:5000/collect/sendto", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json_data),
        mode: 'no-cors',
        redirect: 'follow',
        referrer: 'client'
    });

    fetch(req).then(function(response) {
      // .text returns another promise
      return response.text();
    }).then((text) => {
      sentDataBuffer.push(json_data);
    }).catch(onError);
}

/*
 * Get config for $endpoint and call $callback with the received JSON
 */
function fetchConfig(endpoint, callback) {
    let req = new Request("http://localhost:5000/config/"+endpoint, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        mode: 'no-cors',
        redirect: 'follow',
        referrer: 'client'
    });

    fetch(req).then(function(response) {
        return response.json();
    }).then(function(res) {
        callback(res);
    }).catch(onError);
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
        if (message.msg == "getSentDataBuffer") {
            respond({ msg: sentDataBuffer });
        }
    }

    if (message.src == "injector") {
        if (message.cmd != null) {
            switch (message.cmd) {
                case "getClassifiers":
                    respond({ type: "getClassifiers", response: classifiers });
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
