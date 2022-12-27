import Screen, { clearHistory, goToScreen, updateCurrentParams } from './index.js'
import { disableKillPopup, sendMessage } from "../messaging.js";
import { AccountStore, WalletStore } from "@bitgreen/browser-wallet-core";
import { addressValid, balanceToHuman } from "@bitgreen/browser-wallet-utils";
import { showNotification } from "../notifications.js";

import DOMPurify from "dompurify";

export default async function assetSendScreen(params) {
    const wallet_store = new WalletStore()
    if(!await wallet_store.exists()) {
        await clearHistory()
        return await goToScreen('walletScreen', {}, false, true)
    }

    const screen = new Screen({
        template_name: 'layouts/default',
        login: false,
        header: true,
        footer: true,
        tab_id: params?.tab_id,
        message_id: params?.message_id
    })
    await screen.init()

    // do not kill popup if tab is closed
    // note: params always return string!
    if(params?.kill_popup === 'false') await disableKillPopup()

    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()

    await screen.set('#heading', 'shared/heading', {
        title: 'Send'
    })

    const balance = balanceToHuman(await sendMessage('get_balance'), 18)

    const balance_info = balance.toString().split('.')
    let balance_decimals = 4
    if(balance_info[1]) {
        for(let i = balance_info[1].length-1; i >= 0; i--) {
            if(balance_info[1][i] !== '0') {
                balance_decimals = i + 1
                break
            }
        }
    }
    if(balance_decimals < 4) balance_decimals = 4
    if(balance_decimals > 10) balance_decimals = 10

    let recipient = params?.recipient ? params.recipient : null
    let amount = params?.amount ? params.amount : (0).toFixed(4)
    await screen.set('#bordered_content', 'asset/send', {
        amount,
        recipient,
        from_name: current_account.name,
        from_address: current_account.address,
        balance: parseFloat(balance).toFixed(balance_decimals)
    })

    const amount_el = document.querySelector("#root #amount")
    const range_el = document.querySelector("#root #range")
    const recipient_el = document.querySelector("#root #recipient")

    screen.setListeners([
        {
            element: '#root #range',
            type: 'input',
            listener: () => syncAmount('range')
        },
        {
            element: '#root #amount',
            type: 'input',
            listener: () => syncAmount('amount')
        },
        {
            element: '#root #recipient',
            type: 'input',
            listener: () => checkAddress()
        },
        {
            element: '#root #paste',
            listener: () => pasteRecipient()
        },
        {
            element: '#go_review_transaction',
            listener: async() => {
                updateCurrentParams({
                    amount: amount_el.value,
                    recipient: recipient_el.value
                })
                await goToScreen('assetTransactionReviewScreen', {
                    amount: amount_el.value,
                    recipient: recipient_el.value,
                    account_id: current_account.id,

                    // forward this in order to send response
                    tab_id: params?.tab_id,
                    message_id: params?.message_id
                })
            }
        }
    ])

    const checkAddress = () => {
        const address = recipient_el.value
        const button_el = document.querySelector("#go_review_transaction")

        if(parseFloat(amount_el.value) > 0
            && addressValid(address)
            && parseFloat(amount_el.value) <= parseFloat(balance) + 0.0000000001
        ) {
            button_el.classList.remove('disabled')
            button_el.classList.add('btn-primary')
        } else {
            button_el.classList.remove('btn-primary')
            button_el.classList.add('disabled')
        }
    }

    let decimals = 4
    const syncAmount = (type = 'both') => {
        let amount
        let update_amount_el = false

        if(type === 'range') amount = range_el.value
        if(type === 'amount' || type === 'both') amount = amount_el.value

        if(type === 'amount' || type === 'both') {
            let amount_info = amount.toString().split('.')

            if(amount_info[1]) {
                decimals = amount_info[1].length
            } else {
                decimals = 0
            }

            if(type === 'both') {
                // min 4 decimals
                if(decimals < 4) {
                    decimals = 4
                    update_amount_el = true
                }
            }

            // max 18 decimals
            if(decimals > 18) {
                decimals = 18
                update_amount_el = true
            }

            range_el.step = Math.pow(10, -decimals).toFixed(decimals)
        } else {
            // min 4 decimals
            if(decimals < 4) {
                decimals = 4
                update_amount_el = true
            }
        }

        amount = parseFloat(amount).toFixed(decimals)

        if(type === 'range' || type === 'both' || update_amount_el) amount_el.value = amount
        if(type === 'amount' || type === 'both') range_el.value = amount

        const value = (range_el.value-range_el.min)/(parseFloat(range_el.max.replace(',', ''))-range_el.min)*100
        range_el.style.background = 'linear-gradient(to right, #C0FF00 0%, #C0FF00 ' + value + '%, #F8F8F9 ' + value + '%, #F8F8F9 100%)'

        checkAddress()
    }
    syncAmount()

    const pasteRecipient = async() => {
        const address = await navigator.clipboard.readText()

        if(addressValid(address)) {
            recipient_el.value = DOMPurify.sanitize(address)

            await showNotification('Recipient\'s address pasted successfully.', 'success')
        } else {
            await showNotification('Please enter a valid recipient address.', 'error')
        }

        checkAddress()
    }
}