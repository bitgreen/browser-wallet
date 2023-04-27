import Screen, {clearHistory, goToScreen} from './index.js'
import {AccountStore, NetworkStore, WalletStore} from "@bitgreen/browser-wallet-core";
import { showNotification } from "../notifications.js";
import { sendMessage } from "../messaging.js";
import { balanceToHuman, getAmountDecimal } from "@bitgreen/browser-wallet-utils";
import anime from "animejs";

export default async function transactionHistoryScreen() {
    const wallet_store = new WalletStore()
    if(!await wallet_store.exists()) {
        await showNotification('You need a wallet to perform this action. Please create or import one.', 'alert', 3200)
        await clearHistory()
        return await goToScreen('walletScreen', {}, false, true)
    }

    const screen = new Screen({
        template_name: 'layouts/default',
        header: true,
        footer: true
    })
    await screen.init()

    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()

    await screen.set('#heading', 'shared/heading', {
        title: 'Transaction History'
    })

    await screen.set('#bordered_content', 'transaction/history')

    await screen.append('#bordered_content', 'global/loading_bbb', {
        title: 'Loading',
        top: '16px',
        padding_top: '40px',
    });

    showLoading()

    const all_transactions = []

    const [transactions, token_transactions, asset_transactions] = await Promise.all([
      sendMessage('get_transactions'),
      sendMessage('get_token_transactions'),
      sendMessage('get_asset_transactions')
    ])

    for(const t of transactions) {
        all_transactions.push({
            type: 'bbb',
            ...t
        })
    }

    for(const t of token_transactions) {
        all_transactions.push({
            type: 'token',
            ...t
        })
    }

    for(const t of asset_transactions) {
        all_transactions.push({
            type: 'asset',
            ...t
        })
    }

    // Default sort by date
    all_transactions.sort((a, b) => {
        return new Date(Date.parse(b.value.createdAt)) - new Date(Date.parse(a.value.createdAt));
    })

    for(const transaction of all_transactions) {
        if(!transaction.value) continue

        let asset_name = 'BBB' // Default
        let human_balance = balanceToHuman(transaction.value.amount)
        if(transaction.type === 'token') asset_name = transaction.value.tokenId

        if(transaction.type === 'asset') {
            asset_name = 'CO2'
            human_balance = transaction.value.amount
        }

        const asset_info = getAmountDecimal(human_balance, 2)
        const created_at = new Date(Date.parse(transaction.value.createdAt))
        const sent = transaction.value.sender.toLowerCase() === current_account.address.toLowerCase()

        await screen.append('#bordered_content #transactions', 'transaction/list_item', {
            asset_name: asset_name,
            hash: transaction.value.hash,
            created_at: created_at.getDate(),
            created_at_month: created_at.toLocaleString('default', { month: 'short' }),
            asset_amount: (sent ? '-' : '+') + asset_info.amount,
            asset_decimals: asset_info.decimals,
            sent: sent ? '' : 'd-none hidden',
            received: !sent ? '' : 'd-none hidden',
        })
    }
    // hide loading
    const loading_el = document.querySelector("#loading_content")
    setTimeout(() => {
        loading_el.classList.remove('active')
        screen.unFreezeRoot()
    }, 600)

    anime({
        targets: '#transactions .button-item',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 250,
        delay: function(el, i) { return (i * 150) > 1200 ? 1200 : (i * 150) },
    });

    screen.setListeners([
        {
            element: '#root #transactions .button-item',
            listener: async(e) => {
                if(!e.target.dataset?.hash) return false

                return await goToScreen('transactionDetailsScreen', {
                    hash: e.target.dataset?.hash
                })
            }
        }
    ])

    function showLoading() {
        const loading_el = document.querySelector("#loading_content")

        loading_el.classList.add('active')

        screen.freezeRoot()
    }
}