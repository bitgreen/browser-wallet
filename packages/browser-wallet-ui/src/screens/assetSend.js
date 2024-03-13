import Screen, {expireBrowserTabRequest, goToScreen, scrollContentToBottom, updateCurrentParams} from './index.js'
import { disableKillPopup, sendMessage } from "../messaging.js";
import {AccountStore, WalletStore} from "@bitgreen/browser-wallet-core";
import {
  addressValid,
  balanceToHuman,
  formatAddress,
  formatAmount,
  humanToBalance, isIOs
} from "@bitgreen/browser-wallet-utils";
import { showNotification } from "../notifications.js";

import {Tooltip} from 'bootstrap'
import anime from "animejs";
import { renderTemplate } from "../screens.js";

export default async function assetSendScreen(params) {
  const wallet_store = new WalletStore()
  if(!await wallet_store.exists()) {
    await showNotification('You need a wallet to perform this action. Please create or import one.', 'alert', 3200)
    await expireBrowserTabRequest()
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

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });

  let current_asset = {}

  let preselected_asset = params?.asset || params?.asset === 0 ? params.asset : 'bbb'
  let recipient = params?.recipient ? params.recipient : null
  let preselected_amount = params?.amount ? params.amount : (0).toFixed(2)
  await screen.set('#bordered_content', 'asset/send', {
    recipient,
    from_name: current_account.name,
    from_address: formatAddress(current_account.address, 16, 8)
  })

  const asset_info_el = document.querySelector("#asset_info");
  const amount_el = document.querySelector("#root #amount")
  const usd_amount_el = document.querySelector("#root #usd_amount")
  const send_info_el = document.querySelector("#root #send_info .info")
  const send_error_el = document.querySelector("#root #send_info .error")
  const total_amount_el = document.querySelector("#root #send_info .total-amount")
  const recipient_el = document.querySelector("#root #recipient")

  const feeTooltip = new Tooltip('#root #go_review_transaction')

  if(isIOs()) {
    await screen.moveFooterOnTop()
  }

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
      element: '#root #asset_info',
      listener: (e) => {
        let dropdown_el = document.querySelector("#asset_info .dropdown");

        if(dropdown_el.contains(e.target)) {
          if(!e.target.dataset?.token && !e.target.dataset?.asset) return false

          if(parseInt(e.target.dataset?.asset) >= 0) {
            selectAsset(e.target.dataset?.asset, '0')
          } else {
            selectAsset(e.target.dataset?.token, '0.00')
          }

          toggleAssetDropdown()

        } else {
          toggleAssetDropdown()
        }
      }
    },
    {
      element: '#root #amount',
      type: 'input',
      listener: (e) => {
        if(!current_asset.is_token) {
          e.target.value = parseInt(e.target.value.toString())
        }

        syncAmount('amount')
      }
    },
    {
      element: '#root #usd_amount',
      type: 'input',
      listener: (e) => {
        if(current_asset.price <= 0) {
          e.target.value = (0).toFixed(2)
          return
        }

        syncAmount('usd_amount')
      }
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
      element: '#root #recipient',
      type: 'focus',
      listener: () => {
        if(isIOs()) scrollContentToBottom('#root #bordered_content')
      }
    },
    {
      element: '#go_review_transaction',
      listener: async() => {
        feeTooltip.hide()
        updateCurrentParams({
          asset: current_asset.name,
          amount: amount_el.value,
          recipient: recipient_el.value
        })
        await goToScreen('assetTransactionReviewScreen', {
          amount: amount_el.value,
          recipient: recipient_el.value,
          account_id: current_account.id,

          current_asset: current_asset,

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

    let is_ok = false

    if(parseFloat(amount_el.value) > 0) {
      if(current_asset.is_token) {
        if(current_asset?.name === 'bbb') {
          if((parseFloat(amount_el.value) + parseFloat(estimated_fee)) <= parseFloat(balanceToHuman(current_asset.balance, 18))) {
            is_ok = true
          }
        } else if(parseFloat(amount_el.value) <= parseFloat(balanceToHuman(current_asset.balance, 18))) {
          is_ok = true
        }
      } else if(parseInt(amount_el.value) <= parseInt(current_asset.balance)) {
        is_ok = true
      }

      if(is_ok) {
        amount_el.classList.remove('error')

        send_info_el.classList.add('d-block')
        send_error_el.classList.remove('d-block')
      } else {
        amount_el.classList.add('error')

        send_info_el.classList.remove('d-block')
        send_error_el.classList.add('d-block')
      }
    } else {
      button_el.classList.remove('btn-primary')
      button_el.classList.add('disabled')
    }

    if(is_ok && addressValid(address)) {
      button_el.classList.remove('disabled')
      button_el.classList.add('btn-primary')
    } else {
      button_el.classList.remove('btn-primary')
      button_el.classList.add('disabled')
    }
  }

  let estimated_fee = 0
  const getEstimatedFee = async() => {
    const address = recipient_el.value

    if(current_asset.is_token) {
      if(current_asset.name.toLowerCase() === 'bbb') {
        estimated_fee = await sendMessage('get_estimated_fee', {
          pallet: 'balances',
          call: 'transfer',
          call_parameters: [
            addressValid(address) ? address : current_account.address,
            humanToBalance(amount_el.value)
          ],
          account_address: current_account.address
        })
      } else {
        estimated_fee = await sendMessage('get_estimated_fee', {
          pallet: 'tokens',
          call: 'transfer',
          call_parameters: [
            addressValid(address) ? address : current_account.address,
            current_asset.name,
            humanToBalance(amount_el.value)
          ],
          account_address: current_account.address
        })
      }
    } else {
      estimated_fee = await sendMessage('get_estimated_fee', {
        pallet: 'assets',
        call: 'transfer',
        call_parameters: [
          current_asset.name,
          addressValid(address) ? address : current_account.address,
          parseInt(amount_el.value)
        ],
        account_address: current_account.address
      })
    }

    estimated_fee = formatAmount(balanceToHuman(estimated_fee , 18), 18)

    document.querySelector('#bordered_content #go_review_transaction').dataset.bsOriginalTitle = `Estimated Transaction Fee:<br>${estimated_fee.toString()} BBB`

    return estimated_fee
  }

  let decimals = 2
  const syncAmount = (type = 'both') => {
    let amount, usd_amount, total_amount

    if(type === 'usd_amount') {
      if(current_asset.price > 0) {
        amount = usd_amount_el.value / current_asset.price
      } else {
        amount = 0
      }
    }
    if(type === 'amount' || type === 'both') {
      amount = amount_el.value
      usd_amount = amount_el.value * current_asset.price
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

      if(!current_asset.is_token) {
        decimals = 0
      }
    } else {
      // min 2 decimals
      if(decimals < 2) {
        decimals = 2
      }
    }

    amount = parseFloat(amount).toFixed(decimals)
    usd_amount = parseFloat(usd_amount).toFixed(2)
    total_amount = (parseFloat(amount) + parseFloat(estimated_fee)).toFixed(decimals)

    if(type === 'amount' || type === 'both') usd_amount_el.value = usd_amount
    if(type === 'usd_amount' || type === 'both') amount_el.value = amount

    total_amount_el.innerHTML = isNaN(total_amount) ? '0' : total_amount

    getEstimatedFee().then()
    checkAddress()
  }

  const maxAmount = () => {
    let max_amount = current_asset.balance

    if(current_asset.is_token) {
      if(current_asset?.name === 'bbb') {
        max_amount = parseFloat(balanceToHuman(current_asset.balance, 18)) - parseFloat(estimated_fee)

        if(max_amount <= 0) {
          max_amount = 0.00
        }

        if(max_amount > 100000) {
          amount_el.value = (max_amount - 0.0001).toFixed(4)
        } else if(max_amount > 1000) {
          amount_el.value = (max_amount - 0.000001).toFixed(6)
        } else {
          max_amount = max_amount - 0.00000001
          if(max_amount <= 0) {
            max_amount = 0.00
            amount_el.value = max_amount.toFixed(2)
          } else {
            amount_el.value = max_amount.toFixed(8)
          }
        }
      } else {
        max_amount = parseFloat(balanceToHuman(current_asset.balance, 18))

        if(max_amount > 10000) {
          amount_el.value = max_amount.toFixed(4)
        } else {
          amount_el.value = max_amount.toFixed(8)
        }
      }
    } else {
      amount_el.value = max_amount.toFixed(0)
    }

    syncAmount('amount')
  }

  const toggleAssetDropdown = () => {
    if(asset_info_el.classList.contains('active')) {
      asset_info_el.classList.remove('active')
    } else {
      if(!asset_info_el.classList.contains('disabled')) {
        asset_info_el.classList.add('active')
      }
    }
  }

  let all_balances = null
  const selectAsset = async(selected_asset = 'BBB', amount = '0.00') => {
    if(!all_balances) {
      all_balances = await sendMessage('get_all_balances')
    }

    document.querySelector('#bordered_content #amount').value = amount

    await screen.reset('#bordered_content #asset_info .dropdown .content')

    const defaultIcon = await renderTemplate('shared/icons/default')

    const bbbIcon = await renderTemplate('shared/icons/bbb')
    const usdtIcon = await renderTemplate('shared/icons/usdt')
    const usdcIcon = await renderTemplate('shared/icons/usdc')
    const dotIcon = await renderTemplate('shared/icons/dot')
    const carbonCreditIcon = await renderTemplate('shared/icons/carbon_credit')

    for (const token of all_balances.tokens) {
      let icon = defaultIcon
      if(token.token_name === 'BBB') icon = bbbIcon
      if(token.token_name === 'USDT') icon = usdtIcon
      if(token.token_name === 'USDC') icon = usdcIcon
      if(token.token_name === 'DOT') icon = dotIcon

      const available_balance = balanceToHuman(token.free, 2)

      if(selected_asset.toString().toLowerCase() === token.token_name.toLowerCase()) {
        usd_amount_el.removeAttribute('disabled')

        screen.setParam('#choose_quantity .asset-name', token.token_name.toUpperCase() + ' TOKENS')
        screen.setParam('#bordered_content .asset-symbol', token.token_name.toUpperCase())

        current_asset = {
          is_token: true,
          asset_id: token.name,
          name: token.token_name.toLowerCase(),
          balance: token.free,
          price: token.price
        }

        const asset_icon_el = document.querySelector('#bordered_content #asset_info .selected .asset-icon')

        if(asset_icon_el) {
          asset_icon_el.classList.add('animate-out')
        }

        setTimeout(async() => {
          await screen.set('#bordered_content #asset_info .selected', 'asset/list_item', {
            token: token.token_name,
            asset_name: token.token_name + ' Token',
            balance: formatAmount(available_balance, 2),
            icon: icon
          })

          const asset_icon_el = document.querySelector('#bordered_content #asset_info .selected .asset-icon')

          setTimeout(async() => {
            asset_icon_el.classList.add('animate-in')
          }, 10)
        }, 300)
      } else {
        // little delay for smooth transition
        setTimeout(() => {
          screen.append('#bordered_content #asset_info .dropdown .content', 'asset/list_item', {
            token: token.token_name,
            asset_name: token.token_name + ' Token',
            balance: formatAmount(available_balance, 2),
            icon: icon
          })
        }, 300)
      }
    }

    for (const asset of all_balances.assets) {
      let icon = carbonCreditIcon

      const available_balance = asset.balance
      const asset_short_name = asset.asset_name.length > 22 ? asset.asset_name.substring(0,22) + '...' : asset.asset_name

      if(parseInt(selected_asset) === parseInt(asset.asset_id)) {
        screen.setParam('#choose_quantity .asset-name', 'CREDITS')
        screen.setParam('#bordered_content .asset-symbol', 'CREDITS')
        usd_amount_el.setAttribute('disabled', 'disabled')

        current_asset = {
          is_token: false,
          asset_id: asset.asset_id,
          name: asset_short_name,
          balance: asset.balance,
          price: asset.price
        }

        const asset_icon_el = document.querySelector('#bordered_content #asset_info .selected .asset-icon')

        if(asset_icon_el) {
          asset_icon_el.classList.add('animate-out')
        }

        setTimeout(async() => {
          await screen.set('#bordered_content #asset_info .selected', 'asset/list_item', {
            asset: asset.asset_id,
            asset_name: asset_short_name,
            balance: available_balance,
            icon: icon
          })

          const asset_icon_el = document.querySelector('#bordered_content #asset_info .selected .asset-icon')

          setTimeout(async() => {
            asset_icon_el.classList.add('animate-in')
          }, 10)
        }, 300)
      } else {
        // little delay for smooth transition
        setTimeout(() => {
          screen.append('#bordered_content #asset_info .dropdown .content', 'asset/list_item', {
            asset: asset.asset_id,
            asset_name: asset_short_name,
            balance: available_balance,
            icon: icon
          })
        }, 400)
      }
    }

    if(all_balances.tokens.length + all_balances.assets.length > 1) {
      asset_info_el.classList.remove('disabled')
    }

    syncAmount('amount')
  }
  selectAsset(preselected_asset, preselected_amount).then()
}