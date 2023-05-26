import Screen, { goBackScreen, goToScreen, reloadScreen } from './index.js'
import { AccountStore, bbbTxFee, CacheStore, NetworkStore, SettingsStore } from "@bitgreen/browser-wallet-core";
import { sendMessage } from "../messaging.js";

import { showNotification } from "../notifications.js";
import {
    addressValid,
    balanceToHuman, calculateCollatorApy,
    formatAddress,
    formatAmount, getAmountDecimal, humanToBalance,
    isFirefox,
    isIOs,
    isSafari
} from "@bitgreen/browser-wallet-utils";
import { hexToBn, hexToNumber, hexToString } from "@polkadot/util";
import BigNumber from "bignumber.js";
import anime from "animejs";
import * as jdenticon from "jdenticon";

export default async function stakingCollatorScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/default_custom_header',
        login: true,
        header: false,
        footer: true
    })
    await screen.init()

    await screen.set('#heading', 'staking/collator/heading', {
        title: formatAddress(params.collator)
    })

    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()
    const networks_store = new NetworkStore()
    const cache_store = new CacheStore(await networks_store.current())


    const all_collators = await sendMessage('get_collators')

    const collator = all_collators.find((c) => {
        return c.who === params?.collator
    })

    const delegator = collator.delegators.find((d) => {
        return d.who === current_account.address
    })

    const original_balance = await sendMessage('get_balance')
    const inflation_amount = await cache_store.asyncGet('inflation_amount')

    const collator_apy = calculateCollatorApy(all_collators, collator, inflation_amount)
    const collator_apy_data = getAmountDecimal(formatAmount(collator_apy.toString(), 2), 2)

    await screen.set('#bordered_content', 'staking/collator/content', {
        collator_jdenticon: jdenticon.toSvg(params?.collator, 56),
        total_stake: formatAmount(balanceToHuman(hexToBn(collator.totalStake)), 2, '', true),
        my_stake: formatAmount(balanceToHuman(hexToBn(delegator?.deposit)), 2, '', true),
        balance: formatAmount(balanceToHuman(original_balance.free, 2), 2),
        max_balance: balanceToHuman(original_balance.free, 18),
        apy_amount: collator_apy_data.amount,
        apy_decimals: collator_apy_data.decimals
    })
    document.querySelector('#bordered_content').classList.add('medium')

    if(balanceToHuman(hexToBn(delegator?.deposit)) > 0) {
        document.querySelector('#bordered_content #unbond').classList.remove('disabled')
    }

    const amount_el = document.querySelector("#root #amount")

    anime({
        targets: '#bordered_content',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeInOutSine',
        duration: 400
    });

    anime({
        targets: '#bordered_content .collator-image',
        opacity: [0, 1],
        translateY: [-20, 0],
        easing: 'easeInOutSine',
        duration: 400,
        delay: 200
    });

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#root #amount',
            type: 'input',
            listener: () => syncAmount()
        },
        {
            element: '#root #max_amount',
            listener: () => maxAmount()
        },
        {
            element: '#root #unbond',
            listener: async() => {
                await goToScreen('extrinsicSendScreen', {
                    domain: 'domain',
                    title: 'title',
                    pallet: 'parachainStaking',
                    call: 'undelegate',
                    call_parameters: JSON.stringify([
                        params?.collator
                    ])
                })
            }
        },
        {
            element: '#root #nominate',
            listener: async() => {
                await goToScreen('extrinsicSendScreen', {
                    domain: 'domain',
                    title: 'title',
                    pallet: 'parachainStaking',
                    call: 'delegate',
                    call_parameters: JSON.stringify([
                        params?.collator,
                        humanToBalance(amount_el.value)
                    ])
                })
            }
        }
    ])

    const syncAmount = () => {
        const button_el = document.querySelector("#root #nominate")

        if(parseFloat(amount_el.value) > 0
            && (parseFloat(amount_el.value) + bbbTxFee) <= parseFloat(balanceToHuman(original_balance.free, 18))
        ) {
            button_el.classList.remove('disabled')
            button_el.classList.add('btn-primary')

            amount_el.classList.remove('error')
        } else {
            button_el.classList.remove('btn-primary')
            button_el.classList.add('disabled')

            if((parseFloat(amount_el.value) + bbbTxFee) > parseFloat(balanceToHuman(original_balance.free, 18))) {
                amount_el.classList.add('error')
            } else {
                amount_el.classList.remove('error')
            }
        }
    }

    const maxAmount = () => {
        let max_amount = parseFloat(balanceToHuman(original_balance.free, 18)) - bbbTxFee

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

        syncAmount()
    }
}