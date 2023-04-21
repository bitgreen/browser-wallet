import {generateMessageId, isFirefox, isIOs, isSafari} from "@bitgreen/browser-wallet-utils";

const current_browser = (isFirefox() || isSafari()) ? browser : chrome
const port = current_browser.runtime.connect({ name: 'PORT_EXTENSION' });
const handlers = {};
let kill_popup = true

const urlParams = new URLSearchParams(window.location.search)

// Set up the listener for messages, any incoming resolves the promise.
port.onMessage.addListener((data) => {
    const handler = handlers[data.id];

    // Receives this signal from background page, triggered when origin tab was changed/closed.
    if(data.command === 'kill_popup' && urlParams.get('kill_popup') === 'true' && urlParams.get('tab_id').toString() === data?.tab_id.toString()) {
        if(port) port.disconnect()

        if(kill_popup) window.close()

        return;
    }

    if(!handler && data.command !== 'kill_popup') {
        console.error(`Unknown response: ${JSON.stringify(data)}`);

        return;
    }

    if(!handler.subscriber) {
        delete handlers[data.id];
    }

    if(data.error) {
        handler.reject(new Error(data.error));
    } else {
        handler.resolve(data.response);
    }
});

// port.onDisconnect.addListener((obj) => {
//     console.log('disconnected port');
// })

const sendMessage = (command, params = {}, message_id = null) => {
    return new Promise((resolve, reject) => {
        if(!message_id) {
            message_id = generateMessageId()
        }

        handlers[message_id] = { reject, resolve };

        try {
            if(port.name) {
                port.postMessage({
                    id: message_id,
                    type: "BITGREEN-BROWSER-WALLET",
                    command: command,
                    params: params
                });
            }
        } catch(e) {
            resolve({})
        }
    })
}

const disableKillPopup = async() => {
    kill_popup = false
}

export {
    sendMessage,
    disableKillPopup
}