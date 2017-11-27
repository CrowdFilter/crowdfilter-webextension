'use strict';
const stGet = browser.storage.local.get;
const stSet = browser.storage.local.set;

var client_id;

function onError(error) {
    console.log(`Error: ${error}`);
}

function log(message) {
    console.log(message);
}

function sendData(payload) {
    let json_data = {
        client_id: client_id,
        timestamp: Date.now(),
        payload: payload
    };

    var myRequest = new Request("http://localhost:5000/collect/sendto", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json_data),
        mode: 'no-cors',
        redirect: 'follow',
        referrer: 'client'
    });

    fetch(myRequest).then(function(response) {
      // .text returns another promise
      return response.text();
    }).then((text) => {
      log(text);
    }).catch((error) => {
      console.error(error)
    });
}


function handleMessage(message, sender, respond) {
    // sender example:
    // Object { id: "2d9730b8823235a6f43725cf793495128e3…", frameId: 0, url: "https://github.com/tootsuite/mastod…", envType: "content_child", extensionId: "2d9730b8823235a6f43725cf793495128e3…", contextId: "1550-1", tab: Object }

    sendData(message);
}

browser.runtime.onMessage.addListener(handleMessage);

// Fetch client_id from storage, if exists. Else create a new ID and store it.
stGet().then((storage) => {
    if (storage.client_id == null) {
        let id = Math.floor(Math.random() * 10**10);
        browser.storage.local.set({ client_id: id });
        client_id = id;
    } else {
        client_id = storage.client_id;
    }
}, onError);

