import {AccountStore, CacheStore, NetworkStore, WalletStore} from "@bitgreen/browser-wallet-core";
import Screen, { expireBrowserTabRequest, goToScreen } from './index.js'

import anime from 'animejs';
import { sendMessage } from "../messaging.js";
import { initChart, renderChart } from "../chart.js";
import { balanceToHuman, formatAmount, getAmountDecimal, humanToBalance, sleep } from "@bitgreen/browser-wallet-utils";
import BigNumber from "bignumber.js";

export default async function dashboardScreen(params = {
  imported: false
}) {
  const network_store = new NetworkStore()
  const current_network = await network_store.current()
  const cache_store = new CacheStore()
  const bbbTokenPrice = await cache_store.get('bbb_price')
  const cache_store_network = new CacheStore(current_network)

  const accounts_store = new AccountStore()
  const current_account = await accounts_store.current()

  const kyc_level = await cache_store_network.get('kyc_' + current_account.address)

  const wallet_store = new WalletStore()
  if(!await wallet_store.exists()) {
    await expireBrowserTabRequest()
    return await goToScreen('walletScreen', {}, false, true)
  }

  const screen = new Screen({
    template_name: 'layouts/page_big_heading',
    header: true,
    footer: true,
    freeze_root: true,
    freeze_root_delay: 1200
  })
  await screen.init()

  const token_price_info = getAmountDecimal(bbbTokenPrice, 2)

  await screen.set('#heading', 'dashboard/heading', {
    token_price: token_price_info.amount,
    token_price_decimals: token_price_info.decimals
  })

  await screen.set('#bordered_content', 'dashboard/content')
  document.querySelector('#bordered_content').classList.add('no-overflow')

  await expireBrowserTabRequest()

  const kyc_status_el = document.querySelector('#bordered_content #kyc_status .pill span')
  const kyc_shield_el = document.querySelector('#bordered_content #kyc_status .shield')
  if(kyc_level) {
    if(kyc_level === '4') {
      kyc_status_el.innerHTML = 'Accredited'
    } else if (kyc_level === '1') {
      kyc_status_el.innerHTML = 'Basic'
    } else {
      kyc_status_el.innerHTML = 'Advanced'
    }
    kyc_shield_el.classList.add('verified')
  } else {
    kyc_shield_el.classList.add('unverified')
    kyc_status_el.innerHTML = 'Not Verified'
  }

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });

  anime({
    targets: '#portfolio',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 200
  });

  anime({
    targets: '#portfolio .info h1',
    translateX: [-20, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 300,
    delay: 200
  });

  anime({
    targets: '#portfolio #bbb_token_info svg',
    scale: [0.4, 1],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 400,
    delay: 300
  });

  anime({
    targets: '#portfolio #bbb_token_info .amounts',
    translateX: [20, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 400,
    delay: 400
  });

  anime({
    targets: '#portfolio .info p',
    translateX: [-20, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 300,
    delay: function(el, i) {
      return i*400 + 100
    },
  });

  anime({
    targets: '#portfolio .info p .icon.icon-circle',
    translateX: [20, 0],
    scale: [1.5, 1],
    easing: 'easeInOutSine',
    duration: 300,
    delay: function(el, i) {
      return i*400 + 100
    },
  });

  anime({
    targets: '#bordered_content #top_items button',
    duration: 400,
    translateX: [20, 0],
    opacity: [0, 1],
    easing: 'linear',
    delay: function(el, i) {
      return i*300 + 200
    },
  });

  sendMessage('get_all_balances').then(async(all_balances) => {
    let bbb_balance = 0
    let other_usd_amount = 0
    for(const token of all_balances.tokens) {
      if(token.token_name === 'BBB') {
        bbb_balance = new BigNumber(token.total)
      } else {
        other_usd_amount += balanceToHuman(token.total, 18) * token.price
      }
    }
    for(const asset of all_balances.assets) {
      other_usd_amount += asset.balance * asset.price
    }

    const vesting_contract = await sendMessage('get_vesting_contract')

    let vesting_balance = new BigNumber(0)
    if(vesting_contract) {
      vesting_balance = balanceToHuman(vesting_contract?.amount, 18)
    }

    const total_bbb_balance = balanceToHuman(bbb_balance.plus(new BigNumber(vesting_contract?.amount || 0)), 18)

    const bbb_usd_amount = balanceToHuman(bbb_balance, 18) * bbbTokenPrice

    const vesting_usd_amount = vesting_balance * bbbTokenPrice

    if(vesting_usd_amount > 0) {
      document.querySelector('#portfolio #vesting_info').classList.remove('d-none')
      document.querySelector('#portfolio #vesting_info').classList.add('d-flex')

      screen.setParam('#portfolio .vesting_usd_amount', '$' + formatAmount(vesting_usd_amount, vesting_usd_amount < 1000000 ? 2 : 0))
    }

    await screen.set('#chart', 'dashboard/chart')
    initChart({
      bbb_token_amount: bbb_usd_amount + vesting_usd_amount,
      other_amount: other_usd_amount
    })

    screen.setParam('#portfolio .bbb_usd_amount', '$' + formatAmount(bbb_usd_amount, bbb_usd_amount < 1000000 ? 2 : 0))
    screen.setParam('#portfolio .other_usd_amount', '$' + formatAmount(other_usd_amount, bbb_usd_amount < 1000000 ? 2 : 0))

    screen.setParam('#bordered_content .all_balance', formatAmount(balanceToHuman(new BigNumber(all_balances.total).plus(new BigNumber(vesting_contract?.amount || 0))), 2))
    screen.setParam('#bordered_content .bbb_balance', formatAmount(total_bbb_balance, 2))
    screen.setParam('#bordered_content .token_balance', formatAmount(balanceToHuman(all_balances.tokens_total), 2))
  }).then(() => {
    renderChart()
  }).then(() => {
    anime({
      targets: '#bordered_content .button-item',
      easing: 'easeInOutSine',
      translateX: [-20, 0],
      opacity: [0, 1],
      duration: function(el, i) {
        return 400 - i*50
      },
      delay: function(el, i) {
        return i*200 + 200
      },
    });
  }).catch((e) => {
    goToScreen('connectionErrorScreen')
  })

  screen.setListeners([
    {
      element: '#send',
      listener: () => goToScreen('assetSendScreen')
    },
    {
      element: '#receive',
      listener: () => goToScreen('assetReceiveScreen')
    },
    {
      element: '#bordered_content #nature_based_credits',
      listener: () => goToScreen('natureBasedCreditsScreen')
    },
    {
      element: '#bordered_content #retired_credits',
      listener: () => goToScreen('retiredCreditsScreen')
    },
    {
      element: '#bordered_content #all_assests',
      listener: () => goToScreen('assetAllScreen')
    },
    {
      element: '#bordered_content #bbb_tokens',
      listener: () => goToScreen('tokenBBBScreen')
    },
    {
      element: '#bordered_content #other_tokens',
      listener: () => goToScreen('tokenAllScreen')
    },
    {
      element: '#bordered_content #kyc_status',
      listener: () => {
        if(kyc_level) {
          if(kyc_level === '4') {
            return goToScreen('kycAccreditedScreen', {
              account_id: current_account.id
            })
          }

          if(kyc_level === '2' || kyc_level === '3') {
            return goToScreen('kycAdvancedScreen', {
              account_id: current_account.id,
              kyc_level: kyc_level
            })
          }

          return goToScreen('kycBasicScreen', {
            account_id: current_account.id
          })
        } else {
          return goToScreen('kycStartScreen', {
            account_id: current_account.id
          })
        }
      }
    },
  ])
}