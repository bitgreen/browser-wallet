import Screen, { goToScreen } from './index.js'
import { SettingsStore } from "@bitgreen/browser-wallet-core";

import anime from 'animejs';

export default async function welcomeScreen() {
    const settings = new SettingsStore()

    const screen = new Screen({
        template_name: 'welcome',
        login: false,
        auto_load: false
    })
    await screen.init()

    anime({
        targets: '#init_screen',
        opacity: 0,
        duration: 1000,
        delay: 2000
    });
    anime({
        targets: '#init_screen .init-logo',
        delay: 700,
        easing: 'linear',
        keyframes: [
            { translateY: -100, scale: 0.32, duration: 800 },
            { translateX: -290, duration: 500 },
        ]
    });

    await screen.set()

    anime({
        targets: '.bitgreen-svg path',
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutSine',
        "fill-opacity": "1",
        "stroke-width": "0",
        duration: 500,
        // duration: function(el, i) { return 1000 - i * 100 },
        delay: function(el, i) {
            return i*200 + 1600
        },
    });
    anime({
        targets: '.separator',
        easing: 'linear',
        duration: 500,
        delay: 3000,
        translateY: [-20, 0],
        opacity: [0, 1]
    });
    anime({
        targets: '.browser-wallet',
        easing: 'linear',
        duration: 300,
        delay: 3200,
        translateX: [-30, 0],
        opacity: [0, 1]
    });

    anime({
        targets: '#get_started',
        easing: 'linear',
        duration: 400,
        delay: 3400,
        translateY: [40, 0],
        opacity: [0, 1]
    });

    setTimeout(function() {
        document.querySelector("#init_screen").classList.add("inactive")
    }, 3000)

    screen.setListeners([
        {
            element: '#get_started',
            listener: () => {
                settings.set('skip_intro', true)
                goToScreen('walletScreen')
            }
        }
    ])
}