import { databaseService } from '@bitgreen/browser-wallet-core'
import userInterface from '@bitgreen/browser-wallet-ui'

const db = new databaseService()
const ui = new userInterface()

const extension = async() => {
    await ui.initUi()

    if(await db.stores.wallets.exists()) {
        const params = new URLSearchParams(window.location.search)

        if(params.has('command')) {
            const command = params.get('command');

            if(command === 'sign_in' && params.get('origin')) {
                return await ui.goToScreen('signInScreen', {
                    message_id: params.get('id'),
                    tab_id: params.get('tab_id'),
                    domain: params.get('origin'),
                    title: params.get('title')
                })
            }

            if(command === 'send') {
                return await ui.goToScreen('assetSendScreen', {
                    message_id: params.get('id'),
                    tab_id: params.get('tab_id'),
                    kill_popup: params.get('kill_popup'),
                    amount: params.get('amount'),
                    recipient: params.get('recipient')
                })
            }

            if(command === 'extrinsic') {
                return await ui.goToScreen('extrinsicSendScreen', {
                    message_id: params.get('id'),
                    tab_id: params.get('tab_id'),
                    kill_popup: params.get('kill_popup'),
                    domain: params.get('domain'),
                    title: params.get('title'),
                    pallet: params.get('pallet'),
                    call: params.get('call'),
                    call_parameters: params.get('call_parameters')
                })
            }

            return await ui.goToScreen('dashboardScreen', {
                extend_delay: true
            })
        } else {
            return await ui.goToScreen('dashboardScreen', {
                extend_delay: true
            })
        }
    } else {
        if(await db.stores.settings.asyncGet('skip_intro')) {
            await ui.goToScreen('walletScreen')
        } else {
            await ui.goToScreen('welcomeScreen')
        }
    }
}

extension().then()
// document.addEventListener('DOMContentLoaded', async function () {
//     await extension()
// })