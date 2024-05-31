import Screen from './index.js'
import { AccountStore } from "@bitgreen/browser-wallet-core";
import { sendMessage } from "../messaging.js";
import anime from "animejs";

export default async function retiredCreditsScreen() {
  const screen = new Screen({
    template_name: 'layouts/default',
    header: true,
    footer: true
  })
  await screen.init()

  const accounts_store = new AccountStore()
  const current_account = await accounts_store.current()

  await screen.set('#heading', 'shared/heading', {
    title: 'Retired Credits'
  })

  await screen.set('#bordered_content', 'asset/retired/content')

  await screen.append('#bordered_content', 'global/loading_bbb', {
    title: 'Loading',
    top: '16px',
    padding_top: '40px',
  });

  showLoading()

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });

  const asset_transactions = await sendMessage('get_asset_transactions', {
    type: 'RETIRED',
    pageSize: 100
  })

  for(const transaction of asset_transactions) {
    if(!transaction.value) continue

    const created_at = new Date(Date.parse(transaction.value.createdAt))

    await screen.append('#bordered_content #transactions', 'asset/retired/list_item', {
      projectName: (transaction.value.info.projectName.length > 22 ? transaction.value.info.projectName.substring(0,22) + '...' : transaction.value.info.projectName),
      projectImage: transaction.value.info.projectImage,
      amount: transaction.value.amount,
      retirementDate: created_at.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    })
  }

  if(asset_transactions?.length < 1) {
    await screen.append('#bordered_content #transactions', 'shared/alert', {
      message: 'No retirements found yet.',
      alert_type: 'alert-info alert-small'
    })
  }

  // hide loading
  const loading_el = document.querySelector("#loading_content")
  setTimeout(() => {
    loading_el.classList.remove('active')
    screen.unFreezeRoot()
  }, 600)

  anime({
    targets: '#transactions .button-item',
    translateY: [20, 0],
    opacity: [0, 1],
    easing: 'linear',
    duration: 250,
    delay: function(el, i) { return (i * 200 + 400) > 1600 ? 1600 : (i * 200 + 400) },
  });

  anime({
    targets: '#transactions .button-item .details',
    opacity: [0, 1],
    // translateY: [10, 0],
    scale: [2, 1],
    easing: 'linear',
    duration: 250,
    delay: function(el, i) { return (i * 200 + 600) > 1800 ? 1800 : (i * 200 + 600) },
  });

  screen.setListeners([
    {
      element: '#root #transactions .button-item',
      listener: () => {}
    }
  ])

  function showLoading() {
    const loading_el = document.querySelector("#loading_content")

    loading_el.classList.add('active')

    screen.freezeRoot()
  }

  const bordered_content_el = document.querySelector("#bordered_content")
  bordered_content_el.classList.add('padding-bottom')

}