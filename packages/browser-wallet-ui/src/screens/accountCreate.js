import Screen, { goBackScreen, goToScreen, updateAccounts } from './index.js'
import { sendMessage } from "../messaging.js";
import { showNotification } from "../notifications.js";

import DOMPurify from 'dompurify';

export default async function accountCreateScreen() {
    const screen = new Screen({
        template_name: 'layouts/full_page',
        template_params: {
            title: 'Create Account'
        },
        header: false,
        footer: false
    })
    await screen.init()

    await screen.set('.content', 'accounts/create')

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#store_account',
            listener: () => storeAccount()
        }
    ])

    const storeAccount = async() => {
        const password = DOMPurify.sanitize(document.querySelector("#root #password").value);
        const name = DOMPurify.sanitize(document.querySelector("#root #wallet_name").value);

        const account_id = await sendMessage('new_account', {
            password, name
        })

        if(account_id) {
            await updateAccounts(account_id)
            await goToScreen('accountManageScreen', {}, true)
            await showNotification('New account created!', 'success')
        } else {
            await showNotification('Password is wrong!', 'error')
        }
    }
}