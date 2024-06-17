import Screen, { goBackScreen } from './index.js'
import { randomString, sleep } from '@bitgreen/browser-wallet-utils'
import { sendMessage } from "../messaging.js";
import { showNotification } from "../notifications.js";
import DOMPurify from 'dompurify';
import anime from 'animejs';

export default async function walletBackupScreen(params) {
  const screen = new Screen({
    template_name: 'layouts/full_page',
    template_params: {
      title: 'Back Up Wallet'
    },
    header: false
  })
  await screen.init()

  await screen.set('.content', 'wallet/backup')

  await screen.append('.content', 'global/loading', {
    title: 'Getting Phrase Words',
    desc: 'Hold tight while we get your phrase words.',
    top: '0;',
    padding_top: '60px',
    progress: '25 75'
  });

  let copy_mnemonic = ''

  let index = 1
  for(const w of Array(12).fill()) {
    const value = randomString(Math.floor(Math.random() * 4) + 3)
    await screen.append('#backup_mnemonics', 'wallet/partial/word', {
      index: index++, value
    })
  }

  const input_field = document.querySelector("#root .footer #password")
  const show_password = document.querySelector("#root .footer .show-password")

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => goBackScreen()
    },
    {
      element: '#reveal_mnemonics',
      listener: () => revealMnemonics()
    },
    {
      element: '#copy_seed',
      listener: async() => {
        await navigator.clipboard.writeText(copy_mnemonic);

        await showNotification('Secret phrase copied to your clipboard! Keep it safe!', 'info')
      }
    },
    {
      element: '#password',
      type: 'keypress',
      listener: async(e) => {
        if(e.key === 'Enter') {
          await revealMnemonics()
        }
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

  const revealMnemonics = async() => {
    showProcessing();
    await sleep(250); // give it a chance to start animating
    const password = DOMPurify.sanitize(document.querySelector('#password_input #password').value)

    const mnemonics = await sendMessage('reveal_mnemonic', {
      password
    })

    if(mnemonics) {
      copy_mnemonic = mnemonics

      await screen.reset('#backup_mnemonics')
      let index = 1
      for(const word of mnemonics.split(' ')) {
        await screen.append('#backup_mnemonics', 'wallet/partial/word', {
          index: index++,
          value: word
        })
      }

      hideProcessing();

      document.querySelector('#backup_mnemonics').classList.remove('mnemonics-hidden')
      document.querySelector('#copy_seed').classList.remove('btn-hidden')

      anime({
        targets: '#password_input',
        duration: 300,
        translateY: [0, 60],
        opacity: [1, 0],
        easing: 'linear',
        delay: 0
      });

      anime({
        targets: '#copy_seed',
        duration: 300,
        opacity: [0, 1],
        easing: 'linear',
        delay: 1200
      });

      anime({
        targets: '#backup_mnemonics .badge .text',
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 250,
        delay: function(el, i) { return i * 50 + 1200 },
      });
    } else {
      hideProcessing();
      await showNotification('Password is wrong!', 'error')
    }

    show_password.innerHTML = '<span class="icon icon-eye"></span>'
    input_field.type = 'password'
  }

  const showProcessing = () => {
    const loading_el = document.querySelector("#loading_content")

    loading_el.classList.add('active')

    screen.freezeRoot()
  }

  const hideProcessing = () => {
    setTimeout(() => {
      const loading_el = document.querySelector("#loading_content")

      loading_el.classList.remove('active')
      screen.unFreezeRoot()
    }, 1200)
  }
}