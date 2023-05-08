import Screen, { goBackScreen, goToScreen, reloadScreen } from './index.js'
import { AccountStore, NetworkStore, SettingsStore } from "@bitgreen/browser-wallet-core";
import { sendMessage } from "../messaging.js";

import DOMPurify from "dompurify";
import { showNotification } from "../notifications.js";
import {isFirefox, isIOs, isSafari} from "@bitgreen/browser-wallet-utils";

export default async function stakingCollatorsScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/full_page',
        template_params: {
            title: 'Collators'
        },
        login: true,
        header: false,
        footer: true
    })
    await screen.init()

    await screen.set('.content', 'staking/collators')

    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()

    const settings_store = new SettingsStore()

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goToScreen('stakingHomeScreen')
        }
    ])
}