// This code is inject in all the pages to intercept the messages for the browser wallet
// the code injectiob is managed by the Manifest.json of the extension: "content_scripts"
window.addEventListener("message", function(event) {
    // We only accept messages from this window to itself [i.e. not from any iframes] (security concerns)
    //if (event.source != window)
    //    return;
    if (event.data.type && (event.data.type == "BROWSER-WALLET")) {        
        //chrome.runtime.sendMessage(event.data); // broadcasts it to rest of extension, or could just broadcast event.data.payload...
        chrome.runtime.sendMessage(event.data, (response) => {
            // 3. Got an asynchronous response with the data from the background
            console.log('received user data', response);
            localStorage.setItem("webwallet",JSON.stringify(response));
        }); 
    } 
}, false);