import Screen, { goBackScreen, goToScreen, updateCurrentParams } from './index.js'
import { showNotification } from "../notifications.js";

import anime from 'animejs';
import { sendMessage } from "../messaging.js";

export default async function walletCreateScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/full_page',
        template_params: {
            title: 'Create Wallet'
        },
        login: false,
        header: false
        // smooth_load: true
    })
    await screen.init()

    await screen.set('.content', 'wallet/create')

    let mnemonic = params?.mnemonic
    if(!mnemonic) {
        mnemonic = await sendMessage('new_wallet')
        updateCurrentParams({
            mnemonic
        })
    }

    for(const value of mnemonic) {
        const index = mnemonic.indexOf(value);
        await screen.append('#mnemonics', 'wallet/partial/word', {
            value, index: index+1
        })
    }

    anime({
        targets: '.icon-alert',
        scale: [1, 0.8, 1.2, 1],
        easing: 'easeInOutSine',
        duration: 1600,
        delay: 200,
    });

    anime({
        targets: '#mnemonics',
        opacity: [0, 1],
        duration: 0
    });

    anime({
        targets: '#mnemonics .word',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 150,
        delay: function(el, i) { return i * 50 },
    });

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#import_wallet',
            listener: () => goToScreen('walletScreen')
        },
        {
            element: '#agree_new_key',
            type: 'change',
            listener: () => agreeNewKey()
        },
        {
            element: '#continue_new_key',
            listener: () => goToScreen('walletConfirmScreen', {
                mnemonic
            })
        },
        {
            element: '#copy_seed',
            listener: () => copySeed(mnemonic)
        }
    ])
}

function agreeNewKey() {
    let agree = document.querySelector("#agree_new_key");
    let continue_new_key = document.querySelector("#continue_new_key");

    if(agree.checked === true) {
        continue_new_key.classList.remove('disabled')
        continue_new_key.classList.add('btn-primary')
    } else {
        continue_new_key.classList.add('disabled')
        continue_new_key.classList.remove('btn-primary')
    }
}

async function copySeed(mnemonic_array) {
    await navigator.clipboard.writeText(mnemonic_array.join(' '));

    await showNotification('Secret phrase copied to your clipboard! Keep it safe!', 'info')
}