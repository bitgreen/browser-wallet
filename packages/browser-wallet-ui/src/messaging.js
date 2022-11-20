import { generateMessageId } from "@bitgreen/browser-wallet-utils";

const port = chrome.runtime.connect({ name: 'PORT_EXTENSION' });
const handlers = {};

// setup a listener for messages, any incoming resolves the promise
port.onMessage.addListener((data) => {
    const handler = handlers[data.id];

    if (!handler) {
        console.error(`Unknown response: ${JSON.stringify(data)}`);

        return;
    }

    if (!handler.subscriber) {
        delete handlers[data.id];
    }

    if (data.error) {
        handler.reject(new Error(data.error));
    } else {
        handler.resolve(data.response);
    }
});

const sendMessage = (command, data = {}) => {
    return new Promise((resolve, reject) => {
        const id = generateMessageId()

        handlers[id] = { reject, resolve };

        port.postMessage({
            id: id,
            type: "BITGREEN-BROWSER-WALLET",
            command: command,
        });
    })
}

export {
    sendMessage
}