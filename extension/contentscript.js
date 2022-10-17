(() => {
    const {chrome} = window;// const {browser} = window;
    delete window.chrome;

    let current_browser = chrome
    if(get_browser() === 'firefox') {
        current_browser = browser
    } else {
        current_browser = chrome
    }

    // This code is inject in all the pages to intercept the messages for the browser wallet
    // the code injectiob is managed by the Manifest.json of the extension: "content_scripts"
    window.addEventListener("message", function(event) {
        if(get_browser() === 'firefox') {
            current_browser = browser
        } else {
            current_browser = chrome
        }

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
            current_browser.runtime.sendMessage(j, (response) => {
                // Got an asynchronous response with the data from the background
                // set the session variable "BrowserWalletToken" with the answer
                // it used as the only communication way from the extension to the web page
                if(j.command === 'check') {
                    sessionStorage.setItem("BrowserWalletInstalled", response.status === 'OK');
                } else if(j.command === 'signin') {
                    sessionStorage.setItem("BrowserWalletToken", response);
                }
            });
        }
        return true;
    }, false);

    // listen to messages from extension, and forward them to webpage
    current_browser.runtime.onMessage.addListener(function (response, sendResponse) {
        if(get_browser() === 'firefox') {
            current_browser = browser
        } else {
            current_browser = chrome
        }

        if (response.type && (response.type === "EXTRINSIC")) {
            let event = new CustomEvent('EXTRINSIC', { detail: response });
            window.dispatchEvent(event);
        }
    });

    function get_browser() {
        let userAgent = navigator.userAgent;
        let browserName = '';

        if (userAgent.match(/chrome|chromium|crios/i)) {
            browserName = "chrome";
        } else if (userAgent.match(/firefox|fxios/i)) {
            browserName = "firefox";
        } else if (userAgent.match(/safari/i)) {
            browserName = "safari";
        } else if (userAgent.match(/opr\//i)) {
            browserName = "opera";
        } else if (userAgent.match(/edg/i)) {
            browserName = "edge";
        }

        return browserName;
    }
})();