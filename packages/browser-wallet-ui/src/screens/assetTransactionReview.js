import Screen, { goBackScreen, goToScreen } from './index.js'
import { sendMessage } from "../messaging.js";
import DOMPurify from "dompurify";
import { AccountStore } from "@bitgreen/browser-wallet-core";
import { getAmountDecimal } from "@bitgreen/browser-wallet-utils";
import { showNotification } from "../notifications.js";

export default async function assetTransactionReviewScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/full_page',
        template_params: {
            title: 'Review Transaction'
        },
        login: false,
        header: false,
        footer: false,
        tab_id: params?.tab_id,
        message_id: params?.message_id
    })
    await screen.init()

    const accounts_store = new AccountStore()
    const account = await accounts_store.asyncGet(params?.account_id)

    const recipient = params?.recipient
    const asset_amount = params?.amount
    const asset_info = getAmountDecimal(asset_amount, 6)
    const usd_info = getAmountDecimal(asset_amount * 0.35, 2) // TODO: update price!
    const fee_info = getAmountDecimal(0.27, 2) // TODO: calculate fees!

    await screen.set('.content', 'asset/review_transaction', {
        asset_amount: asset_info.amount,
        asset_decimals: asset_info.decimals,
        usd_amount: usd_info.amount,
        usd_decimals: usd_info.decimals,
        fee_amount: fee_info.amount,
        fee_decimals: fee_info.decimals,
        account_name: (account.name.length > 14 ? account.name.substring(0,14)+'...' : account.name),
        account_address: account.address,
        recipient_address: recipient
    })

    await screen.append('.content', 'global/loading', {
        title: 'processing transaction',
        desc: 'Hold tight while we get confirmation of this transaction.',
        top: '60px;',
        padding_top: '100px'
    });

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#approve_transaction',
            listener: () => makeTransaction()
        },
        {
            element: '#root #password',
            type: 'keypress',
            listener: async(e) => {
                if(e.key === "Enter") {
                    await makeTransaction()
                }
            }
        },
    ])

    const makeTransaction = async() => {
        const password_el = document.querySelector("#root #password")

        showProcessing()

        const response = await sendMessage('transfer', {
            password: DOMPurify.sanitize(password_el?.value),
            account_id: params?.account_id,
            amount: params?.amount,
            recipient: params?.recipient,
            tab_id: params?.tab_id
        }, params?.message_id)

        if(response?.status === 'success') {
            // send message to tab if response is successful
            screen.sendMessageToTab({
                success: true,
                ...response
            })

            await goToScreen('assetTransactionFinishScreen', {
                account_name: account.name,
                account_address: account.address,
                recipient: params?.recipient,
                from_tab: !!params?.tab_id
            })
        } else if(response?.status === 'failed' && response.error) {
            hideProcessing()
            await showNotification(response.error, 'error', 3200)
        } else {
            hideProcessing()
            await showNotification('Password is wrong!', 'error')
        }
    }

    const showProcessing = () => {
        const loading_el = document.querySelector("#loading_content")

        loading_el.classList.add('active')

        screen.freezeRoot()
    }

    const hideProcessing = () => {
        setTimeout(() => {
            const loading_el = document.querySelector("#loading_content")

            loading_el.classList.remove('active')
            screen.unFreezeRoot()
        }, 1200)
    }
}