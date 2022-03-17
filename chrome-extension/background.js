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
            // transfer funds
            //send(request.recipient,request.amount);
                /*chrome.tabs.create({
                active: true,
                url:  'window.html'
                }, null);*/
            }
            let top=0;
            let left=0;
            chrome.windows.getCurrent(function(win)
            {
                chrome.tabs.getAllInWindow(win.id, function(tabs)
                {
                    // Should output an array of tab objects to your dev console.
                    console.debug(tabs);
                });
            });
            //let window=await chrome.windows.getCurrent();
            /*chrome.system.display.getInfo(function(videoinfo){
                console.log("videoinfo");
                console.log(videoinfo);
            });*/
            /*const { screenX, screenY, outerWidth } = window;
            top = Math.max(screenY, 0);
            left = Math.max(screenX + (outerWidth - NOTIFICATION_WIDTH), 0);*/
            chrome.tabs.create({
                url: chrome.extension.getURL('window.html'),
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
            //chrome.runtime.sendMessage({type: "BROWSER-WALLET", command: "transfer-background",recipient: "5HVfcSujPyT2hisdLDQhHXzCDx2e37UBM3h9fW65qkHx4FbN",amount: 1000000000000000000 }, function (response) {
            //});


        }
    }
);
