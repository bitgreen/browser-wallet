import Screen, { goBackScreen, goToScreen } from './index.js'

import anime from 'animejs';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'

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

    if(params.mnemonic) {
        for(const value of params.mnemonic) {
            const index = params.mnemonic.indexOf(value);
            await screen.append('#mnemonics', 'wallet/partial/word', {
                value, index: index+1
            })

        }
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
            element: '#go_back',
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
            listener: () => goToScreen('walletConfirmScreen', params)
        },
        {
            element: '#copy_seed',
            listener: () => copySeed(params.mnemonic)
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

let notification = false
async function copySeed(mnemonic_array) {
    await navigator.clipboard.writeText(mnemonic_array.join(' '));

    if(notification) {
        notification.hideToast()
    }
    notification = Toastify({
        text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon icon-alert"></span></div><div class="col-10">Secret phrase copied to your clipboard! Keep it safe!</div></div>',
        offset: {
            y: 40
        },
        duration: 3000,
        className: 'notification notification-info',
        close: false,
        stopOnFocus: false,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        escapeMarkup: false,
        onClick: function(){
            notification.hideToast()
        }
    }).showToast();
}