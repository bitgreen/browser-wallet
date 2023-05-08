import { generateMessageId } from "@bitgreen/browser-wallet-utils";

const handlers = {}

const sendMessage = (command, params = {}, subscribe = false) => {
    return new Promise((resolve, reject) => {
        const message_id = generateMessageId()

        handlers[message_id] = { reject, resolve, subscribe };

        window.postMessage({
            id: message_id,
            type: "BITGREEN-BROWSER-WALLET",
            command: command,
            params: {
                id: message_id,
                ...params
            },
            origin: 'MESSAGE_ORIGIN_PAGE'
        });
    })
}

const open = async() => {
    return await sendMessage('open', { domain: origin }, false);
}

// the enable function, called by the dapp to allow access
const enablePage = async() => {
    const title = document.querySelector('title')?.innerText
    return await sendMessage('sign_in', { domain: origin }, true);
}

const signIn = async() => {
    const title = document.querySelector('title')?.innerText
    return await sendMessage('sign_in', { domain: origin, title, kill_popup: true }, true);
}

const send = async(amount = 0, recipient = false, kill_popup = true) => {
    return await sendMessage('send', {
        amount,
        recipient,
        kill_popup
    }, kill_popup);
}

const query = async(pallet, call, call_parameters) => {
    return await sendMessage('query', {
        pallet, call, call_parameters
    });
}

const extrinsic = async(pallet, call, call_parameters, kill_popup = true) => {
    const title = document.querySelector('title')?.innerText
    return await sendMessage('extrinsic', {
        domain: origin,
        title,
        pallet,
        call,
        call_parameters: JSON.stringify(call_parameters),
        kill_popup,
    }, kill_popup);
}

const pageMessageResponseHandler = (data) => {
    const handler = handlers[data.id];

    if(!handler) {
        console.error(`Unknown response: ${JSON.stringify(data)}`);

        return;
    }

    // return only if not subscribed (wait for background to resolve)
    if(!handler?.subscribe || data?.resolve) {
        if(data.error) {
            handler.reject((data.error));
        } else {
            handler.resolve(data.response);
        }
    }
}

export {
    sendMessage,
    open,
    enablePage,
    signIn,
    send,
    query,
    extrinsic,
    pageMessageResponseHandler
}