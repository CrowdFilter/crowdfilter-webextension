'use strict';
const stGet = browser.storage.local.get;
const stSet = browser.storage.local.set;
const lang = browser.i18n.getUILanguage().startsWith("de") ? "de" : "en";


function handleSaveOptions(e) {
    stSet({ useTor: document.querySelector("#useTor").checked });
    loadTorOption();
    e.preventDefault();
    e.stopPropagation();
}

function loadTorOption() {
    let output = document.querySelector("#use-tor");
    let cl = output.classList;

    stGet("useTor").then((storage) => {
        if (storage.useTor) {
            output.innerText = browser.i18n.getMessage("useTorPos");
            cl.add("pos");
            if (cl.contains("neg")) {
                cl.remove("neg");
            }
        } else {
            output.innerText = browser.i18n.getMessage("useTorNeg");
            cl.add("neg");
            if (cl.contains("pos")) {
                cl.remove("pos");
            }
        }
    });
}

function handleFeedback(e) {
    e.preventDefault();
    e.stopPropagation();

    let commentElement = document.querySelector("#comment");
    let thanksElement = document.querySelector(".thanks");

    if (commentElement.value.length < 1) return;
    browser.runtime.sendMessage({
        subject: "feedback",
        content: commentElement.value
    });

    // Delete content of textarea and show thanks message
    commentElement.value = "";
    thanksElement.style.display = "block";

    // Hide thanks message after 10 seconds
    window.setTimeout(function() { thanksElement.style.display = "none"; }, 10000);
}


document.querySelector("label#useTor-label").innerText = browser.i18n.getMessage("useTorLabel");

// Everything is wrapped inside the async storage request
stGet().then((storage) => {
    // Show the client ID, which is unique in every installation
    document.querySelector("#client-id").innerText = storage.client_id;

    // Insert table with classifiers
    let cl = storage.classifiers;
    let sort_func = function(a, b) {
        // Reversed because of table row insert!
        if (a.keyword[lang] < b.keyword[lang]) {
            return 1;
        } else if (a.keyword[lang] > b.keyword[lang]) {
            return -1;
        }
        return 0;
    };
    let table = document.querySelector("table#classifiers");
    for (let c of cl.sort(sort_func)) {
        let row = table.insertRow(1);
        let cell = row.insertCell();
        cell.innerText = c.keyword[lang];

        cell = row.insertCell();
        cell.innerText = c.description[lang];

    }

    // Handle useTor boolean option
    loadTorOption();

    // Create a table of sent data to be reviewed by the user
    table = document.querySelector("#sentDataBuffer");
    for (let item of storage.sentData) {
        // Create a new row on top of the table
        let row = table.insertRow(1);
        let cell = row.insertCell();

        // Calculate time difference in minutes from the timestamp
        let timestamp = item.timestamp;
        let diff = Math.round((Date.now() - timestamp)/1000/60);
        cell.innerText = diff + " minutes ago";
        if (diff == 1) {
            // Handle "1 minute"
            cell.innerText = diff + " minute ago";
        }

        // Insert second cell with raw data that was sent to remote server
        cell = row.insertCell();
        if (item.comment != null) {
            // Feedback sent
            cell.innerText = "Feedback: " + item.comment;
        } else if (item.payload != null) {
            // Classification sent. Short the selection text

            if (item.payload.selection.length > 100) {
                item.payload.selection = item.payload.selection.substr(0, 100).trim() + "..";
            }
            cell.innerText = JSON.stringify(item);
            cell.classList.add('monospace');
        }
    }
});

// Event listeners
document.querySelector("#settings").addEventListener("submit", handleSaveOptions);
document.querySelector("#feedback").addEventListener("submit", handleFeedback);
