import Screen, { goToScreen } from './index.js'
import { SettingsStore } from "@bitgreen/browser-wallet-core";

import anime from 'animejs';
import {isIOs} from "@bitgreen/browser-wallet-utils";

export default async function welcomeScreen() {
    const settings = new SettingsStore()

    const screen = new Screen({
        template_name: 'welcome',
        login: false,
        auto_load: false
    })
    await screen.init()

    await screen.set()

    if(isIOs()) {
        screen.hideInit()
    } else {
        anime({
            targets: '#init_screen',
            opacity: 0,
            duration: 1000,
            delay: 2000
        });
        anime({
            targets: '#init_screen .init-logo',
            delay: 600,
            easing: 'linear',
            keyframes: [
                { translateY: -36, scale: 0.323232, duration: 800 },
                { translateX: -290, duration: 600 },
            ]
        });
    }

    anime({
        targets: '.bitgreen-svg path',
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutSine',
        "fill-opacity": "1",
        "stroke-width": "0",
        duration: 400,
        delay: function(el, i) {
            if(isIOs()) {
                return i * 100
            } else {
                return i * 200 + 300
            }
        },
    });

    anime({
        targets: '.separator',
        easing: 'linear',
        duration: 500,
        delay: isIOs() ? 1000 : 3000,
        translateY: [-20, 0],
        opacity: [0, 1]
    });

    anime({
        targets: '.browser-wallet',
        easing: 'linear',
        duration: 300,
        delay: isIOs() ? 1200 : 3200,
        translateX: [-30, 0],
        opacity: [0, 1]
    });

    anime({
        targets: '#get_started',
        easing: 'linear',
        duration: 400,
        delay: isIOs() ? 1400 : 3400,
        translateY: [40, 0],
        opacity: [0, 1]
    });

    setTimeout(function() {
        document.querySelector("#init_screen").classList.add("inactive")
    }, isIOs() ? 1800 : 4000)

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