chrome.runtime.onInstalled.addListener(() => {
  console.log("background");
});

// it uses a chrome messaging listener
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "[info] msg from a content script:" + sender.tab.url :
                "[info] msg from the extension");
    // manage transfer command
    if (request.command === "transfer"){
        console.log("Sending: OK");
        sendResponse({answer: "OK"});
        if(request.recipient!== null && request.amount!==null)
        // transfer funds
        //send(request.recipient,request.amount);
        chrome.tabs.create({
        active: true,
        url:  'options.html'
        }, null);
    }
    }
);
