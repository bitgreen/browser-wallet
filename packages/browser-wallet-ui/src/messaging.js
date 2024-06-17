import {
  customReviver,
  generateMessageId,
  getCurrentBrowser,
  isStandaloneApp
} from "@bitgreen/browser-wallet-utils";

const current_browser = getCurrentBrowser()
const port = current_browser?.runtime?.connect({ name: 'PORT_EXTENSION' });
const handlers = {};
let kill_popup = true

const url_params = new URLSearchParams(window.location.search)

// Set up the listener for messages, any incoming resolves the promise.
port?.onMessage?.addListener((data) => {
  const handler = handlers[data.id];

  const urlParams = new URLSearchParams(window.location.search)

  // Receives this signal from background page, triggered when origin tab was changed/closed.
  if(data.command === 'kill_popup' && url_params.get('kill_popup') === 'true' && urlParams.get('tab_id').toString() === data?.tab_id.toString()) {
    if(port) port.disconnect()

    if(kill_popup) window.close()

    return;
  }

  if(!handler && data.command !== 'kill_popup') {
    console.error(`Unknown response: ${JSON.stringify(data)}`);

    return;
  }

  if(!handler?.subscriber) {
    delete handlers[data.id];
  }

  if(data.error) {
    handler.reject(new Error(data.error));
  } else {
    handler.resolve(data.response);
  }
});

// Listen for messages from background
current_browser?.runtime?.onMessage?.addListener((data) => {
  if(data.command === 'kill_popup' && url_params.get('kill_popup') === 'true') {
    window.close()

    return;
  }
})

// Handle messages from background on standalone app
if(isStandaloneApp()) {
  window.addEventListener('message', async(event) => {
    const data = event.data;

    const handler = handlers[data.id];

    if(data.source !== 'bg') return false

    if(!handler) {
      console.error(`Unknown response: ${JSON.stringify(data)}`);

      return;
    }

    if(!handler.subscriber) {
      delete handlers[data.id];
    }

    if(data.error) {
      handler.reject(new Error(data.error));
    } else {
      let response = data.response
      try {
        response = JSON.parse(data.response, customReviver)
      } catch {

      }

      handler.resolve(response);
    }
  });
}

const sendMessage = (command, params = {}, message_id = null) => {
  return new Promise((resolve, reject) => {
    if(!message_id) {
      message_id = generateMessageId()
    }

    handlers[message_id] = { reject, resolve };

    try {
      const message = {
        id: message_id,
        type: "BITGREEN-BROWSER-WALLET",
        command: command,
        params: params
      }

      if(isStandaloneApp()) {
        window.postMessage({
          source: 'ui',
          ...message
        });
      } else {
        if(port.name) {
          port.postMessage(message);
        }
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