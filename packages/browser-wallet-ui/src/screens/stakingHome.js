import Screen, { clearHistory, goBackScreen, goToScreen, scrollToBottom } from './index.js'
import { sendMessage } from "../messaging.js";
import DOMPurify from "dompurify";
import { AccountStore, checkIfAppIsKnown, WalletStore } from "@bitgreen/browser-wallet-core";

import anime from "animejs";
import { showNotification } from "../notifications.js";
import {
    balanceToHuman,
    calculateCollatorApy, calculateUserRewardPerBlock,
    formatAddress,
    formatAmount,
    getAmountDecimal, getApyByAddress, getAverageApy, getTotalStakedByAddress
} from "@bitgreen/browser-wallet-utils";
import * as jdenticon from "jdenticon";
import { hexToBigInt, hexToBn, hexToString } from "@polkadot/util";
import BigNumber from "bignumber.js";

export default async function stakingHomeScreen() {
    const screen = new Screen({
        template_name: 'layouts/full_page_secondary',
        login: true,
        header: true,
        footer: true
    })
    await screen.init()

    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()

    const all_collators = await sendMessage('get_collators')

    const balance = await sendMessage('get_balance')
    const staking_info = await sendMessage('get_staking_info')

    const my_total_stake = getTotalStakedByAddress(all_collators, current_account.address)
    const average_user_apy = getApyByAddress(all_collators, current_account.address, staking_info.inflation_amount)

    if(my_total_stake > 0) {
        let reward_per_block = calculateUserRewardPerBlock(my_total_stake, average_user_apy, staking_info.inflation_amount)
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

        const reward_data = getAmountDecimal(formatAmount(reward_per_block.toString(), 6), 6)
        const collator_apy_data = getAmountDecimal(formatAmount(average_user_apy.toString(), 2), 2)

        await screen.set('.content', 'staking/home/active', {
            apy_amount: collator_apy_data.amount,
            apy_decimals: collator_apy_data.decimals,
            reward_amount: reward_data.amount,
            reward_decimals: reward_data.decimals,
            reward_base: reward_base
        })
    } else {
        const average_apy = getAverageApy(all_collators, staking_info.inflation_amount)
        const collator_apy_data = getAmountDecimal(formatAmount(average_apy.toString(), 2), 2)

        await screen.set('.content', 'staking/home/inactive', {
            apy_amount: collator_apy_data.amount,
            apy_decimals: collator_apy_data.decimals
        })
    }

    await screen.set('.content #staking_info', 'staking/home/info', {
        'locked_amount': formatAmount(balanceToHuman(balance.frozen + balance.reserved), 2),
        'available_amount': formatAmount(balanceToHuman(balance.free), 2)
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
    ])

    anime({
        targets: '#root .content',
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 400
    });

    anime({
        targets: '#root .content .btn',
        opacity: [0, 1],
        translateX: [-20, 0],
        easing: 'easeInOutSine',
        duration: 400,
        delay: 200
    });

    anime({
        targets: '#root .content #balance .text-white',
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 400,
        delay: function(el, i) {
            return i*200 + 200
        },
    });

    anime({
        targets: '#root .content .bottom-text',
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 400,
        delay: 800
    });
}