function sendMessage(message, callback) {
    let chan = browser.runtime.sendMessage({
        src: "popup",
        msg: message
    });

    chan.then(callback);
}

// Automatically retrieve client ID to display in popup
sendMessage("getClientId", function(response) {
    document.querySelector("#client-id").innerHTML = response.msg;
});

// Fetch latest sent data and generate a table
sendMessage("getSentDataBuffer", function(response) {
    let table = document.querySelector("#sentDataBuffer");
    for (let item in response.msg) {
        // Create a new row on top of the table
        let row = table.insertRow(1);
        let cell = row.insertCell();

        // Calculate time difference in minutes from the timestamp
        let timestamp = response.msg[item].timestamp;
        let diff = Math.round((Date.now() - timestamp)/1000/60);
        cell.innerHTML = diff + " minutes ago";
        if (diff == 1) {
            // Handle "1 minute"
            cell.innerHTML = diff + " minute ago";
        }

        // Insert second cell with raw data that was sent to remote server
        cell = row.insertCell();
        let data = response.msg[item];
        if (data.comment != null) {
            cell.innerHTML = "Feedback: " + data.comment;
        } else {
            data.payload.html = [];
            cell.innerHTML = JSON.stringify(data);
            cell.classList.add('monospace');
        }
    }
});
