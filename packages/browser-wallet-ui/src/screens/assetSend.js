import Screen, { clearHistory, goToScreen, updateCurrentParams } from './index.js'
import { disableKillPopup, sendMessage } from "../messaging.js";
import {AccountStore, bbbTokenPrice, bbbTxFee, WalletStore} from "@bitgreen/browser-wallet-core";
import {addressValid, balanceToHuman, formatAddress, formatAmount} from "@bitgreen/browser-wallet-utils";
import { showNotification } from "../notifications.js";

import DOMPurify from "dompurify";

export default async function assetSendScreen(params) {
    const wallet_store = new WalletStore()
    if(!await wallet_store.exists()) {
        await showNotification('You need a wallet to perform this action. Please create or import one.', 'alert', 3200)
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

    const original_balance = await sendMessage('get_balance')
    const balance = balanceToHuman(original_balance, 18)

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
    if(balance_decimals < 2) balance_decimals = 2
    if(balance_decimals > 10) balance_decimals = 10

    let recipient = params?.recipient ? params.recipient : null
    let amount = params?.amount ? params.amount : (0).toFixed(2)
    await screen.set('#bordered_content', 'asset/send', {
        amount,
        recipient,
        from_name: current_account.name,
        from_address: formatAddress(current_account.address, 16, 8),
        balance: formatAmount(balanceToHuman(original_balance, 2)),
        bbb_fee: formatAmount(bbbTxFee, 18),
        total_bbb: formatAmount(parseFloat(params.amount) + bbbTxFee, 2),
        max_balance: balanceToHuman(original_balance, 18)
    })

    const amount_el = document.querySelector("#root #amount")
    const usd_amount_el = document.querySelector("#root #usd_amount")
    const send_info_el = document.querySelector("#root #send_info .info")
    const send_error_el = document.querySelector("#root #send_info .error")
    const total_amount_el = document.querySelector("#root #send_info .total-amount")
    const recipient_el = document.querySelector("#root #recipient")

    screen.setListeners([
        {
            element: '#root #from_account',
            listener: () => {
                let accounts_modal_el = document.querySelector("#accounts_modal");

                if(document.querySelector("#header #current_wallet").classList.contains('active')) {
                    accounts_modal_el.classList.remove('fade')
                    accounts_modal_el.classList.remove('show')
                } else {
                    accounts_modal_el.classList.add('fade')
                    accounts_modal_el.classList.add('show')
                }
            }
        },
        {
            element: '#root #amount',
            type: 'input',
            listener: () => syncAmount('amount')
        },
        {
            element: '#root #usd_amount',
            type: 'input',
            listener: () => syncAmount('usd_amount')
        },
        {
            element: '#root #max_amount',
            listener: () => maxAmount()
        },
        {
            element: '#root #recipient',
            type: 'input',
            listener: () => checkAddress()
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
            && (parseFloat(amount_el.value) + bbbTxFee) <= parseFloat(balanceToHuman(original_balance, 18))
        ) {
            button_el.classList.remove('disabled')
            button_el.classList.add('btn-primary')

            amount_el.classList.remove('error')

            send_info_el.classList.add('d-block')
            send_error_el.classList.remove('d-block')
        } else {
            button_el.classList.remove('btn-primary')
            button_el.classList.add('disabled')

            if((parseFloat(amount_el.value) + bbbTxFee) > parseFloat(balanceToHuman(original_balance, 18))) {
                amount_el.classList.add('error')

                send_info_el.classList.remove('d-block')
                send_error_el.classList.add('d-block')
            } else {
                amount_el.classList.remove('error')

                send_info_el.classList.add('d-block')
                send_error_el.classList.remove('d-block')
            }
        }
    }

    let decimals = 2
    const syncAmount = (type = 'both') => {
        let amount, usd_amount, total_amount

        if(type === 'usd_amount') amount = usd_amount_el.value / bbbTokenPrice
        if(type === 'amount' || type === 'both') {
            amount = amount_el.value
            usd_amount = amount_el.value * bbbTokenPrice
        }

        if(type === 'amount' || type === 'both') {
            let amount_info = amount.toString().split('.')

            if(amount_info[1]) {
                decimals = amount_info[1].length
            } else {
                decimals = 0
            }

            if(type === 'both') {
                // min 4 decimals
                if(decimals < 2) {
                    decimals = 2
                }
            }

            // max 18 decimals
            if(decimals > 18) {
                decimals = 18
            }
        } else {
            // min 4 decimals
            if(decimals < 2) {
                decimals = 2
            }
        }

        amount = parseFloat(amount).toFixed(decimals)
        usd_amount = parseFloat(usd_amount).toFixed(2)
        total_amount = (parseFloat(amount) + bbbTxFee).toFixed(decimals)

        if(type === 'amount' || type === 'both') usd_amount_el.value = usd_amount
        if(type === 'usd_amount' || type === 'both') amount_el.value = amount

        total_amount_el.innerHTML = total_amount

        checkAddress()
    }
    syncAmount()

    const maxAmount = () => {
        let max_amount = parseFloat(balanceToHuman(original_balance, 18)) - bbbTxFee

        if(max_amount <= 0) {
            max_amount = 0.00
        }

        if(max_amount > 100000) {
            amount_el.value = (max_amount - 0.0001).toFixed(4)
        } else if(max_amount > 1000) {
            amount_el.value = (max_amount - 0.000001).toFixed(6)
        } else {
            amount_el.value = (max_amount - 0.00000001).toFixed(8)
        }

        syncAmount('amount')
    }
}