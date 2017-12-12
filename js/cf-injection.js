/*
 * Handler for click event on cf-dontlike button
 */
function handleClickOpen(e) {
    // "this" is the button
    let dropdown = e.target.nextSibling;
    dropdown.style.display = "block";
    dropdown.addEventListener("click", function(e) {
        e.stopPropagation();
    });
    document.querySelector("body").addEventListener("click", handleClickClose);
    e.stopPropagation();
}

/*
 * Handler for click event that should close the popup
 */
function handleClickClose(e) {
    document.querySelectorAll(".cf-dropdown").forEach(function(v,i,o) {
        v.style.display = "none";
    });
    document.querySelectorAll(".cf-dontlike").forEach(function(v,i,o) {
        v.onlick = handleClickOpen;
    });
    document.querySelector("body").removeEventListener("click", handleClickClose);
    e.stopPropagation();
}

/*
 * Send data after click event on option in popup.
 */
function sendOptionData(currentURL, comment, classification, source) {
    let payload = {
        source: source,
        original_url: currentURL,
        html: comment.innerHTML,
        classification: classification
    };

    sendPayloadToBackground(payload);
}

/*
 * Handler for option click
 */
function optionClicked(e) {
    e.preventDefault();

    // Hide the popup when option is clicked
    this.parentElement.style.display = "none";

    // Make button open menu again
    document.querySelectorAll(".cf-classifier > button").forEach(function(v,i,o) {
        v.addEventListener("click", handleClickOpen);
    });

    // Get comment object, text and URL and call handler
    let comment = this.parentElement;
    if (comment_element_id_prefix != null) {
        // Comment element identified by id
        while (!comment.id.startsWith(comment_element_id_prefix)) {
            comment = comment.parentElement;
        }
    } else {
        // Comment element identified by class names
        while (!comment_element_classes.every(e => comment.classList.contains(e))) {
            comment = comment.parentElement;
        }
    }

    let classification = this.innerText;
    let currentURL = location.href;
    sendOptionData(currentURL, comment, classification, clicked_source);

    e.stopPropagation();
}


/*
 *
 */
function injectButton(injection_element_identifier) {
    var els = d.querySelectorAll(injection_element_identifier);

    console.log(els);

    els.forEach(function(val, idx, obj) {
        let di = d.createElement("div");
        di.classList.add("cf-classifier");
        val.appendChild(di);

        let button = d.createElement("button");
        button.classList.add("cf-dontlike");
        di.appendChild(button);
        button.addEventListener("click", handleClickOpen);

        let img = d.createElement("img");
        img.setAttribute("src", icon_url);
        let text = d.createTextNode(" CrowdFilter");
        button.appendChild(img);
        button.appendChild(text);

        let dd = d.createElement("div");
        dd.classList.add("cf-dropdown");
        for (let c in classifiers) {
            let option = d.createElement("a");
            option.classList.add("cf-dropdown-option");
            option.setAttribute("href", "#");
            option.addEventListener("click", optionClicked);

            let text = d.createTextNode(classifiers[c]);
            option.appendChild(text);

            dd.appendChild(option);
        };
        di.appendChild(dd);
    });
}

var classifiers;
var icon_url = browser.extension.getURL("icons/logo_16.png");
var d = document;

sendCommandToBackground("getClassifiers");

/*
 * Sending the payload object to the background script,
 * which forwards it towards the remote API
 */
function sendPayloadToBackground(payload) {
    browser.runtime.sendMessage({
        src: "injector",
        payload: payload
    });
}

function sendCommandToBackground(cmd) {
    browser.runtime.sendMessage({
        src: "injector",
        cmd: cmd
    }).then(handleResponse, error => { console.error(error); });
}

function handleResponse(message) {
    switch (message.type) {
        case "getClassifiers":
            classifiers = message.response;
            break;
    }
}

