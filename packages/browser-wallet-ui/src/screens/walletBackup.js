import Screen, { goBackScreen, goToScreen } from './index.js'
import { randomString } from '@bitgreen/browser-wallet-utils'
import { sendMessage } from "../messaging.js";

import DOMPurify from 'dompurify';
import anime from 'animejs';
import { showNotification } from "../notifications.js";

export default async function walletBackupScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/full_page',
        template_params: {
            title: 'Back Up Wallet'
        },
        header: false
        // smooth_load: true
    })
    await screen.init()

    await screen.set('.content', 'wallet/backup')

    let copy_mnemonic = ''

    let index = 1
    for(const w of Array(24).fill()) {
        const value = randomString(Math.floor(Math.random() * 4) + 3)
        await screen.append('#backup_mnemonics', 'wallet/partial/word', {
            index: index++, value
        })
    }

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#reveal_mnemonics',
            listener: () => revealMnemonics()
        },
        {
            element: '#copy_seed',
            listener: async() => {
                await navigator.clipboard.writeText(copy_mnemonic);

                await showNotification('Secret phrase copied to your clipboard! Keep it safe!', 'info')
            }
        },
        {
            element: '#password',
            type: 'keypress',
            listener: async(e) => {
                if(e.key === 'Enter') {
                    await revealMnemonics()
                }
            }
        },
    ])

    const revealMnemonics = async() => {
        const password = DOMPurify.sanitize(document.querySelector('#password_input #password').value)

        const mnemonics = await sendMessage('reveal_mnemonic', {
            password
        })

        if(mnemonics) {
            copy_mnemonic = mnemonics

            await screen.reset('#backup_mnemonics')
            let index = 1
            for(const word of mnemonics.split(' ')) {
                await screen.append('#backup_mnemonics', 'wallet/partial/word', {
                    index: index++,
                    value: word
                })
            }

            document.querySelector('#backup_mnemonics').classList.remove('mnemonics-hidden')
            document.querySelector('#copy_seed').classList.remove('btn-hidden')

            anime({
                targets: '#password_input',
                duration: 300,
                translateY: [0, 60],
                opacity: [1, 0],
                easing: 'linear',
                delay: 0
            });

            anime({
                targets: '#copy_seed',
                duration: 300,
                opacity: [0, 1],
                easing: 'linear',
                delay: 1200
            });

            anime({
                targets: '#backup_mnemonics .badge .text',
                opacity: [0, 1],
                easing: 'easeInOutSine',
                duration: 250,
                delay: function(el, i) { return i * 50 + 1200 },
            });
        } else {
            await showNotification('Password is wrong!', 'error')
        }
    }
}