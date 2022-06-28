// This code is inject in all the pages to intercept the messages for the browser wallet
// the code injectiob is managed by the Manifest.json of the extension: "content_scripts"
window.addEventListener("message", function(event) {
    // Only accept messages from this window to itself [i.e. not from any iframes] (security concerns)
    if (event.source != window){
        console.log("[Alert] Message not coming from the same web page. Possible attack.")
        return;
    }
    if (event.data.type && (event.data.type == "BROWSER-WALLET")) {        
        // add the domain of origin to the message data 
        let j=event.data;
        j.domain=event.origin;
        // send the message to the extension
        chrome.runtime.sendMessage(j, (response) => {
            // Got an asynchronous response with the data from the background
            // set the session variable "BrowserWalletToken" with the answer
            // it used as the only communication way from the extension to the web page
            sessionStorage.setItem("BrowserWalletToken",response);
        }); 
    } 
}, false);