import {bbbTokenPrice, WalletStore} from "@bitgreen/browser-wallet-core";
import Screen, { clearHistory, goToScreen } from './index.js'

import anime from 'animejs';
import { sendMessage } from "../messaging.js";
import { initChart, renderChart } from "../chart.js";
import { balanceToHuman, formatAmount, getAmountDecimal, humanToBalance, sleep } from "@bitgreen/browser-wallet-utils";
import BigNumber from "bignumber.js";

export default async function dashboardScreen(params = {
    imported: false
}) {
    const wallet_store = new WalletStore()
    if(!await wallet_store.exists()) {
        await clearHistory()
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

    await clearHistory()

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

        const total_bbb_balance = balanceToHuman(bbb_balance.plus(new BigNumber(vesting_contract?.amount | 0)), 18)

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

        screen.setParam('#bordered_content .all_balance', formatAmount(balanceToHuman(all_balances.total), 2))
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
            element: '#nature_based_credits',
            listener: () => goToScreen('natureBasedCreditsScreen')
        },
        {
            element: '#retired_credits',
            listener: () => goToScreen('retiredCreditsScreen')
        },
        {
            element: '#all_assests',
            listener: () => goToScreen('assetAllScreen')
        },
        {
            element: '#bbb_tokens',
            listener: () => goToScreen('tokenBBBScreen')
        },
        {
            element: '#other_tokens',
            listener: () => goToScreen('tokenAllScreen')
        },
    ])
}