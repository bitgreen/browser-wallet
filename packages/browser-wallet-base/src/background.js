import { backgroundMessageHandler, findTab, polkadotApi, idleTime, reconnectTime } from '@bitgreen/browser-wallet-core'
import {getCurrentBrowser, isFirefox, isIOs, isSafari} from "@bitgreen/browser-wallet-utils";

let waiting_to_stop = false
let openCount = 0;

const current_browser = getCurrentBrowser()
let ports_extension = []
let port_content = null

// init polkadot api
polkadotApi(true).then()

// listen for messages from both content.js and extension.js
current_browser.runtime.onConnect.addListener((port) => {
    console.info(`Connected to ${port.name}`);

    if(port.name === 'PORT_EXTENSION') {
        // reload on every wallet opening
        polkadotApi(true).then()

        openCount += 1;

        if(waiting_to_stop) {
            deleteTimer(port)
            waiting_to_stop = false;
        }

        port.open_count = openCount
        ports_extension.push(port)
    } else if(port.name === 'PORT_CONTENT') {
        port_content = port
    } else if(port.name === 'KEEP_ALIVE') {
        port._timer = setTimeout(forceReconnect, reconnectTime, port);
    }

    port.onMessage.addListener((data) => {
        return backgroundMessageHandler(data, port)
    })

    port.onDisconnect.addListener(async(port) => {
        if(port.name === 'PORT_EXTENSION') {
            openCount -= 1;

            if(openCount <= 0) {
                waiting_to_stop = true;

                port._timer = setTimeout(() => {
                    waiting_to_stop = false
                }, idleTime);
            }

            // remove port from the list
            ports_extension = ports_extension.filter((object, index) => {
                return object.open_count !== port.open_count
            })
        } else if(port.name === 'KEEP_ALIVE') {
            await findTab()
            deleteTimer(port)
        }

        if(port.name === 'PORT_CONTENT' && ports_extension.length > 0) {
            for(const port_extension of ports_extension) {
                // sends a kill signal back to extension
                port_extension.postMessage({
                    command: 'kill_popup',
                    tab_id: port?.sender?.tab?.id
                })
            }
        }

        console.warn(`Disconnected from ${port.name}`);
    });
});

function forceReconnect(port) {
    deleteTimer(port);
    port.disconnect();
}

function deleteTimer(port) {
    if(port._timer) {
        clearTimeout(port._timer);
        delete port._timer;
    }
}