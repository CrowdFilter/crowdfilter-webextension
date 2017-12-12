'use strict';
const stGet = browser.storage.local.get;
const stSet = browser.storage.local.set;

function saveOptions(e) {
  stSet({ useTor: document.querySelector("#useTor").checked });
  restoreOptions();
  e.preventDefault();
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
document.querySelector("#settings").addEventListener("submit", saveOptions);
document.querySelector("#feedback").addEventListener("submit", sendFeedback);
