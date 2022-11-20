import { backgroundMessageHandler } from '@bitgreen/browser-wallet-core'
import { isFirefox } from "@bitgreen/browser-wallet-utils";

const IDLE_TIME = 60000 * 2; // 2 minutes

let timer;
let waitingToStop = false;
let openCount = 0;

const current_browser = isFirefox() ? browser : chrome

current_browser.runtime.onConnect.addListener((port) => {
    if(port.name === 'PORT_EXTENSION') {
        openCount += 1;

        if(waitingToStop) {
            clearTimeout(timer);
            waitingToStop = false;
        }
    }

    port.onMessage.addListener((data) => backgroundMessageHandler(data, port))

    port.onDisconnect.addListener(() => {
        if(port.name === 'PORT_EXTENSION') {
            openCount -= 1;

            if(openCount <= 0) {
                waitingToStop = true;
                timer = setTimeout(() => {
                    waitingToStop = false;
                }, IDLE_TIME);
            }
        }

        console.warn(`Disconnected from ${port.name}`);
    });
});