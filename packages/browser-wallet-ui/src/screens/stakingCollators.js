import Screen, { goToScreen, updateCurrentParams } from './index.js'
import { AccountStore, CacheStore, NetworkStore, SettingsStore } from "@bitgreen/browser-wallet-core";
import {
  balanceToHuman,
  calculateCollatorApy,
  formatAddress,
  formatAmount,
  getAmountDecimal
} from "@bitgreen/browser-wallet-utils";
import { sendMessage } from "../messaging.js";
import BigNumber from "bignumber.js";
import anime from "animejs";
import * as jdenticon from "jdenticon";

export default async function stakingCollatorsScreen(params) {
  const screen = new Screen({
    template_name: 'layouts/full_page',
    template_params: {
      title: 'Collators'
    },
    login: true,
    header: false,
    footer: true
  })
  await screen.init()

  await screen.set('.content', 'staking/collators')

  const accounts_store = new AccountStore()
  const current_account = await accounts_store.current()
  const networks_store = new NetworkStore()
  const cache_store = new CacheStore(await networks_store.current())

  if(params?.target === 'my_nominations') {
    showMyNominations()
  } else {
    showAllCollators()
  }

  const balance = await sendMessage('get_balance')
  const inflation_amount = await cache_store.get('inflation_amount')

  const all_collators = await sendMessage('get_collators')
  let total_my_nominations = 0

  let my_stake = new BigNumber(0)
  for(const [key, collator] of Object.entries(all_collators)) {
    const collator_apy = calculateCollatorApy(all_collators, collator, inflation_amount)
    const collator_apy_data = getAmountDecimal(formatAmount(collator_apy.toString(), 2), 2)

    for(const [key, delegator] of Object.entries(collator.delegators)) {
      if(delegator.who === current_account.address) {
        await screen.append('.slide.my-nominations .collator-list', 'staking/list_item', {
          collator_jdenticon: jdenticon.toSvg(collator.who,56),
          collator_address: formatAddress(collator.who, 8, 12),
          collator_full_address: collator.who,
          total_stake: formatAmount(balanceToHuman(new BigNumber(delegator.deposit.replaceAll(',',''))), 2, '', true),
          apy_amount: collator_apy_data.amount,
          apy_decimals: collator_apy_data.decimals
        })

        total_my_nominations++

        my_stake = my_stake.plus(new BigNumber(delegator?.deposit.replaceAll(',','')))
      }
    }

    await screen.append('.slide.all-collators .collator-list', 'staking/list_item', {
      collator_jdenticon: jdenticon.toSvg(collator.who,56),
      collator_address: formatAddress(collator.who, 8, 12),
      collator_full_address: collator.who,
      total_stake: formatAmount(balanceToHuman(new BigNumber(collator.totalStake.replaceAll(',',''))), 2, '', true),
      apy_amount: collator_apy_data.amount,
      apy_decimals: collator_apy_data.decimals
    })
  }

  screen.setParam('.slide.my-nominations .total-staked', formatAmount(balanceToHuman(my_stake), 2))
  screen.setParam('.slide.my-nominations .total-available', formatAmount(balanceToHuman(balance.free), 2))

  screen.setParam('#my_nominations .badge', total_my_nominations)
  screen.setParam('#all_collators .badge', all_collators.length)

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => goToScreen('stakingHomeScreen')
    },
    {
      element: '#my_nominations',
      listener: () => showMyNominations()
    },
    {
      element: '#all_collators',
      listener: () => showAllCollators()
    },
    {
      element: '#staking_collators .button-item',
      listener: (e) => {
        if(!e.target.dataset?.collator) return false

        return goToScreen('stakingCollatorScreen', {
          collator: e.target.dataset?.collator
        })
      }
    }
  ])

  function showMyNominations() {
    const my_nominations_el = document.querySelector('#my_nominations')
    const all_collators_el = document.querySelector('#all_collators')

    const my_nominations_slide_el = document.querySelector('.slide.my-nominations')
    const all_collators_slide_el = document.querySelector('.slide.all-collators')

    if(all_collators_slide_el.classList.contains('active')) {
      anime({
        targets: '.slide.all-collators',
        opacity: [1, 0],
        easing: 'easeInOutSine',
        duration: 400
      });
    }

    anime({
      targets: '.slide.my-nominations',
      opacity: [0, 1],
      easing: 'easeInOutSine',
      duration: 400,
      delay: 400
    });

    my_nominations_el.classList.add('active')
    all_collators_el.classList.remove('active')

    my_nominations_slide_el.classList.add('active')
    all_collators_slide_el.classList.remove('active')

    updateCurrentParams({
      target: 'my_nominations'
    })
  }

  function showAllCollators() {
    const my_nominations_el = document.querySelector('#my_nominations')
    const all_collators_el = document.querySelector('#all_collators')

    const my_nominations_slide_el = document.querySelector('.slide.my-nominations')
    const all_collators_slide_el = document.querySelector('.slide.all-collators')

    if(my_nominations_slide_el.classList.contains('active')) {
      anime({
        targets: '.slide.my-nominations',
        opacity: [1, 0],
        easing: 'easeInOutSine',
        duration: 400
      });
    }

    anime({
      targets: '.slide.all-collators',
      opacity: [0, 1],
      easing: 'easeInOutSine',
      duration: 400,
      delay: 400
    });

    my_nominations_el.classList.remove('active')
    all_collators_el.classList.add('active')

    my_nominations_slide_el.classList.remove('active')
    all_collators_slide_el.classList.add('active')

    updateCurrentParams({
      target: 'all_collators'
    })
  }
}