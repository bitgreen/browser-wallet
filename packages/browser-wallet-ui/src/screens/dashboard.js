import {bbbTokenPrice, WalletStore} from "@bitgreen/browser-wallet-core";
import Screen, { clearHistory, goToScreen } from './index.js'

import anime from 'animejs';
import { sendMessage } from "../messaging.js";
import { initChart, renderChart } from "../chart.js";
import {balanceToHuman, formatAmount, getAmountDecimal} from "@bitgreen/browser-wallet-utils";

export default async function dashboardScreen(params = {
    imported: false,
    extend_delay: false
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
        freeze_root_delay: params?.extend_delay ? 1800 : 1200
    })
    await screen.init()

    const balance = await sendMessage('get_balance')
    const token_price_info = getAmountDecimal(bbbTokenPrice, 2)

    const bbb_usd_amount = balanceToHuman(balance, 18) * bbbTokenPrice

    await screen.set('#heading', 'dashboard/heading', {
        bbb_usd_amount: formatAmount(bbb_usd_amount, bbb_usd_amount < 1000000 ? 2 : 0),
        token_price: token_price_info.amount,
        token_price_decimals: token_price_info.decimals
    })
    await screen.set('#bordered_content', 'dashboard/content', {
        all_balance: formatAmount(balanceToHuman(balance, 2)),
        bbb_balance: formatAmount(balanceToHuman(balance, 2))
    })

    await screen.set('#chart', 'dashboard/chart')
    initChart({
        bbb_token_amount: balanceToHuman(balance, 18)
    })

    await clearHistory()

    anime({
        targets: '#portfolio',
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 200,
        delay: params.extend_delay ? 400 : 200
    });

    anime({
        targets: '#portfolio .info h1',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 300,
        delay: params.extend_delay ? 1000 : 200
    });

    anime({
        targets: '#portfolio #bbb_token_info svg',
        scale: [0.4, 1],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 400,
        delay: params.extend_delay ? 1200 : 400
    });

    anime({
        targets: '#portfolio #bbb_token_info .amounts',
        translateX: [20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 400,
        delay: params.extend_delay ? 1400 : 600
    });

    anime({
        targets: '#portfolio .info p',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 300,
        delay: function(el, i) {
            return i*400 + (params.extend_delay ? 1200 : 400)
        },
    });

    anime({
        targets: '#portfolio .info p .icon',
        translateX: [20, 0],
        scale: [1.5, 1],
        easing: 'easeInOutSine',
        duration: 300,
        delay: function(el, i) {
            return i*400 + (params.extend_delay ? 1200 : 400)
        },
    });

    anime({
        targets: '#bordered_content #top_items button',
        duration: 400,
        translateX: [20, 0],
        opacity: [0, 1],
        easing: 'linear',
        delay: function(el, i) {
            return i*300 + (params.extend_delay ? 1400 : 600)
        },
    });

    anime({
        targets: '#bordered_content .button-item',
        easing: 'easeInOutSine',
        translateX: [-20, 0],
        opacity: [0, 1],
        // duration: 300,
        duration: function(el, i) {
            return (params.extend_delay ? 600 : 400) - i*(params.extend_delay ? 100 : 50)
        },
        delay: function(el, i) {
            return i*200 + (params.extend_delay ? 800 : 200)
        },
    });

    if(params.extend_delay) {
        setTimeout(await renderChart, 900)
    } else {
        await renderChart()
    }

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
    ])
}