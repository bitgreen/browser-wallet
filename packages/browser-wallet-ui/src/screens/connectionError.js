import Screen, {goBackScreen, goToScreen, reloadScreen} from './index.js'
import anime from "animejs";
import {showNotification} from "../notifications.js";
import {sendMessage} from "../messaging.js";

export default async function connectionErrorScreen() {
  const screen = new Screen({
    template_name: 'layouts/full_page_secondary',
    login: false,
    header: false,
    footer: false
  })
  await screen.init()

  await screen.set('.content', 'connection_error')

  anime({
    targets: '#root .footer',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 200
  });

  screen.setListeners([
    {
      element: '#try_again',
      listener: async() => {
        document.querySelector("#bbb_loader").classList.add('active')

        screen.freezeRoot()
        anime({
          targets: '#root .footer',
          opacity: [1, 0],
          easing: 'easeInOutSine',
          duration: 200
        });

        const api_ready = await sendMessage('reconnect_api')
        setTimeout(async() => {
          screen.unFreezeRoot()

          if(api_ready) {
            await goBackScreen()
            await showNotification('Connection successfully restored!', 'info', 2000, 0)
          } else {
            document.querySelector("#bbb_loader").classList.remove('active')

            anime({
              targets: '#root .footer',
              opacity: [0, 1],
              easing: 'easeInOutSine',
              duration: 200
            });
          }
        }, 2000)
      }
    }
  ])
}