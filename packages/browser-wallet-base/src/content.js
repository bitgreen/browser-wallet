import { extractGlobal, xglobal } from '@polkadot/x-global';
import { isFirefox } from "@bitgreen/browser-wallet-utils";

const chrome = extractGlobal('chrome', xglobal.browser);
const browser = extractGlobal('browser', xglobal.browser);

const current_browser = isFirefox() ? browser : chrome
const port_content = current_browser.runtime.connect({ name: 'PORT_CONTENT' });

// This code is inject in all the pages to intercept the messages for the browser wallet
// the code injection is managed by the manifest.json of the extension: "content_scripts"
window.addEventListener("message", (event) => {
    // Only accept messages from this window to itself [i.e. not from any iframes] (security concerns)
    if(event.source !== window) {
        console.warn("[Alert] Message not coming from the same web page. Possible attack.")
        return;
    }

    if(event.data.origin !== 'MESSAGE_ORIGIN_PAGE') {
        return
    }

    // forward message to extension
    if(event.data.type && (event.data.type === "BITGREEN-BROWSER-WALLET")) {
        // add the domain of origin to the message data
        let message = event.data;
        message.params.origin = event.origin;

        // send the message to the extension
        port_content.postMessage(message);
    }

    return true;
}, false);

// listen to messages from extension, and forward them to webpage
current_browser.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((data) => {
        if(port.name === 'PORT_CONTENT' || port.name === 'PORT_BACKGROUND') {
            window.postMessage({ ...data, origin: 'MESSAGE_ORIGIN_CONTENT' }, '*');
        } else if(port.name.startsWith('PORT_CONTENT_RESOLVE')) {
            // resolve message requested from tab
            window.postMessage({ ...data, origin: 'MESSAGE_ORIGIN_CONTENT', resolve: true }, '*');
        } else if(port.name === 'KEEP_ALIVE') {
            // console.log('KEEP_ALIVE MESSAGE')
        }
    })

    port.onDisconnect.addListener((port) => {
        if(port.name === 'KEEP_ALIVE') {
            return connectKeepAlive()
        }

        // resolve message if connection to the popup was lost
        if(port.name.startsWith('PORT_CONTENT_RESOLVE')) {
            // extract message id from port name
            const message_id = port.name.split('=')[1]

            window.postMessage({ id: message_id, response: { success: false, status: 'closed', error: 'Communication to the popup has been lost.' }, origin: 'MESSAGE_ORIGIN_CONTENT', resolve: true }, '*');
        }
    });
});

// code to keep background.js persistent (mv3 hack)
let keep_alive_port
function connectKeepAlive() {
    keep_alive_port = current_browser.runtime.connect({ name: 'KEEP_ALIVE' });
    keep_alive_port.onDisconnect.addListener(connectKeepAlive)
}
connectKeepAlive()

// inject our data injector
const container = document.head || document.documentElement;
const placeholderScript = document.createElement('script');
const script = document.createElement('script');

script.src = current_browser.runtime.getURL('page.js');
placeholderScript.src = current_browser.runtime.getURL('inject.js');

container.insertBefore(script, container.children[0]);
container.insertBefore(placeholderScript, container.children[0]);
container.removeChild(script);
container.removeChild(placeholderScript);