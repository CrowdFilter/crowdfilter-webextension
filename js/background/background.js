'use strict';
const stGet = browser.storage.local.get;
const stSet = browser.storage.local.set;

var client_id;
var sentDataBuffer = [];
var lang = browser.i18n.getUILanguage();

// Filters are key-value regexp used in the injector
var filters;
var classifiers;

// Set default HTTPS endpoint
var collectorHostname = "https://crowdfilter.bitkeks.eu/collector";

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
}, error => { console.error(error) });


/*
 * Listen for changes in the local storage and handle some option changes
 */
function handleStorageChange(changes, areaName) {
    if (changes["useTor"] != undefined) {
        if (changes["useTor"].newValue) {
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
    console.log("Setting hostname to TOR: ", useTor);
    if (useTor) {
        collectorHostname = "http://5yxnb2zpucxtxbls.onion/collector";
        return;
    }
    collectorHostname = "https://crowdfilter.bitkeks.eu/collector";
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
      sentDataBuffer.push(json_data);
    }).catch(error => { console.log(error); });
}

/*
 * Get config for $endpoint and call $callback with the received JSON
 */
function fetchConfig() {
    let req = new Request(collectorHostname + "/config", {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        redirect: 'follow',
        referrer: 'client'
    });

    fetch(req).then(function(response) {
        return response.json();
    }).then(function(config) {
        stSet({config: config});
        filters = config.filters;
        if (lang == "de") {
            classifiers = config.classifiers.de;
        } else {
            classifiers = config.classifiers.en;
        }
    }).catch(error => { console.log(error); });
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
browser.storage.onChanged.addListener(handleStorageChange);

browser.runtime.onStartup.addListener(fetchConfig);
browser.runtime.onInstalled.addListener(fetchConfig);

// Init timer to regularly fetch the config
window.setInterval(fetchConfig, 60000);
