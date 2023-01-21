import Screen, { goToScreen, clearHistory, updateAccounts } from './index.js'

import anime from 'animejs';

export default async function walletFinishScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/full_page_content',
        login: false,
        header: false
    })
    await screen.init()

    await screen.set('.content', 'wallet/finish', {
        message: params?.imported ? 'imported' : 'created'
    })

    if(!params?.imported) {
        await screen.set('#create_new_account', 'global/button', {
            id: 'new_account',
            title: 'Create another account',
            class: 'btn-text btn-sm',
            icon: 'icon-plus me-2'
        })
    }

    await clearHistory()
    await updateAccounts()

    anime({
        targets: '#success_icon',
        translateY: [-50, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 600,
        delay: 400,
    });

    anime({
        targets: '#heading_text',
        translateY: [50, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 600,
        delay: 400,
    });

    anime({
        targets: '#message_text',
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 600,
        delay: 800
    });

    anime({
        targets: '#new_account',
        translateX: [-40, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 400,
        delay: 800,
    });

    anime({
        targets: '#go_to_dashboard',
        translateX: [-50, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 400,
        delay: 1000,
    });

    screen.setListeners([
        {
            element: '#go_to_dashboard',
            listener: () => goToScreen('dashboardScreen')
        },
        {
            element: '#new_account',
            listener: () => goToScreen('accountCreateScreen')
        }
    ])
}