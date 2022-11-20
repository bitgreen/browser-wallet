import Screen, { goToScreen } from './index.js'

import anime from 'animejs';

export default async function portfolioScreen() {
    const screen = new Screen({
        template_name: 'portfolio',
        smooth_load: true
    })
    await screen.init()

    // await screen.set('#heading', 'shared/heading', {
    //     title: 'Get Started'
    // })

    // await screen.set('#bordered_content', 'wallet_create/content')

    // screen.setListeners([
    //     {
    //         element: '#new_wallet',
    //         listener: () => goToScreen('walletCreateScreen')
    //     },
    //     {
    //         element: '#import_wallet',
    //         listener: () => goToScreen('walletCreateScreen')
    //     }
    // ])
}