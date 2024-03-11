import Screen, { goBackScreen, goToScreen } from './index.js'
import { NetworkStore } from "@bitgreen/browser-wallet-core";
import anime from "animejs";

export default async function networkManageScreen() {
  const screen = new Screen({
    template_name: 'layouts/default_custom_header',
    header: false,
    footer: true
  })
  await screen.init()

  await screen.set('#heading', 'network/manage/heading')
  await screen.set('#bordered_content', 'network/manage/content')

  const network_store = new NetworkStore()
  const current_network = await network_store.current()
  const all_networks = await network_store.all()

  if(all_networks?.length < 1) {
    await screen.append('#root #wallet_list', 'shared/alert', {
      message: 'No custom networks added.',
      alert_type: 'alert-info'
    })
  }

  for(const n of all_networks) {
    const network_id = n?.key
    const network = n.value
    await screen.append('#root #wallet_list', 'network/manage/list_item', {
      network_id,
      network_name: network.name,
      network_url: network.url
    })
  }

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });

  screen.setListeners([
    {
      element: '#heading #new_network',
      listener: () => goToScreen('networkCreateScreen')
    },
    {
      element: '#heading #go_back',
      listener: () => goBackScreen()
    },
    {
      element: '#root #wallet_list .button-item',
      listener: (e) => {
        return goToScreen('networkCreateScreen', {
          network_id: e.target.dataset?.id
        })
      }
    }
  ])
}