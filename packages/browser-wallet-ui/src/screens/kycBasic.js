import Screen, { copyText, goBackScreen, goToScreen, updateAccounts } from './index.js'
import { AccountStore } from "@bitgreen/browser-wallet-core";
import { showNotification } from "../notifications.js";

import DOMPurify from 'dompurify';
import anime from "animejs";
import { formatAddress } from "@bitgreen/browser-wallet-utils";

export default async function kycBasicScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/default_custom_header',
        template_params: {
            equal_padding: 'equal-padding'
        },
        header: false,
        footer: false
    })
    await screen.init()

    const account_id = params?.account_id

    const accounts_store = new AccountStore()
    const account = await accounts_store.asyncGet(account_id)

    console.log('hererere')

    await screen.set('#heading', 'kyc/heading', {
        account_name: account?.name,
        current_account_address: formatAddress(account?.address, 16, 8)
    })

    await screen.set('#bordered_content', 'kyc/basic', {
        account_id,
        account_address: account?.address,
        derivation_path: account_id !== 'main' ? account_id : ''
    })

    await screen.set('#bordered_content .footer .fractal-logo', 'kyc/fractal')

    anime({
        targets: '#bordered_content',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeInOutSine',
        duration: 400
    });

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#heading #copy_address',
            listener: async() => {
                await copyText(account.address)
                await showNotification('Account address copied to clipboard.', 'info', 2000, 58)
            }
        }
    ])
}