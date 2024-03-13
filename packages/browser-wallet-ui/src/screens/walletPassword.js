import Screen, {goBackScreen, goToScreen, scrollContentToBottom, updateAccounts} from './index.js'
import { sendMessage } from "../messaging.js";
import { showNotification } from "../notifications.js";
import { isIOs } from "@bitgreen/browser-wallet-utils";
import anime from "animejs";
import DOMPurify from 'dompurify';

export default async function walletPasswordScreen(params) {
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

  await screen.set('.content', 'wallet/password')

  await screen.append('#root', 'global/loading', {
    title: 'Wallet Setup in Progress',
    desc: 'Hold on tight as we prepare your wallet for use. Please be patient.',
    top: '0',
    padding_top: '80px',
    checkmark_top: '128px'
  });

  if(isIOs()) {
    await screen.moveFooterOnTop()
  }

  if(params?.imported) {
    // TODO: do not show for now
    await screen.append('#loading_content #content .done', 'global/button', {
      id: 'new_account',
      title: 'Import another wallet',
      class: 'btn-white btn-sm w-75 mt-2 d-none transparent-element',
      icon: 'icon-import me-2'
    })
  } else {
    await screen.append('#loading_content #content .done', 'global/button', {
      id: 'new_account',
      title: 'Create another account',
      class: 'btn-white btn-sm w-75 mt-2 transparent-element',
      icon: 'icon-plus me-2'
    })
  }

  await screen.append('#loading_content #content .done', 'global/button_right_icon', {
    id: 'go_to_dashboard',
    title: 'View Portfolio',
    class: 'btn-primary btn-rounded btn-sm w-75 mt-2 transparent-element',
    icon: 'icon-right-arrow me-2'
  })

  const input_field_password = document.querySelector("#root #password")
  const show_password_password = document.querySelector("#root .show-password-password")
  const input_field_password_repeat = document.querySelector("#root #password_repeat")
  const show_password_password_repeat = document.querySelector("#root .show-password-repeat")

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => goBackScreen()
    },
    {
      element: '#password',
      type: 'input',
      listener: checkPassword
    },
    {
      element: '#password_repeat',
      type: 'input',
      listener: checkPassword
    },
    {
      element: '#wallet_name',
      type: 'input',
      listener: checkPassword
    },
    {
      element: 'input',
      type: 'focus',
      listener: (e) => {
        if(isIOs() && e.target.id !== 'password') scrollContentToBottom()
      }
    },
    {
      element: '#set_password',
      listener: async() => {
        showProcessing()

        const result = await sendMessage('save_wallet', {
          mnemonic: params.mnemonic,
          password: DOMPurify.sanitize(document.querySelector('#root #password')?.value),
          name: DOMPurify.sanitize(document.querySelector('#root #wallet_name')?.value)
        })

        if(result) {
          setTimeout(() => {
            showProcessingDone()
          }, 10000)
        } else {
          await showNotification('Something went wrong. Please try again or contact us.', 'error', 2800, 0)
        }

        show_password_password.innerHTML = '<span class="icon icon-eye"></span>'
        input_field_password.type = 'password'
        show_password_password_repeat.innerHTML = '<span class="icon icon-eye"></span>'
        input_field_password_repeat.type = 'password'
      }
    },
    {
      element: '#go_to_dashboard',
      listener: () => goToScreen('dashboardScreen', {}, false, true)
    },
    {
      element: '#new_account',
      listener: () => goToScreen('accountCreateScreen')
    },
    {
      element: '#root .show-password-password',
      listener: () => {
        if(input_field_password.type === 'password') {
          input_field_password.type = 'text'
          show_password_password.innerHTML = '<span class="icon icon-eye-blocked"></span>'
        } else {
          input_field_password.type = 'password'
          show_password_password.innerHTML = '<span class="icon icon-eye"></span>'
        }
      }
    },
    {
      element: '#root .show-password-repeat',
      listener: () => {
        if(input_field_password_repeat.type === 'password') {
          input_field_password_repeat.type = 'text'
          show_password_password_repeat.innerHTML = '<span class="icon icon-eye-blocked"></span>'
        } else {
          input_field_password_repeat.type = 'password'
          show_password_password_repeat.innerHTML = '<span class="icon icon-eye"></span>'
        }
      }
    }
  ])

  const showProcessing = () => {
    const loading_el = document.querySelector("#loading_content")

    loading_el.classList.add('active')
    loading_el.classList.add('no-border-radius')

    screen.freezeRoot()
  }

  const showProcessingDone = () => {
    screen.unFreezeRoot()

    const loading_el = document.querySelector("#loading_content")
    const checkmark_el = loading_el.querySelector("#checkmark")
    const content_done_el = loading_el.querySelector("#content .done")
    const content_init_text_el = loading_el.querySelector("#content .init .text")
    const content_init_desc_el = loading_el.querySelector("#content .init .desc")
    const content_done_text_el = loading_el.querySelector("#content .done .text")
    const content_done_desc_el = loading_el.querySelector("#content .done .desc")

    const primary_element = document.querySelector('#loading_content #primary')

    primary_element.style.transition = "stroke-dasharray 0.4s ease-out, stroke-dashoffset 0.4s ease-out, stroke 0.4s ease-out";
    primary_element.style.strokeDasharray = "100 0";
    primary_element.style.strokeDashoffset = "0";

    setTimeout(async() => {
      loading_el.classList.add('dark')

      content_done_el.classList.add('active')

      if(params?.imported) {
        content_done_text_el.innerHTML = 'Successfully imported wallet'
      } else {
        content_done_text_el.innerHTML = 'Successfully created wallet'
      }

      content_done_desc_el.innerHTML = 'Congratulations, your wallet is ready to use.'

      content_init_text_el.classList.add('d-none')
      content_init_desc_el.classList.add('d-none')

      anime({
        targets: '#loading_content #content .done .btn',
        translateY: [-30, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: function(el, i) {
          return 400
        },
        delay: function(el, i) {
          return i*300 + 100
        },
      });
    }, 200)

    setTimeout(() => {
      checkmark_el.classList.add('show')
    }, 200)

    setTimeout(() => {
      loading_el.classList.add('done')
    }, 600)

    updateAccounts()
  }
}

function checkPassword() {
  const password_el = document.querySelector('#root #password')
  const password_repeat_el = document.querySelector('#root #password_repeat')
  const wallet_name_el = document.querySelector('#root #wallet_name')

  let password = DOMPurify.sanitize(password_el?.value);
  let password_repeat = DOMPurify.sanitize(password_repeat_el?.value);
  let wallet_name = DOMPurify.sanitize(wallet_name_el?.value);
  let success = true;

  if(!password_el) {
    return false
  }

  if(password.length >= 12) {
    // has 12+ chars
    document.querySelector('#length_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
  } else {
    document.querySelector('#length_icon').innerHTML = '<span class="icon icon-close"></span>'
    success = false;
  }

  if(password.match(/[a-z]/g)) {
    // has lowercase
    document.querySelector('#lowercase_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
  } else {
    document.querySelector('#lowercase_icon').innerHTML = '<span class="icon icon-close"></span>'
    success = false;
  }

  if(password.match(/[A-Z]/g)) {
    // has uppercase
    document.querySelector('#uppercase_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
  } else {
    document.querySelector('#uppercase_icon').innerHTML = '<span class="icon icon-close"></span>'
    success = false;
  }

  if(password.match(/[0-9]/g)) {
    // has digit
    document.querySelector('#digit_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
  } else {
    document.querySelector('#digit_icon').innerHTML = '<span class="icon icon-close"></span>'
    success = false;
  }

  if(password.match(/[$&+,:;=?@#|'<>.^*()%!-]/g)) {
    // has special char
    document.querySelector('#symbol_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
  } else {
    document.querySelector('#symbol_icon').innerHTML = '<span class="icon icon-close"></span>'
    success = false;
  }

  if(password === password_repeat) {
    document.querySelector('#repeat_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
  } else {
    document.querySelector('#repeat_icon').innerHTML = '<span class="icon icon-close"></span>'
    success = false;
  }

  if(wallet_name.length === 0) {
    success = false;
  }

  if(success) {
    document.querySelector("#set_password").classList.remove('disabled')
    document.querySelector("#set_password").classList.add('btn-primary')
  } else {
    document.querySelector("#set_password").classList.add('disabled')
    document.querySelector("#set_password").classList.remove('btn-primary')
  }
}