'use strict';
const stGet = browser.storage.local.get;
const stSet = browser.storage.local.set;

var client_id;
var sentDataBuffer = [];

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
    }).catch((error) => {
      console.error(error)
    });
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
    } else if (message.src == "injector") {
        // Injector content script send a payload to be saved in database
        sendData(message.payload);
    }
}

/*
 * Handle clicks on the address bar button.
 */
function handleActionClick(tab) {
    let new_tab = browser.tabs.create({
        active: true,
        index: tab.index + 1,
        url: "/infopage/index.html"
    });
}

/*
 * Add listeners for events.
 */
browser.runtime.onMessage.addListener(handleMessage);
browser.pageAction.onClicked.addListener(handleActionClick);

