import { extractGlobal, xglobal } from '@polkadot/x-global';
import { isFirefox } from "@bitgreen/browser-wallet-utils";

const chrome = extractGlobal('chrome', xglobal.browser);
const browser = extractGlobal('browser', xglobal.browser);
// const window = extractGlobal('window', xglobal.browser); ??

const current_browser = isFirefox() ? browser : chrome
const port = current_browser.runtime.connect({ name: 'PORT_CONTENT' });

// This code is inject in all the pages to intercept the messages for the browser wallet
// the code injection is managed by the Manifest.json of the extension: "content_scripts"
window.addEventListener("message", function(event) {
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
        message.data.domain = event.origin;

        // send the message to the extension
        port.postMessage(event.data, (response) => {
            // Got an asynchronous response with the data from the background
            // set the session variable "BrowserWalletToken" with the answer
            // it used as the only communication way from the extension to the web page
            // TODO
            if(message.command === 'check') {
                sessionStorage.setItem("BrowserWalletInstalled", response.status === 'OK');
            } else if(message.command === 'signin') {
                sessionStorage.setItem("BrowserWalletToken", response);
            }
        });
    }

    return true;
}, false);

port.onMessage.addListener((data) => {
    // TODO
    // if(data.type && (data.type === "EXTRINSIC")) {
    //     let event = new CustomEvent('EXTRINSIC', { detail: response });
    //     window.dispatchEvent(event);
    // }

    window.postMessage({ ...data, origin: 'MESSAGE_ORIGIN_CONTENT' }, '*');
});

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