import Extension from './extension.js'
import Tabs from './tabs.js'
import {
    customReviver,
    getCurrentBrowser,
    isFirefox,
    isIOs,
    isIPad,
    isMacOs,
    isSafari
} from "@bitgreen/browser-wallet-utils";

const current_browser = getCurrentBrowser()

const extension = new Extension()
const tabs = new Tabs()

let opened_tabs = []

const appMessageHandler = (data) => {
    let promise = extension.handle(data);

    if(!promise) {
        return false
    }

    promise.then((response) => {
        // return response to frontend
        window.postMessage({
            source: 'bg',
            id: data.id,
            response: JSON.stringify(response)
        });
    }).catch((error) => {
        console.error(error);
        window.postMessage({ error: error.message, errorCode: error.code, errorData: error.data, id: data.id });
    });
}

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
        if(port) {
            try {
                port.postMessage({ id: data.id, response })
            } catch (e) {
                console.log('Error sending message.')
            }
        }
    }).catch((error) => {
        console.error(error);

        // only send message back to port if it's still connected
        if(port) {
            try {
                port.postMessage({ error: error.message, errorCode: error.code, errorData: error.data, id: data.id })
            } catch (e) {
                console.log('Error sending message back.')
            }
        }
    });
}

const showPopup = async(command, params = {}) => {
    const origin_tab_id = await getCurrentTabId()

    let url = 'index.html?' + new URLSearchParams({
        tab_id: origin_tab_id,
        command,
        ...params
    }).toString();

    if(isSafari() && isMacOs()) {
        const response = await current_browser.windows.create({
            url: url,
            type: 'popup',
            focused: true,
            width: 400,
            height: 600
        });

        opened_tabs.push({
            message_id: params.id,
            origin_tab_id: origin_tab_id,
            wallet_tab_id: response.tabs[0].id
        })
    } else {
        current_browser.windows.getCurrent((win) => {
            let width = win.width;
            let height = win.height;
            let top = win.top;
            let left = win.left;

            current_browser.tabs.create({
                url: current_browser.runtime.getURL(url),
                active: isIOs() || isIPad()
            }, (tab) => {
                // adjust position
                top = top + 80;
                left = left + width - 400 - 100;

                if(isIOs()) {
                    opened_tabs.push({
                        message_id: params.id,
                        origin_tab_id: origin_tab_id,
                        wallet_tab_id: tab.id
                    })
                }

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

// Handle communication lost on safari
if(isSafari()) {
    current_browser.tabs.onRemoved.addListener(async(tab_id, removeInfo) => {
        opened_tabs.map((data) => {
            // If wallet tab is closed, send message back to webpage
            if(data.wallet_tab_id === tab_id) {
                // Remove from opened tabs
                opened_tabs = opened_tabs.filter((data) => {
                    return data.wallet_tab_id !== tab_id
                })

                sendMessageToTab(data.origin_tab_id, data.message_id,{ success: false, status: 'closed', resolve: true, error: 'Communication to the popup has been lost.' })
            }
        })
    });

    current_browser.tabs.onUpdated.addListener(async(tab_id) => {
        opened_tabs.map((data) => {
            // If origin tab is closed, kill all popups from that tab
            if(data.origin_tab_id === tab_id) {
                // Remove from opened tabs
                opened_tabs = opened_tabs.filter((data) => {
                    return data.origin_tab_id !== tab_id
                })

                current_browser.tabs.sendMessage(data.wallet_tab_id, { command: "kill_popup" });
            }
        })
    })
}

export {
    appMessageHandler,
    backgroundMessageHandler,
    showPopup,
    getCurrentTabId,
    findTab,
    sendMessageToTab
}