import Screen, { goBackScreen, goToScreen, reloadScreen } from './index.js'
import { AccountStore, NetworkStore, SettingsStore } from "@bitgreen/browser-wallet-core";
import { sendMessage } from "../messaging.js";

import DOMPurify from "dompurify";
import { showNotification } from "../notifications.js";
import {getCurrentBrowser, isFirefox, isIOs, isSafari} from "@bitgreen/browser-wallet-utils";

export default async function settingsScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/full_page',
        template_params: {
            title: 'Settings'
        },
        login: false,
        header: false,
        footer: true,
    })
    await screen.init()

    await screen.set('.content', 'settings/index', {
        version: process.env.PKG_VERSION
    })

    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()

    const settings_store = new SettingsStore()

    if(current_account) {
        await screen.set('#wallet_settings', 'settings/partial/wallet_settings')
    } else {
        await screen.set('#wallet_settings', 'settings/partial/wallet_create')
    }

    const networks_store = new NetworkStore()
    const all_networks = await networks_store.asyncAll()
    const current_network = await networks_store.current()

    await screen.append('#root #change_network', 'settings/partial/network_select', {
        network_id: 'mainnet',
        network_name: 'Mainnet',
        selected: current_network.id === 'mainnet' ? 'selected' : ''
    })

    await screen.append('#root #change_network', 'settings/partial/network_select', {
        network_id: 'testnet',
        network_name: 'Testnet',
        selected: current_network.id === 'testnet' ? 'selected' : ''
    })

    for(const n of all_networks) {
        const network_id = n?.key
        const network = n.value

        await screen.append('#root #change_network', 'settings/partial/network_select', {
            network_id,
            network_name: network.name,
            selected: current_network.id === network_id ? 'selected' : ''
        })
    }

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#change_network',
            type: 'change',
            listener: async() => {
                const network_id = DOMPurify.sanitize(document.querySelector("#change_network").value);

                setTimeout(async() => {
                    const current_network = await networks_store.current()

                    if(current_network.id !== network_id) {
                        await sendMessage('change_network', {
                            network_id: current_network.id
                        })
                        await reloadScreen()
                        await showNotification('Cannot connect to this network. Reverted back to mainnet.', 'error')
                    }
                }, 800)

                await sendMessage('change_network', {
                    network_id
                })
            }
        },
        {
            element: '#manage_networks',
            listener: () => goToScreen('networkManageScreen')
        },
        {
            element: '#manage_accounts',
            listener: () => goToScreen('accountManageScreen')
        },
        {
            element: '#backup_wallet',
            listener: () => goToScreen('walletBackupScreen')
        },
        {
            element: '#go_import',
            listener: () => goToScreen('walletImportScreen')
        },
        {
            element: '#go_new',
            listener: () => goToScreen('walletCreateScreen')
        },
        {
            element: '#go_support',
            listener: () => {
                const current_browser = getCurrentBrowser()
                current_browser.tabs.create({ url: 'https://bitgreen.org/contact' })
            }
        }
    ])
}