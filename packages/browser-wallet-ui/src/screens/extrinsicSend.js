import Screen, { expireBrowserTabRequest, goBackScreen, goToScreen, scrollToBottom } from './index.js'
import { sendMessage } from "../messaging.js";
import { AccountStore, checkIfAppIsKnown, NetworkStore, WalletStore, CacheStore } from "@bitgreen/browser-wallet-core";

import DOMPurify from "dompurify";
import { showNotification } from "../notifications.js";
import anime from "animejs";

export default async function extrinsicSendScreen(params) {
  const wallet_store = new WalletStore()
  if(!await wallet_store.exists()) {
    await showNotification('You need a wallet to perform this action. Please create or import one.', 'alert', 3200)
    await expireBrowserTabRequest()
    return await goToScreen('walletScreen', {}, false, true)
  }

  let win_height = 600
  if(params?.message_id && params?.tab_id) {
    win_height = 700
  }

  const screen = new Screen({
    template_name: 'layouts/default',
    login: false,
    header: true,
    footer: false,
    tab_id: params?.tab_id,
    message_id: params?.message_id,
    win_height: win_height
  })
  await screen.init()

  const domain = params?.domain
  const pallet = params?.pallet
  const call = params?.call?.replaceAll('_', '')

  const accounts_store = new AccountStore()
  const networks_store = new NetworkStore()
  const cache_store = new CacheStore(await networks_store.current())
  const current_account = await accounts_store.current()

  await screen.set('#heading', 'shared/heading', {
    title: 'Confirm Transaction'
  })

  await screen.set('#bordered_content', 'extrinsic/send', {
    domain
  })

  let extrinsics = []
  if(pallet === 'utility' && (call === 'batch' || call === 'batchAll' || call === 'forceBatch')) {
    let index = 0
    for(const extrinsic of JSON.parse(params.call_parameters)) {
      extrinsics.push({
        index,
        pallet: extrinsic[0],
        call: extrinsic[1],
        call_parameters: extrinsic[2],
      })

      index++
    }
  } else {
    extrinsics.push({
      index: 0,
      pallet: pallet,
      call: call,
      call_parameters: params?.call_parameters ? JSON.parse(params.call_parameters) : [],
    })
  }

  // Show all extrinsics
  for(const extrinsic of extrinsics) {
    const docs = await cache_store.get(`docs_${extrinsic.pallet}:${extrinsic.call}`)

    // show request params
    let raw_request = {}
    if(docs?.fields) {
      for(const [key, field] of Object.entries(docs?.fields)) {
        raw_request = {
          ...raw_request,
          [field.name]: extrinsic.call_parameters[key]
        }
      }
    }

    await screen.append('#bordered_content #transactions', 'extrinsic/list_item', {
      index: extrinsic.index,
      human_index: extrinsic.index + 1,
      is_last: extrinsics.length - 1 === extrinsic.index,
      pallet: extrinsic.pallet.length > 9 ? extrinsic.pallet.substring(0, 9) + '...' : extrinsic.pallet,
      pallet_full: extrinsic.pallet,
      call: extrinsic.call.length > 9 ? extrinsic.call.substring(0, 9) + '...' : extrinsic.call,
      call_full: extrinsic.call,
      docs: docs?.docs[0] || '',
      raw_request: JSON.stringify(raw_request).length >= 150 ? JSON.stringify(raw_request).substring(0, 150) + '...' : JSON.stringify(raw_request)
    })
  }

  if(params?.message_id && params?.tab_id) {
    await screen.set('#app_info', 'app_info', {
      domain,
      title: params?.title?.substring(0, 60)
    });

    const app = checkIfAppIsKnown(domain)
    if(app) {
      screen.setParam('#app_info h3', app.title)
      document.querySelector('#app_info').classList.add('known')
    }
  } else {
    document.querySelector('#app_info').classList.remove('d-flex')
    document.querySelector('#app_info').classList.add('d-none')

    // expand transactions
    document.querySelector('#transactions').style.height = 'calc(100% - 100px)'
  }

  await screen.append('#bordered_content', 'global/loading', {
    title: 'Processing Transaction',
    desc: 'Hold tight while we get confirmation of this transaction.',
    top: '5px',
    padding_top: '60px',
    progress: '0 100'
  });

  const transaction_items = document.querySelector("#bordered_content #transactions")
  document.querySelectorAll("#bordered_content .transaction-item").forEach(t => {
    t.addEventListener("click", function(e) {
      if(t.classList.contains('active')) {
        t.classList.remove('active')
      } else {
        document.querySelectorAll('#bordered_content .transaction-item').forEach(t => {
          t.classList.remove('active')
        })

        t.classList.add('active')
      }

      setTimeout(() => {
        t.scrollIntoView({ behavior: 'smooth' });
      }, 200)
    })
  })

  await screen.append('#loading_content #content .done', 'global/button', {
    id: 'show_transaction',
    title: 'Transaction Summary',
    class: 'btn-secondary-outline btn-sm btn-rounded me-1 ms-1',
    icon: 'hidden m-0'
  })

  if(params?.tab_id) {
    await screen.append('#loading_content #content .done', 'global/button', {
      id: 'close_tab',
      title: 'Close and Return',
      class: 'btn-dark btn-sm btn-rounded me-1 ms-1',
      icon: 'hidden m-0'
    });
  }

  const input_field = document.querySelector("#root .footer #password")
  const show_password = document.querySelector("#root .footer .show-password")

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });

  anime({
    targets: '#transactions .button-item',
    translateX: [-20, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 250,
    delay: function(el, i) { return (i * 150) > 1200 ? 1200 : (i * 150) },
  });

  anime({
    targets: '#bordered_content .footer',
    translateY: 0,
    duration: 1,
    delay: 200
  });

  screen.setListeners([
    {
      element: '#approve_extrinsic',
      listener: async() => {
        await approveExtrinsic()
      }
    },
    {
      element: '#password',
      type: 'keypress',
      listener: async(e) => {
        if(e.key === "Enter") {
          await approveExtrinsic()
        }
        await scrollToBottom()
      }
    },
    {
      element: '#password',
      type: 'focus',
      listener: async() => {
        await scrollToBottom()
        await scrollToBottom(200)
        await scrollToBottom(1600)
      }
    },
    {
      element: '#deny_extrinsic',
      listener: async() => {
        if(params?.message_id && params?.tab_id) {
          screen.sendMessageToTab({
            success: false,
            status: 'denied',
            error: 'User has denied this request.'
          })

          window.close()
        } else {
          await goBackScreen()
        }
      }
    },
    {
      element: '#show_transaction',
      listener: async() => {
        screen.freezeRoot()

        hideProcessing(400)
      }
    },
    {
      element: '#close_tab',
      listener: async() => {
        window.close()

        return await goToScreen('dashboardScreen')
      }
    },
    {
      element: '#root .footer .show-password',
      listener: () => {
        if(input_field.type === 'password') {
          input_field.type = 'text'
          show_password.innerHTML = '<span class="icon icon-eye-blocked"></span>'
        } else {
          input_field.type = 'password'
          show_password.innerHTML = '<span class="icon icon-eye"></span>'
        }
      }
    }
  ])

  const approveExtrinsic = async() => {
    showProcessing()

    const response = await sendMessage('extrinsic', {
      password: DOMPurify.sanitize(document.querySelector('#root #password')?.value),
      account_id: current_account.id,
      pallet: pallet,
      call: call,
      call_parameters: params?.call_parameters,
      tab_id: params?.tab_id
    }, params?.message_id)

    if(response?.success) {
      // send message to tab if response is successful
      screen.sendMessageToTab({
        ...response
      })

      showProcessingDone()
    } else if(response?.status === 'failed' && response.error) {
      // send message to tab if response is unsuccessful
      screen.sendMessageToTab({
        ...response
      })

      document.querySelectorAll('#transactions .button-item').forEach(t => {
        if(response.data?.failedIndex) {
          if(parseInt(t.dataset.id) < parseInt(response.data.failedIndex)) {
            t.querySelector('.status').classList.add('success')
            t.querySelector('.status').innerHTML = '<span class="icon icon-check"></span>'
          } else if(parseInt(t.dataset.id) === parseInt(response.data.failedIndex)) {
            t.querySelector('.status').classList.add('error')
            t.querySelector('.status').innerHTML = '<span class="icon icon-close"></span>'
          } else {
            t.querySelector('.status').classList.add('pending')
            t.querySelector('.status').innerHTML = '?'
          }
        } else {
          t.querySelector('.status').classList.add('error')
          t.querySelector('.status').innerHTML = '<span class="icon icon-close"></span>'
        }

        const error_el = document.createElement('div');
        error_el.classList.add('mt-1', 'mb-2', 'px-2', 'text-gray', 'text-center');
        if(response.data?.failedIndex) {
          error_el.innerHTML = '<span class="text-bold text-danger">Transaction interrupted with error: </span><br>' + response.error;
        } else {
          error_el.innerHTML = '<span class="text-bold text-danger">Transaction failed with error: </span><br>' + response.error;
        }
        t.insertAdjacentElement('afterend', error_el)
      })

      showProcessingFail()
    } else {
      hideProcessing(0)
      await showNotification('Password is wrong!', 'error')
    }

    show_password.innerHTML = '<span class="icon icon-eye"></span>'
    input_field.type = 'password'
  }

  const showProcessing = () => {
    const loading_el = document.querySelector("#loading_content")
    const loading_circle_el = document.querySelector('#loading_content #loading_circle')

    loading_circle_el.classList.add('no-animation')

    loading_el.classList.add('active')

    startProgress()

    screen.freezeRoot()
  }

  let intervalId = null;  // Store the interval ID for clearing later

  const startProgress = async() => {
    resetProgress()
    updateProgressBar(0);

    const progress_el = document.querySelector('#loading_content #progress')
    progress_el.classList.add('show')

    const estimate_block_time = await sendMessage('estimate_block_time')

    const total_repeats = estimate_block_time * 1000 / 200

    let current = 0;
    let increment = 100 / total_repeats;

    intervalId = setInterval(() => {
      if(current > 90) {
        current += increment * 0.5
      } else if(current > 80) {
        current += increment * 0.75
      } else if(current > 70) {
        current += increment * 0.85
      } else if(current > 60) {
        current += increment * 0.95
      } else {
        current += increment
      }

      if (current < 99) {
        updateProgressBar(current);
      } else {
        clearInterval(intervalId);
      }
    }, 200);
  };

  const resetProgress = () => {
    const progress_el = document.querySelector('#loading_content #progress')
    progress_el.classList.remove('show')

    clearInterval(intervalId);
  }

  const updateProgressBar = (value) => {
    const primary_element = document.querySelector('#loading_content #primary')
    const percentage_el = document.querySelector('#loading_content #progress .percentage')

    if (value > 100) {
      value = 100;
    }

    if(value < 100) {
      percentage_el.innerHTML = value.toFixed(0)
    }

    primary_element.style.transition = `stroke-dasharray 0.4s linear, stroke-dashoffset 0.4s linear`;
    primary_element.style.strokeDasharray = `${value} ${100-value}`;
  };

  const showProcessingDone = () => {
    screen.unFreezeRoot()

    resetProgress()

    const loading_el = document.querySelector("#loading_content")
    const checkmark_el = loading_el.querySelector("#checkmark")
    const content_done_el = loading_el.querySelector("#content .done")
    const content_init_text_el = loading_el.querySelector("#content .init .text")
    const content_init_desc_el = loading_el.querySelector("#content .init .desc")
    const content_done_text_el = loading_el.querySelector("#content .done .text")
    const content_done_desc_el = loading_el.querySelector("#content .done .desc")

    updateProgressBar(100)

    // mark transaction(s) as completed
    document.querySelectorAll("#bordered_content .transaction-item").forEach(t => {
      t.querySelector('.status').classList.add('success')
      t.querySelector('.status').innerHTML = '<span class="icon icon-check"></span>'
    })

    content_done_el.classList.add('active')

    content_done_text_el.innerHTML = 'Transaction Completed'
    if(params?.tab_id) {
      content_done_desc_el.innerHTML = 'You can close this window and continue with the application that made the request.'
    } else {
      content_done_desc_el.innerHTML = 'Your transaction details are provided below.'
    }

    content_init_text_el.classList.add('d-none')
    content_init_desc_el.classList.add('d-none')

    setTimeout(() => {
      checkmark_el.classList.add('show')
    }, 200)

    setTimeout(() => {
      loading_el.classList.add('done')
    }, 600)

    prepareSummary()
  }

  const showProcessingFail = () => {
    screen.unFreezeRoot()

    resetProgress()

    const loading_el = document.querySelector("#loading_content")
    const failed_el = loading_el.querySelector("#failed")
    const content_done_el = loading_el.querySelector("#content .done")
    const content_init_text_el = loading_el.querySelector("#content .init .text")
    const content_init_desc_el = loading_el.querySelector("#content .init .desc")
    const content_done_text_el = loading_el.querySelector("#content .done .text")
    const content_done_desc_el = loading_el.querySelector("#content .done .desc")

    const primary_element = document.querySelector('#loading_content #primary')

    updateProgressBar(100)

    primary_element.style.stroke = "#CC2400";

    content_done_el.classList.add('active')

    content_done_text_el.innerHTML = 'Transaction Failed'
    content_done_desc_el.innerHTML = 'Your transaction was not successful.'

    content_init_text_el.classList.add('d-none')
    content_init_desc_el.classList.add('d-none')

    setTimeout(() => {
      failed_el.classList.add('show')
    }, 200)

    setTimeout(() => {
      loading_el.classList.add('done')
    }, 600)

    // show alert
    document.querySelector('#error_alert').classList.remove('d-none')

    prepareSummary()
  }

  const prepareSummary = () => {
    // hide app info
    document.querySelector('#app_info').classList.remove('d-flex')
    document.querySelector('#app_info').classList.add('d-none')

    // expand transactions
    document.querySelector('#transactions').style.height = 'calc(100% - 30px)'

    anime({
      targets: '#bordered_content .footer',
      translateY: 200,
      duration: 1200,
      delay: 0
    });

    // remove password
    document.querySelector('#password').value = ''

    screen.setParam('#heading h1', 'Transaction Summary')
  }

  const hideProcessing = (delay = 800) => {
    setTimeout(() => {
      const loading_el = document.querySelector("#loading_content")

      loading_el.classList.remove('active')
      screen.unFreezeRoot()

      resetProgress()
      updateProgressBar(0);
    }, delay)
  }
}