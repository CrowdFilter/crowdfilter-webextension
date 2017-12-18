'use strict';
const stGet = browser.storage.local.get;
const stSet = browser.storage.local.set;
const lang = browser.i18n.getUILanguage().startsWith("de") ? "de" : "en";


function saveOptions(e) {
    stSet({ useTor: document.querySelector("#useTor").checked });
    restoreOptions();
    e.preventDefault();
}

function loadClassifiers() {
    stGet("classifiers").then(storage => {
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
    });
}

function restoreOptions() {
    document.querySelector("label#useTor-label").innerText = browser.i18n.getMessage("useTorLabel");
    var storageItem = browser.storage.local.get('useTor');
    storageItem.then((res) => {
        let output = document.querySelector("#use-tor");
        let cl = output.classList;

        if (res.useTor) {
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

function sendFeedback(e) {
    let commentElement = document.querySelector("#comment");
    let thanksElement = document.querySelector(".thanks");

    // Save the comment into the storage, to be read by background script
    stSet({ feedback: commentElement.value });

    // Delete content of textarea and show thanks message
    commentElement.value = "";
    thanksElement.style.display = "block";

    // Hide thanks message after 10 seconds
    window.setTimeout(function() { thanksElement.style.display = "none"; }, 10000);

    e.preventDefault();
    e.stopPropagation();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', loadClassifiers);
document.querySelector("#settings").addEventListener("submit", saveOptions);
document.querySelector("#feedback").addEventListener("submit", sendFeedback);
