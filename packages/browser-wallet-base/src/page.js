import { enablePage, signIn, send, query, extrinsic, pageMessageResponseHandler } from "@bitgreen/browser-wallet-core";

const version = process.env.PKG_VERSION

async function injectExtension(enable, { name, version }) {
    // don't clobber the existing object, we will add it (or create as needed)
    window.injectedWeb3 = window.injectedWeb3 || {};

    // add our enable function
    window.injectedWeb3[name] = {
        // enable: () => enable(), // Temp disable
        signIn: () => signIn(),
        send: (amount = 0, recipient = false, kill_popup = true) => send(amount, recipient, kill_popup),
        extrinsic: (pallet, call, call_parameters, kill_popup = true) => extrinsic(pallet, call, call_parameters, kill_popup),
        query: (pallet, call, call_parameters) => query(pallet, call, call_parameters),
        version
    }
}

function inject() {
    injectExtension(enablePage, {
        name: 'bitgreen-wallet-js',
        version: version
    }).then(r => {

    });
}

window.addEventListener("message", (event) => {
    if(event.source !== window || event.data.origin !== 'MESSAGE_ORIGIN_CONTENT') {
        return;
    }

    if(event.data.id) {
        pageMessageResponseHandler(event.data);
    } else {
        console.error('Missing id for response.');
    }
});

inject()