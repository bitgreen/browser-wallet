import Screen, { clearHistory, goBackScreen, goToScreen, scrollToBottom } from './index.js'
import { sendMessage } from "../messaging.js";
import DOMPurify from "dompurify";
import { AccountStore, checkIfAppIsKnown, WalletStore } from "@bitgreen/browser-wallet-core";

import anime from "animejs";
import { showNotification } from "../notifications.js";
import { balanceToHuman, formatAmount } from "@bitgreen/browser-wallet-utils";

export default async function stakingHomeScreen() {
    const screen = new Screen({
        template_name: 'layouts/full_page_secondary',
        login: true,
        header: true,
        footer: true
    })
    await screen.init()

    const balance = await sendMessage('get_balance')

    await screen.set('.content', 'staking/home', {
        'apy_base': 10,
        'apy_decimals': 67,
        'locked_amount': formatAmount(balanceToHuman(balance.frozen + balance.reserved), 2),
        'available_amount': formatAmount(balanceToHuman(balance.free), 2)
    })

    screen.setListeners([
        {
            element: '#root .content #get_started_staking',
            listener: () => goToScreen('stakingIntroScreen')
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