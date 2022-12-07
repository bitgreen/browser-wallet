import Screen, { goBackScreen, goToScreen } from './index.js'

import DOMPurify from 'dompurify';

export default async function walletPasswordScreen(params) {
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

    await screen.set('.content', 'wallet/password')

    screen.setListeners([
        {
            element: '#go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#password',
            type: 'input',
            listener: checkPassword
        },
        {
            element: '#password_repeat',
            type: 'input',
            listener: checkPassword
        },
        {
            element: '#wallet_name',
            type: 'input',
            listener: checkPassword
        },
        {
            element: '#set_password',
            listener: async() => {
                await goToScreen('walletFinishScreen', params)
            }
        }
    ])
}

function checkPassword() {
    let password = DOMPurify.sanitize(document.querySelector('#password').value);
    let password_repeat = DOMPurify.sanitize(document.querySelector('#password_repeat').value);
    let wallet_name = DOMPurify.sanitize(document.querySelector('#wallet_name').value);
    let success = true;

    if(password.length >= 12) {
        // has 12+ chars
        document.querySelector('#length_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.querySelector('#length_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password.match(/[a-z]/g)) {
        // has lowercase
        document.querySelector('#lowercase_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.querySelector('#lowercase_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password.match(/[A-Z]/g)) {
        // has uppercase
        document.querySelector('#uppercase_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.querySelector('#uppercase_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password.match(/[0-9]/g)) {
        // has digit
        document.querySelector('#digit_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.querySelector('#digit_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password.match(/[$&+,:;=?@#|'<>.^*()%!-]/g)) {
        // has special char
        document.querySelector('#symbol_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.querySelector('#symbol_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password === password_repeat) {
        document.querySelector('#repeat_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.querySelector('#repeat_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(wallet_name.length === 0) {
        success = false;
    }

    if(success) {
        document.querySelector("#set_password").classList.remove('disabled')
        document.querySelector("#set_password").classList.add('btn-primary')
    } else {
        document.querySelector("#set_password").classList.add('disabled')
        document.querySelector("#set_password").classList.remove('btn-primary')
    }
}