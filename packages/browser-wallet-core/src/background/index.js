import Extension from './extension.js'
import Tabs from './tabs.js'
import { isSafari } from "@bitgreen/browser-wallet-utils";

const extension = new Extension()
const tabs = new Tabs()

const backgroundMessageHandler = (data, port, extensionPortName = 'PORT_EXTENSION') => {
    console.log('backgroundMessageHandler')
    console.log(data)
    const isExtension = port.name === extensionPortName
    const sender = port.sender
    const from = isExtension ? 'extension' : (sender.tab && sender.tab.url) || sender.url || 'unknown';

    const promise = isExtension ? extension.handle(data, from, port) : tabs.handle(data, from, port);

    promise.then((response) => {
        port.postMessage({ id: data.id, response });
    }).catch((error) => {
        console.error(error);

        // only send message back to port if it's still connected
        if(port) {
            port.postMessage({ error: error.message, errorCode: error.code, errorData: error.data, id: data.id });
        }
    });
}

const showPopup = (url, popup_height = 600) => {
    if(isSafari()) {
        chrome.windows.create({
            url: url,
            type: 'popup',
            focused: true,
            width: 400,
            height: popup_height
        });
    } else {
        chrome.windows.getCurrent(function (win) {
            let width = win.width;
            let height = win.height;
            let top = win.top;
            let left = win.left;

            chrome.tabs.create({
                url: chrome.runtime.getURL(url),
                active: false
            }, function (tab) {
                // get windows properties

                // adjust position
                top = top + 80;
                left = left + width - 400 - 100;

                // After the tab has been created, open a window to inject the tab
                chrome.windows.create({
                    tabId: tab.id,
                    type: 'popup',
                    focused: true,
                    width: 400,
                    height: popup_height,
                    left,
                    top
                    // incognito, top, left, ...
                });
            });
        });
    }
}

export {
    backgroundMessageHandler,
    showPopup
}