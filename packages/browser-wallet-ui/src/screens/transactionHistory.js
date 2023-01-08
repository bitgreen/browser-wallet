import Screen, { goToScreen } from './index.js'
import { AccountStore, NetworkStore } from "@bitgreen/browser-wallet-core";
import { showNotification } from "../notifications.js";
import { sendMessage } from "../messaging.js";
import { balanceToHuman, getAmountDecimal } from "@bitgreen/browser-wallet-utils";
import anime from "animejs";

export default async function transactionHistoryScreen() {
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

    const transactions = await sendMessage('get_transactions')
    for(const transaction of transactions) {
        const asset_info = getAmountDecimal(balanceToHuman(transaction.value.amount), 4)
        const created_at = new Date(Date.parse(transaction.value.createdAt))
        const sent = transaction.value.sender.toLowerCase() === current_account.address.toLowerCase()

        await screen.append('#bordered_content #transactions', 'transaction/list_item', {
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