BWMessage="";
timeout=0;
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
            if(request.recipient!== null && request.amount!==null){
                let top=0;
                let left=0;
                let width=0;
                let height=0;
                // get windows properties
                chrome.windows.getCurrent(function(win)
                {
                    width = win.width;
                    height = win.height;
                    top = win.top;
                    left = win.left;
                    // adjust position
                    left=left+width-400;
                    top=top+80;
                });
                // create new windows for the transfer funds
                let url='window.html?command=transfer&recipient='+request.recipient+'&amount='+request.amount+'&domain='+encodeURI(request.domain);
                chrome.tabs.create({
                    url: chrome.extension.getURL(url),
                    active: false
                }, function(tab) {
                    // After the tab has been created, open a window to inject the tab
                    chrome.windows.create({
                        tabId: tab.id,
                        type: 'popup',
                        focused: true,
                        width: 400,
                        height: 620,
                        left,
                        top
                        // incognito, top, left, ...
                    });
                });
            }

        }
        // manage sign-in command
        if (request.command === "signin"){
            //sendResponse({answer: "OK"});
            let top=0;
            let left=0;
            let width=0;
            let height=0;
            // get windows properties
            chrome.windows.getCurrent(function(win)
            {
                width = win.width;
                height = win.height;
                top = win.top;
                left = win.left;
                // adjust position
                left=left+width-400;
                top=top+80;
            });
            // create new windows for authentication
            let url='window.html?command=signin&domain='+encodeURI(request.domain);
            chrome.tabs.create({
                url: chrome.extension.getURL(url),
                active: false
            }, function(tab) {
                // After the tab has been created, open a window to inject the tab
                chrome.windows.create({
                    tabId: tab.id,
                    type: 'popup',
                    focused: true,
                    width: 400,
                    height: 620,
                    left,
                    top
                    // incognito, top, left, ...
                });
            });
            
            // Will be called asynchronously from sendAnswerBW()
            sendAnswerBW(function(msg) {
                console.log("sending data back to web page",msg);
                sendResponse(msg);
            });
            // to keep open the channel for the answer we returns true
            return true;
        }

        // manage answer to sign-in command
        if (request.command === "signinanswer"){
            console.log("signinanswer",request.message);
            BWMessage=request.message;
        }
        // callback function to send the answer from the extension to the web page. It's quite complicated but it's the only way.
        function sendAnswerBW(callback) {
            // wait for signature with a timeout of 60 seconds
            function waitforSignature() {
                // exit for timeout of 1 minute
                if(timeout>=60){
                    BWMessage="";
                    timeout=0;
                    return;            
                }
                if(BWMessage==="") {
                    setTimeout(waitforSignature, 1000); //wait 1 second and check again
                    timeout=timeout+1;
                    return;
                }else {
                    // execute the call back sending the message
                    console.log("Sending BWMessage from background.js:",BWMessage);
                    callback(BWMessage);
                    BWMessage="";
                    timeout=0;
                }
            }
            // call the waiting function for the signature
            waitforSignature();
        }
    }
);
