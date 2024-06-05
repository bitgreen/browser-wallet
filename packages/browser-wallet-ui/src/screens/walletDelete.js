import Screen, {goBackScreen, goToScreen, reloadScreen} from './index.js'
import { randomString, sleep } from '@bitgreen/browser-wallet-utils'
import { sendMessage } from "../messaging.js";
import { showNotification } from "../notifications.js";
import DOMPurify from 'dompurify';
import anime from 'animejs';

export default async function walletDeleteScreen(params) {
  const screen = new Screen({
    template_name: 'layouts/full_page',
    template_params: {
      title: 'Delete Wallet'
    },
    header: false
  })
  await screen.init()

  await screen.set('.content', 'wallet/delete')

  await screen.append('.content', 'global/loading', {
    title: 'Deleting all wallet data',
    desc: 'Hold tight while we finish the process.',
    top: '0;',
    padding_top: '60px',
    progress: '25 75'
  });

  const input_field = document.querySelector("#root .footer #password")
  const show_password = document.querySelector("#root .footer .show-password")

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => goBackScreen()
    },
    {
      element: '#delete_wallet',
      listener: () => deleteWallet()
    },
    {
      element: '#password',
      type: 'keypress',
      listener: async(e) => {
        if(e.key === 'Enter') {
          await deleteWallet()
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

  const deleteWallet = async() => {
    showProcessing();
    await sleep(250); // give it a chance to start animating
    const password = DOMPurify.sanitize(document.querySelector('#password_input #password').value)

    const result = await sendMessage('delete_wallet', {
      password
    })

    if(result) {
      await showNotification('Wallet deleted successfully.', 'info')

      setTimeout(() => {
        window.top.location.reload()
      }, 1000)
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