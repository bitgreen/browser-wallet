import Screen, { expireBrowserTabRequest, goToScreen } from './index.js'
import {
  AccountStore,
  CacheStore,
  NetworkStore,
  WalletStore,
  polkadotApi
} from "@bitgreen/browser-wallet-core";
import {
  balanceToHuman,
  calculateUserRewardPerBlock,
  formatAmount,
  getAmountDecimal, getApyByAddress, getAverageApy, getTotalStakedByAddress
} from "@bitgreen/browser-wallet-utils";
import { sendMessage } from "../messaging.js";
import { showNotification } from "../notifications.js";
import anime from "animejs";
import BigNumber from "bignumber.js";

export default async function stakingHomeScreen() {
  const wallet_store = new WalletStore()
  if(!await wallet_store.exists()) {
    await showNotification('You need a wallet to perform this action. Please create or import one.', 'alert', 3200)
    await expireBrowserTabRequest()
    return await goToScreen('walletScreen', {}, false, true)
  }

  const screen = new Screen({
    template_name: 'layouts/full_page_secondary',
    login: true,
    header: true,
    footer: true
  })
  await screen.init()

  const accounts_store = new AccountStore()
  const current_account = await accounts_store.current()
  const networks_store = new NetworkStore()
  const cache_store = new CacheStore(await networks_store.current())

  const all_collators = await sendMessage('get_collators')

  const balance = await sendMessage('get_balance')
  const inflation_amount = await cache_store.get('inflation_amount')

  const my_total_stake = getTotalStakedByAddress(all_collators, current_account.address)
  const average_user_apy = getApyByAddress(all_collators, current_account.address, inflation_amount)

  if(my_total_stake > 0) {
    let reward_per_block = calculateUserRewardPerBlock(my_total_stake, average_user_apy, inflation_amount)
    let reward_base = 'BBB'

    if(reward_per_block.isLessThan(new BigNumber(1000000 / Math.pow(10, 18))) ) {
      reward_base = 'nBBB'
      reward_per_block = reward_per_block.multipliedBy(new BigNumber(1000000000))
    } else if(reward_per_block.isLessThan(new BigNumber(1000000000 / Math.pow(10, 18))) ) {
      reward_base = 'mmBBB'
      reward_per_block = reward_per_block.multipliedBy(new BigNumber(1000000))
    } else if(reward_per_block.isLessThan(new BigNumber(1000000000000 / Math.pow(10, 18))) ) {
      reward_base = 'mBBB'
      reward_per_block = reward_per_block.multipliedBy(new BigNumber(1000))
    }

    const reward_data = getAmountDecimal(formatAmount(!reward_per_block.isNaN() ? reward_per_block.toString() : 0, 6), 6)
    const collator_apy_data = getAmountDecimal(formatAmount(average_user_apy.toString(), 2), 2)

    await screen.set('.content', 'staking/home/active', {
      apy_amount: collator_apy_data.amount,
      apy_decimals: collator_apy_data.decimals,
      reward_amount: reward_data?.amount || 0,
      reward_decimals: reward_data?.decimals || 0,
      reward_base: reward_base
    })

    await screen.set('.content #staking_info', 'staking/home/info', {
      'locked_amount': formatAmount(balanceToHuman(balance.frozen + balance.reserved), 2),
      'available_amount': formatAmount(balanceToHuman(balance.free), 2)
    })

    anime({
      targets: '#root .content #change_nominations',
      opacity: [0, 1],
      translateX: [-20, 0],
      easing: 'easeInOutSine',
      duration: 400,
      delay: 200
    });
  } else {
    const average_apy = getAverageApy(all_collators, inflation_amount)
    const collator_apy_data = getAmountDecimal(formatAmount(average_apy.toString(), 2), 2)

    await screen.set('.content', 'staking/home/inactive', {
      apy_amount: collator_apy_data.amount,
      apy_decimals: collator_apy_data.decimals
    })

    await screen.set('.content #staking_info', 'staking/home/info', {
      'locked_amount': formatAmount(balanceToHuman(balance.frozen + balance.reserved), 2),
      'available_amount': formatAmount(balanceToHuman(balance.free), 2)
    })

    anime({
      targets: '#root .content #get_started_staking',
      opacity: [0, 1],
      translateX: [-20, 0],
      easing: 'easeInOutSine',
      duration: 400,
      delay: 200
    });
  }

  polkadotApi().then((polkadot_api) => {
    polkadot_api.query.parachainStaking.unbondedDelegates(current_account.address).then((data) => {
      data = data.toJSON()

      const deposit = new BigNumber(data?.deposit?.replaceAll(',','') || 0)

      if(deposit > 0) {
        document.querySelector('#root .content #withdraw_unbonded').classList.remove('d-none')

        screen.setParam('#root .content .unbonded-amount', formatAmount(balanceToHuman(deposit), 2))

        anime({
          targets: '#root .content #withdraw_unbonded',
          opacity: [0, 1],
          translateX: [-20, 0],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 400
        });
      }
    })
  })

  screen.setListeners([
    {
      element: '#root .content #get_started_staking',
      listener: () => goToScreen('stakingIntroScreen')
    },
    {
      element: '#root .content #change_nominations',
      listener: () => goToScreen('stakingCollatorsScreen', {
        target: 'my_nominations'
      })
    },
    {
      element: '#root .content #withdraw_unbonded',
      listener: () => goToScreen('extrinsicSendScreen', {
        pallet: 'parachainStaking',
        call: 'withdrawUnbonded'
      })
    },
  ])

  anime({
    targets: '#root .content',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 400
  });

  anime({
    targets: '#root .content #balance .text-white',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 400,
    delay: function(el, i) {
      return i*200 + 100
    },
  });

  anime({
    targets: '#root .content .bottom-text',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 400,
    delay: 400
  });
}