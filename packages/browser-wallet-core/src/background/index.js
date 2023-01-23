import Extension from './extension.js'
import Tabs from './tabs.js'
import { isFirefox, isSafari } from "@bitgreen/browser-wallet-utils";

const current_browser = isFirefox() ? browser : chrome

const extension = new Extension()
const tabs = new Tabs()

const backgroundMessageHandler = (data, port) => {
    const isExtension = port.name === 'PORT_EXTENSION'
    const isContent = port.name === 'PORT_CONTENT'
    const sender = port.sender
    const from = isExtension ? 'extension' : (sender.tab && sender.tab.url) || sender.url || 'unknown';

    let promise = isExtension ? extension.handle(data, from, port) : (isContent ? tabs.handle(data, from, port) : null);

    if(!promise) {
        return false
    }

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

const showPopup = async(command, params = {}) => {
    let url = 'index.html?' + new URLSearchParams({
        tab_id: await getCurrentTabId(),
        command,
        ...params
    }).toString();

    if(isSafari()) {
        chrome.windows.create({
            url: url,
            type: 'popup',
            focused: true,
            width: 400,
            height: 600
        });
    } else {
        current_browser.windows.getCurrent((win) => {
            let width = win.width;
            let height = win.height;
            let top = win.top;
            let left = win.left;

            current_browser.tabs.create({
                url: current_browser.runtime.getURL(url),
                active: false
            }, function(tab) {
                // get windows properties

                // adjust position
                top = top + 80;
                left = left + width - 400 - 100;

                // After the tab has been created, open a window to inject the tab
                current_browser.windows.create({
                    tabId: tab.id,
                    type: 'popup',
                    focused: true,
                    width: 400,
                    height: 600,
                    left,
                    top
                });
            });
        });
    }
}

const getCurrentTabId = () => {
    return new Promise((resolve, reject) => {
        current_browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            resolve(tabs[0].id)
        })
    })
}

const findTab = async(tabs) => {
    for(const { id: tabId } of tabs || await current_browser.tabs.query({ url: '*://*/*' })) {
        try {
            await current_browser.scripting.executeScript({ target: { tabId }, func: keepAlive });
            current_browser.tabs.onUpdated.removeListener(onTabUpdate);
            return;
        } catch(e) {
        }
    }
    current_browser.tabs.onUpdated.addListener(onTabUpdate);
}

const onTabUpdate = (tabId, info, tab) => /^https?:/.test(info.url) && findTab([tab]);

const keepAlive = () => {
    current_browser.runtime.connect({ name: 'KEEP_ALIVE' }).onDisconnect.addListener(keepAlive);
}

const sendMessageToTab = (tab_id, message_id, response) => {
    const tab = current_browser.tabs.connect(parseInt(tab_id), { name: 'PORT_BACKGROUND' });

    tab.postMessage({
        id: message_id,
        response
    });
}

export {
    backgroundMessageHandler,
    showPopup,
    getCurrentTabId,
    findTab,
    sendMessageToTab
}