import Screen, { goToScreen } from './index.js'
import anime from 'animejs';

export default async function walletScreen() {
  const screen = new Screen({
    template_name: 'layouts/default',
    header: true,
    login: false,
    smooth_load: true,
  })
  await screen.init()

  await screen.set('#heading', 'shared/heading', {
    title: 'Get Started'
  })

  await screen.set('#bordered_content', 'wallet/index')

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });

  screen.setListeners([
    {
      element: '#new_wallet',
      listener: () => goToScreen('walletCreateScreen')
    },
    {
      element: '#import_wallet',
      listener: () => goToScreen('walletImportScreen')
    }
  ])
}