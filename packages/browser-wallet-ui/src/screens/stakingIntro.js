import Screen, { goToScreen } from './index.js'
import { AccountStore, SettingsStore } from "@bitgreen/browser-wallet-core";
import { getTotalStakedByAddress } from "@bitgreen/browser-wallet-utils";
import { sendMessage } from "../messaging.js";
import anime from "animejs";

export default async function stakingIntroScreen(params) {
  const settings_store = new SettingsStore()

  const accounts_store = new AccountStore()
  const current_account = await accounts_store.current()

  const all_collators = await sendMessage('get_collators')
  const my_total_stake = getTotalStakedByAddress(all_collators, current_account.address)

  if(my_total_stake > 0) {
    return await goToScreen('stakingHomeScreen', params, false, true)
  }

  const screen = new Screen({
    template_name: 'layouts/full_page_secondary',
    login: true,
    header: true,
    footer: false
  })
  await screen.init()

  await screen.set('.content', 'staking/intro')

  const step_1_el = document.querySelector('#staking_intro #step_1')
  const step_2_el = document.querySelector('#staking_intro #step_2')
  const step_3_el = document.querySelector('#staking_intro #step_3')

  const dots_el = document.querySelector('#staking_intro .dots')

  screen.setListeners([
    {
      element: '#staking_intro #go_step_2',
      listener: async() => {
        step_1_el.classList.remove('step-active')
        step_2_el.classList.add('step-active')
        dots_el.querySelector('.dot-2').classList.add('dot-active')

        anime({
          targets: '#staking_intro #step_1',
          opacity: [1, 0],
          easing: 'easeInOutSine',
          duration: 200
        });

        anime({
          targets: '#staking_intro #step_2 .image',
          opacity: [0, 1],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 200
        });

        anime({
          targets: '#staking_intro #step_2 .step-number',
          opacity: [0, 1],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 200
        });

        anime({
          targets: '#staking_intro #step_2 h3',
          opacity: [0, 1],
          translateX: [-40, 0],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 300
        });

        anime({
          targets: '#staking_intro #step_2 p',
          opacity: [0, 1],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 400
        });

        anime({
          targets: '#staking_intro #step_2 .btn',
          opacity: [0, 1],
          translateY: [-20, 0],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 400
        });
      }
    },
    {
      element: '#staking_intro #go_step_3',
      listener: async() => {
        step_2_el.classList.remove('step-active')
        step_3_el.classList.add('step-active')

        dots_el.querySelector('.dot-3').classList.add('dot-active')

        anime({
          targets: '#staking_intro #step_2',
          opacity: [1, 0],
          easing: 'easeInOutSine',
          duration: 200
        });

        anime({
          targets: '#staking_intro #step_3 .image',
          opacity: [0, 1],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 200
        });

        anime({
          targets: '#staking_intro #step_3 .step-number',
          opacity: [0, 1],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 200
        });

        anime({
          targets: '#staking_intro #step_3 h3',
          opacity: [0, 1],
          translateX: [-40, 0],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 300
        });

        anime({
          targets: '#staking_intro #step_3 p',
          opacity: [0, 1],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 400
        });

        anime({
          targets: '#staking_intro #step_3 .btn',
          opacity: [0, 1],
          translateY: [-20, 0],
          easing: 'easeInOutSine',
          duration: 400,
          delay: 400
        });
      }
    },
    {
      element: '#staking_intro #go_nominating',
      listener: async() => {
        await settings_store.asyncSet('staking_intro', 'true')
        await goToScreen('stakingCollatorsScreen')
      }
    }
  ])

  anime({
    targets: '#staking_intro #step_1 .image',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 400
  });

  anime({
    targets: '#staking_intro #step_1 .step-number',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 400,
    delay: 200
  });

  anime({
    targets: '#staking_intro #step_1 h3',
    opacity: [0, 1],
    translateX: [-40, 0],
    easing: 'easeInOutSine',
    duration: 400,
    delay: 300
  });

  anime({
    targets: '#staking_intro #step_1 p',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 400,
    delay: 400
  });

  anime({
    targets: '#staking_intro #step_1 .btn',
    opacity: [0, 1],
    translateY: [-20, 0],
    easing: 'easeInOutSine',
    duration: 400,
    delay: 400
  });

  anime({
    targets: '#staking_intro .dots',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 400,
    delay: 400
  });
}