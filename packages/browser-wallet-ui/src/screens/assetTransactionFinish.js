import Screen, { clearHistory, goToScreen } from './index.js'

import anime from "animejs";

export default async function assetTransactionFinishScreen(params) {
  const screen = new Screen({
    template_name: 'layouts/full_page_content',
    login: false,
    header: false,
    footer: false
  })
  await screen.init()

  const account_name = params?.account_name
  const account_address = params?.account_address

  await screen.set('.content', 'asset/finish_transaction', {
    account_name: (account_name.length > 14 ? account_name.substring(0,14)+'...' : account_name),
    account_address: account_address,
    recipient_address: params?.recipient
  })

  anime({
    targets: '#success_icon',
    translateY: [-50, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 600,
    delay: 200,
  });

  anime({
    targets: '#heading_text',
    translateY: [50, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 600,
    delay: 200,
  });

  anime({
    targets: '#message_text',
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 800,
    delay: 400
  });

  anime({
    targets: '#transaction_info',
    scale: [0.5, 1],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 600,
    delay: 800,
  });

  anime({
    targets: '#another_transaction',
    translateX: [-40, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 600,
    delay: 800,
  });

  anime({
    targets: '#go_to_dashboard',
    translateX: [30, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 600,
    delay: 1200,
  });

  screen.setListeners([
    {
      element: '#root #another_transaction',
      listener: async() => {
        await clearHistory()
        await goToScreen('assetSendScreen')
      }
    },
    {
      element: '#root #go_to_dashboard',
      listener: async() => {
        if(params?.from_tab) {
          window.close()
        }
        await goToScreen('dashboardScreen')
      }
    }
  ])
}