import Screen, { clearHistory, goToScreen } from './index.js'
import { AccountStore, WalletStore } from "@bitgreen/browser-wallet-core";
import { balanceToHuman, getAmountDecimal } from "@bitgreen/browser-wallet-utils";
import { showNotification } from "../notifications.js";
import { sendMessage } from "../messaging.js";
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

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });

  const all_transactions = []

  const [transactions, token_transactions, asset_transactions] = await Promise.all([
    sendMessage('get_transactions'),
    sendMessage('get_token_transactions'),
    sendMessage('get_asset_transactions')
  ])

  if(transactions?.length) {
    for(const t of transactions) {
      all_transactions.push({
        type: 'bbb',
        ...t
      })
    }
  }

  if(token_transactions?.length) {
    for (const t of token_transactions) {
      all_transactions.push({
        type: 'token',
        ...t
      })
    }
  }

  if(asset_transactions?.length) {
    for (const t of asset_transactions) {
      all_transactions.push({
        type: 'asset',
        ...t
      })
    }
  }

  // Default sort by date with secondary sort by index (if available)
  all_transactions.sort((a, b) => {
    const dateA = new Date(a.value.createdAt);
    const dateB = new Date(b.value.createdAt);

    // Compare dates in descending order
    if (dateB > dateA) return 1;
    if (dateA > dateB) return -1;

    // If dates are equal, compare indices in ascending order (treat undefined as Infinity)
    const indexA = a.value.index || Infinity;
    const indexB = b.value.index || Infinity;

    return indexB - indexA;
  });

  for(const transaction of all_transactions) {
    if(!transaction.value) continue

    let asset_name = 'BBB' // Default
    let asset_type = 'TOKENS' // Default
    let human_balance = balanceToHuman(transaction.value.amount)
    if(transaction.type === 'token') asset_name = transaction.value.tokenId

    if(transaction.type === 'asset') {
      asset_name = 'CO2'
      human_balance = transaction.value.amount
      asset_type = 'CREDITS'
    }

    const asset_info = getAmountDecimal(human_balance, 2)
    const created_at = new Date(Date.parse(transaction.value.createdAt))
    const sent = transaction.value.from.toLowerCase() === current_account.address.toLowerCase()

    let asset_decimals = '.' + asset_info.decimals

    let icon
    let asset_prefix = ''
    if(transaction.type === 'asset') {
      asset_decimals = ''

      if(transaction.value.type === 'PURCHASED') {
        icon = '<span class="d-block w-100 icon icon-cart icon-success"></span><span class="desc d-block w-100 text-gray">PURCHASED</span>'
        asset_prefix = '+'
      } else if(transaction.value.type === 'SOLD') {
        icon = '<span class="d-block w-100 icon icon-cart icon-error"></span><span class="desc d-block w-100 text-gray">SOLD</span>'
        asset_prefix = '-'
      } else if(transaction.value.type === 'SENT' || transaction.value.type === 'ORDER_CREATED') {
        icon = '<span class="d-block w-100 icon icon-right-up-arrow icon-error"></span><span class="desc d-block w-100 text-gray">SENT</span>'
        asset_prefix = '-'
      } else if(transaction.value.type === 'RECEIVED' || transaction.value.type === 'ORDER_CANCELLED') {
        icon = '<span class="d-block w-100 icon icon-left-down-arrow icon-success"></span><span class="desc d-block w-100 text-gray">RECEIVED</span>'
        asset_prefix = '+'
      }else if(transaction.value.type === 'RETIRED') {
        icon = '<span class="d-block w-100 icon icon-retired icon-green"></span><span class="desc d-block w-100 text-gray">RETIRED</span>'
        asset_prefix = '-'
      } else if(transaction.value.type === 'ISSUED') {
        icon = '<span class="d-block w-100 icon icon-carbon icon-orange"></span><span class="desc d-block w-100 text-gray">ISSUED</span>'
        asset_prefix = '+'
      }
    } else {
      if(sent) {
        icon = '<span class="d-block w-100 icon icon-right-up-arrow icon-error"></span><span class="desc d-block w-100 text-gray">SENT</span>'
        asset_prefix = '-'
      } else {
        icon = '<span class="d-block w-100 icon icon-left-down-arrow icon-success"></span><span class="desc d-block w-100 text-gray">RECEIVED</span>'
        asset_prefix = '+'
      }
    }

    await screen.append('#bordered_content #transactions', 'transaction/list_item', {
      asset_name: asset_name,
      hash: transaction.value.hash,
      created_at: created_at.getDate(),
      created_at_month: created_at.toLocaleString('default', { month: 'short' }),
      asset_amount: asset_prefix + asset_info.amount,
      asset_decimals: asset_decimals,
      asset_type: asset_type,
      icon: icon,
      received: !sent ? '' : 'd-none hidden',
    })
  }

  if(all_transactions?.length < 1) {
    await screen.append('#bordered_content #transactions', 'shared/alert', {
      message: 'No transactions found yet.',
      alert_type: 'alert-info'
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

        const transaction = all_transactions.find((t) => {
          return e.target.dataset?.hash.toLowerCase() === t.value.hash.toLowerCase()
        })

        // TODO: temp disable asset transaction details.
        if(transaction?.type === 'asset' || transaction?.type === 'token') return

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