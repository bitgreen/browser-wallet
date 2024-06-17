import Screen, { goBackScreen, goToScreen, updateAccounts } from './index.js'
import { sendMessage } from "../messaging.js";
import { showNotification } from "../notifications.js";

import DOMPurify from 'dompurify';

export default async function accountCreateScreen(params = {}) {
  const screen = new Screen({
    template_name: 'layouts/full_page',
    template_params: {
      title: 'New Account'
    },
    header: false,
    footer: false
  })
  await screen.init()

  await screen.set('.content', 'accounts/create')

  await screen.moveFooterOnTop()

  const input_field = document.querySelector("#root #password")
  const show_password = document.querySelector("#root .show-password")

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => {
        if(params?.no_back) {
          goToScreen('dashboardScreen')
        } else {
          goBackScreen()
        }
      }
    },
    {
      element: '#root #derivation_path_check',
      type: 'change',
      listener: () => {
        const derivation_path_wrapper = document.querySelector("#root #derivation_path_wrapper")
        const derivation_path_check = document.querySelector("#root #derivation_path_check").checked

        if(derivation_path_check) {
          derivation_path_wrapper.classList.remove('hidden')
        } else {
          derivation_path_wrapper.classList.add('hidden')
        }
      }
    },
    {
      element: '#root #store_account',
      listener: () => storeAccount()
    },
    {
      element: '#root .show-password',
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

  const storeAccount = async() => {
    const password = DOMPurify.sanitize(document.querySelector("#root #password").value);
    const name = DOMPurify.sanitize(document.querySelector("#root #wallet_name").value);
    const derivation_path_check = document.querySelector("#root #derivation_path_check").checked
    let derivation_path = ''

    if(derivation_path_check) {
      derivation_path = DOMPurify.sanitize(document.querySelector("#root #derivation_path").value);
    }

    const response = await sendMessage('new_account', {
      password, name, derivation_path
    })

    if(response && !response.error) {
      await updateAccounts(response)
      await goToScreen('accountManageScreen', {}, false)
      await showNotification('New account created!', 'success')
    } else {
      await showNotification(response.error || 'Password is wrong!', 'error')
    }

    show_password.innerHTML = '<span class="icon icon-eye"></span>'
    input_field.type = 'password'
  }
}