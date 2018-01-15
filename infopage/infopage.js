function sendMessage(command, callback) {
    try {
        let response = browser.runtime.sendMessage({
            payload: command
        });
        response.then(callback, (e) => { console.error(e) });
    } catch (e) {
        console.error(e);
    }
}

sendMessage("setup", function(response) {
    // Show the client ID, which is unique in every installation
    document.querySelector("#client-id").innerText = response.client_id;

    // Create a table of sent data to be reviewed by the user
    let table = document.querySelector("#sentDataBuffer");
    for (let item in response.sentData) {
        // Create a new row on top of the table
        let row = table.insertRow(1);
        let cell = row.insertCell();

        // Calculate time difference in minutes from the timestamp
        let timestamp = response.sentData[item].timestamp;
        let diff = Math.round((Date.now() - timestamp)/1000/60);
        cell.innerText = diff + " minutes ago";
        if (diff == 1) {
            // Handle "1 minute"
            cell.innerText = diff + " minute ago";
        }

        // Insert second cell with raw data that was sent to remote server
        cell = row.insertCell();
        let data = response.sentData[item];
        if (data.comment != null) {
            // Feedback sent
            cell.innerText = "Feedback: " + data.comment;
        } else if (data.payload != null) {
            // Classification sent. Short the selection text

            if (data.payload.selection.length > 100) {
                data.payload.selection = data.payload.selection.substr(0, 100).trim() + "..";
            }
            cell.innerText = JSON.stringify(data);
            cell.classList.add('monospace');
        }
    }
});
