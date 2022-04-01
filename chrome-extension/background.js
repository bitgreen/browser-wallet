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
            if(request.recipient!== null && request.amount!==null){
                let top=0;
                let left=0;
                let width=0;
                let height=0;
                // get windows properties
                chrome.windows.getCurrent(function(win)
                {
                    width = win.width;
                    console.log("width: "+width);
                    height = win.height;
                    console.log("height: "+height);
                    top = win.top;
                    console.log("top: "+top);
                    left = win.left;
                    console.log("left: "+left);
                    // adjust position
                    left=left+width-400;
                    top=top+80;
                });
                // create new windows for the tansfer funds
                let url='window.html?command=transfer&recipient='+request.recipient+'&amount='+request.amount;
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
        // manage signin command
        if (request.command === "signin"){
            sendResponse({answer: "OK"});
            let top=0;
            let left=0;
            let width=0;
            let height=0;
            // get windows properties
            chrome.windows.getCurrent(function(win)
            {
                width = win.width;
                console.log("width: "+width);
                height = win.height;
                console.log("height: "+height);
                top = win.top;
                console.log("top: "+top);
                left = win.left;
                console.log("left: "+left);
                // adjust position
                left=left+width-400;
                top=top+80;
            });
            // create new windows for the tansfer funds
            let url='window.html?command=signin';
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
);
