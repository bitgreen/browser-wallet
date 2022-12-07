import { updateElement } from './screens.js'
import { goToScreen, goBackScreen } from './screens/index.js'

/* import all css files */
import './styles/main.css'
import './styles/icomoon.css'
import 'bootstrap/dist/css/bootstrap.css'

/* import stores */
import { AccountStore, SettingsStore } from "@bitgreen/browser-wallet-core";

class userInterface {
    constructor() {
        this.stores = {
            accounts: new AccountStore(),
            settings: new SettingsStore()
        }
    }

    initUi = async() => {
        await updateElement('body', 'init', {}, false)
        await this.initHeader()
    }

    initHeader = async() => {
        await updateElement('#header', 'shared/header', {}, false)

        document.querySelector("#header #go_settings").addEventListener("click", async() => {
            await goToScreen('settingsScreen')
        })
    }

    goToScreen = async(name, params) => {
        return goToScreen(name, params)
    }
}

export default userInterface