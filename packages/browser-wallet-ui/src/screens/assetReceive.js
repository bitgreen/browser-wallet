import Screen, { copyText, goToScreen } from './index.js'
import { AccountStore } from "@bitgreen/browser-wallet-core";
import { showNotification } from "../notifications.js";
import QRCode from 'qrcode'

export default async function assetReceiveScreen() {
    const screen = new Screen({
        template_name: 'layouts/default',
        header: true,
        footer: true
    })
    await screen.init()

    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()

    await screen.set('#heading', 'shared/heading', {
        title: 'Receive'
    })

    await screen.set('#bordered_content', 'asset/receive', {
        address: current_account.address
    })

    await QRCode.toCanvas(document.querySelector("#qrcode"), current_account.address, {
        width: 210,
        quality: 1,
        margin: 0,
        colorDark : "#061C00",
        colorLight : "#ffffff",
        errorCorrectionLevel: 'L'
    });

    screen.setListeners([
        {
            element: '#copy_qrcode, #copy_address',
            listener: async() => {
                await copyText(current_account.address)
                await showNotification('Account address copied to clipboard.', 'info')
            }
        }
    ])
}