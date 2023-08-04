import { databaseService, appMessageHandler } from '@bitgreen/browser-wallet-core'
import userInterface from '@bitgreen/browser-wallet-ui'

import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

const db = new databaseService()
const ui = new userInterface()

async function extension() {
    await ui.initUi()

    // Break if there is no wallet created/imported, and return to welcome screen.
    if(!await db.stores.wallets.exists()) {
        if(await db.stores.settings.asyncGet('skip_intro')) {
            return await ui.goToScreen('walletScreen')
        } else {
            return await ui.goToScreen('welcomeScreen')
        }
    }

    return await ui.goToScreen('dashboardScreen', {
        extend_delay: true
    })
}

document.addEventListener('deviceready', async() => {
    await extension()

    App.addListener('appStateChange', async({ isActive }) => {
        if(isActive) {
            ui.hideInit(true)
        } else {
            ui.showInit(true)

            await Keyboard.hide()

            // reset body
            document.body.style.height = '';
            document.body.classList.remove('keyboard-opened')
        }
    });

    Keyboard.addListener('keyboardWillShow', info => {
        const bodyHeight = window.innerHeight - info.keyboardHeight

        // update body height and add class
        document.body.style.height = bodyHeight + 'px';
        document.body.classList.add('keyboard-opened')

        ui.disableFooter()
    });

    Keyboard.addListener('keyboardWillHide', info => {
        // reset body
        document.body.style.height = '';
        document.body.classList.remove('keyboard-opened')

        ui.enableFooter()
    });
}, false)

// request message
window.addEventListener('message', async(event) => {
    const data = event.data;

    if(data.source !== 'ui') return false

    return appMessageHandler(data)
});