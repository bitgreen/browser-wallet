import Screen, { goToScreen } from './index.js'

import anime from 'animejs';

export default async function walletCreateScreen() {
    const screen = new Screen({
        template_name: 'layouts/full_page',
        template_params: {
            title: 'Create Wallet'
        },
        login: false,
        // smooth_load: true
    })
    await screen.init()

    await screen.set('.content', 'wallet/create')

    anime({
        targets: '#bordered_content',
        duration: 800,
        translateY: [50, 0],
        easing: 'linear',
    });

    screen.setListeners([
        {
            element: '#new_wallet',
            listener: () => goToScreen('walletScreen')
        },
        {
            element: '#import_wallet',
            listener: () => goToScreen('walletScreen')
        }
    ])
}