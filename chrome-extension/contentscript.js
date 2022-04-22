// This code is inject in all the pages to intercept the messages for the browser wallet
// the code injectiob is managed by the Manifest.json of the extension: "content_scripts"
window.addEventListener("message", function(event) {
    // Only accept messages from this window to itself [i.e. not from any iframes] (security concerns)
    if (event.source != window){
        console.log("[Alert] Message not coming from the Extension")
        return;
    }
    if (event.data.type && (event.data.type == "BROWSER-WALLET")) {        
        // send the message to the extension
        chrome.runtime.sendMessage(event.data, (response) => {
            // Got an asynchronous response with the data from the background
            // set the session variable "bitgreenwallet" with the answer
            // it should be verified from the web page
            sessionStorage.setItem("bitgreenwallet",response);
        }); 
    } 
}, false);