import Screen, { goBackScreen, goToScreen, updateAccounts } from './index.js'
import { AccountStore } from "@bitgreen/browser-wallet-core";
import { showNotification } from "../notifications.js";

import DOMPurify from 'dompurify';

export default async function accountEditScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/full_page',
        template_params: {
            title: 'Manage Account',
            equal_padding: 'equal-padding'
        },
        header: false,
        footer: false
    })
    await screen.init()

    const account_id = params?.account_id

    const accounts_store = new AccountStore()
    const account = await accounts_store.asyncGet(account_id)

    if(account_id !== 'main') await screen.append('.heading', 'accounts/edit/delete_button')

    await screen.set('.content', 'accounts/edit/content', {
        account_id,
        account_name: account?.name,
        account_address: account?.address
    })

    await screen.append('#root', 'accounts/edit/delete_modal', {
        account_id,
        account_name: account?.name,
        account_address: account?.address
    })

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#root #wallet_name',
            type: 'input',
            listener: () => {
                const wallet_name = document.querySelector("#root #wallet_name").value
                const save_wallet_button = document.querySelector("#root #save_wallet")

                if(wallet_name.length > 3) {
                    save_wallet_button.classList.add('btn-primary')
                    save_wallet_button.classList.remove('disabled')
                } else {
                    save_wallet_button.classList.remove('btn-primary')
                    save_wallet_button.classList.add('disabled')
                }
            }
        },
        {
            element: '#root #save_wallet',
            listener: async(e) => {
                const id = e.target.dataset.id;
                const name = DOMPurify.sanitize(document.querySelector("#root #wallet_name").value)

                await accounts_store.asyncSet(id, {
                    ...account,
                    name
                })

                await updateAccounts(id)

                await goToScreen('accountEditScreen', {
                    account_id
                }, false, true)
                await showNotification('Account data saved successfully.', 'success')
            }
        },
        {
            element: '#root #delete_wallet',
            listener: async() => {
                document.querySelector("#delete_modal").classList.add('fade')
                document.querySelector("#delete_modal").classList.add('show')
            }
        },
        {
            element: '#root #hide_modal',
            listener: () => {
                document.querySelector("#delete_modal").classList.remove('fade')
                document.querySelector("#delete_modal").classList.remove('show')
            }
        },
        {
            element: '#root #confirm_delete_wallet',
            listener: async(e) => {
                const id = e.target.dataset.id;

                accounts_store.remove(id, async() => {
                    await updateAccounts()
                    await goToScreen('accountManageScreen', {}, true)
                    await showNotification('Account deleted successfully.', 'info')
                })
            }
        }
    ])
}