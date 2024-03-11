import Screen, { copyText, expireBrowserTabRequest, goBackScreen, goToScreen, updateCurrentParams } from './index.js'
import { WalletStore } from "@bitgreen/browser-wallet-core";
import { showNotification } from "../notifications.js";
import { sendMessage } from "../messaging.js";
import anime from 'animejs';

export default async function walletCreateScreen(params) {
  let current_words = 12
  let mnemonic = params?.mnemonic

  const url_params = new URLSearchParams(window.location.search)

  if(url_params.has('popup')) {
    await sendMessage('new_wallet_screen')
    window.close()
    return
  }

  const wallet_store = new WalletStore()
  if(await wallet_store.exists()) {
    await expireBrowserTabRequest()
    return await goToScreen('dashboardScreen', {}, false, true)
  }

  const screen = new Screen({
    template_name: 'layouts/full_page',
    template_params: {
      title: 'Create Wallet',
      equal_padding: ''
    },
    login: false,
    header: false
  })
  await screen.init()

  await screen.set('.content', 'wallet/create')

  if(!mnemonic) {
    mnemonic = await regenerateWords(current_words)
  }

  const button_left = document.querySelector(".choose-words .btn.btn-left")
  const button_right = document.querySelector(".choose-words .btn.btn-right")

  if(mnemonic.length === 24) {
    current_words = 24

    window.resizeTo(400, 680) // Extend window height

    button_left.classList.remove('btn-secondary')
    button_right.classList.add('btn-secondary')
  } else {
    current_words = 12

    button_left.classList.add('btn-secondary')
    button_right.classList.remove('btn-secondary')
  }



  for(const value of mnemonic) {
    const index = mnemonic.indexOf(value);
    await screen.append('#mnemonics', 'wallet/partial/word', {
      value, index: index+1
    })
  }

  anime({
    targets: '.icon-alert',
    scale: [1, 0.8, 1.2, 1],
    easing: 'easeInOutSine',
    duration: 1600,
    delay: 200,
  });

  anime({
    targets: '#mnemonics',
    opacity: [0, 1],
    duration: 0
  });

  anime({
    targets: '#mnemonics .word',
    translateX: [-20, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 150,
    delay: function(el, i) { return i * 50 },
  });

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => goBackScreen()
    },
    {
      element: '#import_wallet',
      listener: () => goToScreen('walletScreen')
    },
    {
      element: '#agree_new_key',
      type: 'change',
      listener: () => agreeNewKey()
    },
    {
      element: '#continue_new_key',
      listener: () => goToScreen('walletConfirmScreen', {
        mnemonic
      })
    },
    {
      element: '#copy_seed',
      listener: () => copySeed(mnemonic)
    },
    {
      element: '.choose-words .btn',
      listener: async(e) => {
        const button_left = document.querySelector(".choose-words .btn.btn-left")
        const button_right = document.querySelector(".choose-words .btn.btn-right")

        const words = parseInt(e.target.dataset.words)

        if(words === current_words) return false
        current_words = words === 24 ? 24 : 12

        if(current_words === 24) {
          screen.resizeTo(400, 680) // Extend window height

          button_left.classList.remove('btn-secondary')
          button_right.classList.add('btn-secondary')
        } else {
          screen.resizeTo(400, 600) // Reset window height


          button_left.classList.add('btn-secondary')
          button_right.classList.remove('btn-secondary')
        }

        await screen.reset('#mnemonics')
        mnemonic = await regenerateWords(current_words)
        for(const value of mnemonic) {
          const index = mnemonic.indexOf(value);
          await screen.append('#mnemonics', 'wallet/partial/word', {
            value, index: index+1
          })
        }

        anime({
          targets: '#mnemonics .word',
          translateX: [-20, 0],
          opacity: [0, 1],
          easing: 'easeInOutSine',
          duration: 150,
          delay: function(el, i) { return i * 50 },
        });
      }
    }
  ])
}

function agreeNewKey() {
  let agree = document.querySelector("#agree_new_key");
  let continue_new_key = document.querySelector("#continue_new_key");

  if(agree.checked === true) {
    continue_new_key.classList.remove('disabled')
    continue_new_key.classList.add('btn-primary')
  } else {
    continue_new_key.classList.add('disabled')
    continue_new_key.classList.remove('btn-primary')
  }
}

async function regenerateWords(words) {
  const mnemonic = await sendMessage('new_wallet', {
    words: words
  })
  updateCurrentParams({
    mnemonic
  })
  return mnemonic
}

async function copySeed(mnemonic_array) {
  await copyText(mnemonic_array.join(' '));

  await showNotification('Secret phrase copied to your clipboard! Keep it safe!', 'info')
}