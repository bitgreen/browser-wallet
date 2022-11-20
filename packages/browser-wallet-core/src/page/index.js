import { generateMessageId } from "@bitgreen/browser-wallet-utils";
import Injected from "./injected.js";

const handlers = {}

const sendMessage = (command, data = {}) => {
    return new Promise((resolve, reject) => {
        const id = generateMessageId()

        handlers[id] = { reject, resolve };

        window.postMessage({
            id: id,
            type: "BITGREEN-BROWSER-WALLET",
            command: command,
            data: data,
            origin: 'MESSAGE_ORIGIN_PAGE'
        });
    })
}

// the enable function, called by the dapp to allow access
const enablePage = async(origin) => {
    await sendMessage('sign_in', { origin });

    return new Injected(sendMessage);
}

const pageMessageResponseHandler = (data) => {
    const handler = handlers[data.id];

    if (!handler) {
        console.error(`Unknown response: ${JSON.stringify(data)}`);

        return;
    }

    if (data.error) {
        handler.reject((data.error, data.errorCode, data.errorData));
    } else {
        handler.resolve(data.response);
    }
}

export {
    sendMessage,
    enablePage,
    pageMessageResponseHandler
}