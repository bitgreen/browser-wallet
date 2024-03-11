import { updateElement  } from './screens.js'
import {
  goToScreen,
  doLogin,
  hideLogin,
  copyText,
  updateAccounts,
  showLogin,
  currentScreen,
  expireBrowserTabRequest,
  reloadScreen,
  scrollToBottom,
  disableFooter,
  enableFooter,
  freezeRoot,
  unFreezeRoot,
  showInit,
  hideInit
} from './screens/index.js'
import { sendMessage } from "./messaging.js";
import { hideNotification, showNotification } from "./notifications.js";

import DOMPurify from 'dompurify';
import * as jdenticon from 'jdenticon'
import { Tooltip } from 'bootstrap'

/* import stores */
import { databaseService } from "@bitgreen/browser-wallet-core";

/* import styles  */
import './scss/styles.scss'

/* import utilities */
import { formatAddress, isIOs, isStandaloneApp } from "@bitgreen/browser-wallet-utils";

class userInterface {
  constructor() {
    this.db = new databaseService()
  }

  initUi = async() => {
    await this.db.ensureInit()

    await updateElement('body', 'init', {}, false)

    this.current_account = await this.db.stores.accounts.current()

    await this.initHeader()
    await this.initFooter()
    await this.initLogin()
    await this.initCustomActions()
  }

  initHeader = async() => {
    await updateElement('#header', 'shared/header', {
      account_jdenticon: jdenticon.toSvg(this.current_account.address,56),
      account_address: formatAddress(this.current_account?.address, 8, 8),
      full_account_address: this.current_account?.address,
      account_name: (this.current_account?.name && this.current_account?.name?.length) > 14 ? this.current_account?.name?.substring(0,14)+'...' : this.current_account?.name
    }, false)

    await this.initAccounts()

    let accounts_modal_el = document.querySelector("#accounts_modal");
    document.querySelector("#header #go_settings").addEventListener("click", () => goToScreen('settingsScreen'))
    document.querySelector("#header #top_logo").addEventListener("click", () => goToScreen('dashboardScreen'))
    document.querySelector("#header #current_wallet").addEventListener("click", (e) => {
      if(document.querySelector("#header #current_wallet").classList.contains('active')) {
        accounts_modal_el.classList.remove('fade')
        accounts_modal_el.classList.remove('show')
      } else {
        accounts_modal_el.classList.add('fade')
        accounts_modal_el.classList.add('show')
      }
    })
    document.querySelector("#accounts_modal #hide_accounts_modal").addEventListener("click", (e) => {
      accounts_modal_el.classList.remove('fade')
      accounts_modal_el.classList.remove('show')
    })
    document.querySelector("#header #go_copy").addEventListener("click", async(e) => {
      await this.copyCurrentAddress(e.target.dataset.address)
    });
    document.querySelector("#accounts_modal #copy_address").addEventListener("click", async(e) => {
      await this.copyCurrentAddress(e.target.dataset.address)
    });
    document.querySelector("#accounts_modal #lock_wallet").addEventListener("click", async(e) => {
      return await this.lockWallet()
    })
    document.querySelector("#accounts_modal #manage_accounts").addEventListener("click", async() => {
      accounts_modal_el.classList.remove('fade')
      accounts_modal_el.classList.remove('show')

      return await goToScreen('accountManageScreen')
    })
  }

  lockWallet = async() => {
    let accounts_modal_el = document.querySelector("#accounts_modal");

    accounts_modal_el.classList.remove('fade')
    accounts_modal_el.classList.remove('show')

    await showLogin(false, true)
    await sendMessage('lock_wallet')
    setTimeout(async() => {
      return await goToScreen('dashboardScreen')
    }, 1200) // redirect to dashboard
  }

  copyCurrentAddress = async(address) =>  {
    await copyText(address)
    await showNotification('Account address copied to clipboard.', 'info')
  }

  initAccounts = async() => {
    const current_account = await this.db.stores.accounts.current()
    const kyc_level = await this.db.stores.cache.get('kyc_' + current_account.address)

    await updateElement('#accounts_modal', 'accounts/modal', {
      current_account_name: (current_account?.name && current_account?.name?.length > 14) ? current_account?.name?.substring(0,14)+'...' : current_account?.name,
      current_account_address: formatAddress(current_account?.address, 16, 8),
      full_account_address: current_account?.address,
      is_primary: current_account?.id === 'main' ? '' : 'hidden',
      is_kyc_verified: kyc_level ? `verified verified-${kyc_level}` : 'unverified',
    }, false)

    await updateAccounts(current_account?.id)
  }

  initFooter = async() => {
    await updateElement('#main_footer', 'shared/footer', {}, false)

    const dashboardTooltip = new Tooltip('#main_footer #go_dashboardScreen', {
      html: true,
      offset: [0, -8],
      placement: 'top',
      container: 'body',
      popperConfig: (config) => {
        const flip = config.modifiers.find(({ name }) => name === 'flip')

        flip.options = {
          ...flip.options,
          boundary: document.querySelector('#root'),
        }

        return config
      },
      template: '<div class="tooltip tooltip-footer" role="tooltip"><div class="tooltip-arrow d-none"></div><div class="tooltip-inner"></div></div>'
    })

    const assetSendTooltip = new Tooltip('#main_footer #go_assetSendScreen', {
      html: true,
      offset: [0, -8],
      placement: 'top',
      container: 'body',
      popperConfig: (config) => {
        const flip = config.modifiers.find(({ name }) => name === 'flip')

        flip.options = {
          ...flip.options,
          boundary: document.querySelector('#root'),
        }

        return config
      },
      template: '<div class="tooltip tooltip-footer" role="tooltip"><div class="tooltip-arrow d-none"></div><div class="tooltip-inner"></div></div>'
    })

    const transactionHistoryTooltip = new Tooltip('#main_footer #go_transactionHistoryScreen', {
      html: true,
      offset: [0, -8],
      placement: 'top',
      container: 'body',
      popperConfig: (config) => {
        const flip = config.modifiers.find(({ name }) => name === 'flip')

        flip.options = {
          ...flip.options,
          boundary: document.querySelector('#root'),
        }

        return config
      },
      template: '<div class="tooltip tooltip-footer" role="tooltip"><div class="tooltip-arrow d-none"></div><div class="tooltip-inner"></div></div>'
    })

    const stakeHomeTooltip = new Tooltip('#main_footer #go_stakingHomeScreen', {
      html: true,
      offset: [0, -8],
      placement: 'top',
      container: 'body',
      popperConfig: (config) => {
        const flip = config.modifiers.find(({ name }) => name === 'flip')

        flip.options = {
          ...flip.options,
          boundary: document.querySelector('#root'),
        }

        return config
      },
      template: '<div class="tooltip tooltip-footer" role="tooltip"><div class="tooltip-arrow d-none"></div><div class="tooltip-inner"></div></div>'
    })

    document.querySelector("#main_footer #go_dashboardScreen").addEventListener("click", async() => {
      setTimeout(() => {
        dashboardTooltip.hide()
      }, 600)

      await goToScreen('dashboardScreen')
    })
    document.querySelector("#main_footer #go_assetSendScreen").addEventListener("click", async() => {
      setTimeout(() => {
        assetSendTooltip.hide()
      }, 800)

      await expireBrowserTabRequest()
      await goToScreen('assetSendScreen')
    })
    document.querySelector("#main_footer #go_transactionHistoryScreen").addEventListener("click", async() => {
      setTimeout(() => {
        transactionHistoryTooltip.hide()
      }, 800)

      await expireBrowserTabRequest()
      await goToScreen('transactionHistoryScreen')
    })
    document.querySelector("#main_footer #go_stakingHomeScreen").addEventListener("click", async() => {
      setTimeout(() => {
        stakeHomeTooltip.hide()
      }, 800)

      await expireBrowserTabRequest()
      await goToScreen('stakingHomeScreen')
    })
  }

  initLogin = async() => {
    await updateElement('#login_screen', 'login', {
      wallet_title: isStandaloneApp() ? 'WALLET APP' : 'BROWSER WALLET'
    }, false)

    const input_form = document.querySelector("#login_screen #input_form")
    const input_field = input_form.querySelector("#password")
    const show_password = input_form.querySelector(".show-password")

    show_password.addEventListener("click", () => {
      if(input_field.type === 'password') {
        input_field.type = 'text'
        show_password.innerHTML = '<span class="icon icon-eye-blocked"></span>'
      } else {
        input_field.type = 'password'
        show_password.innerHTML = '<span class="icon icon-eye"></span>'
      }
    })

    document.querySelector("#login_screen #do_login").addEventListener("click", () => this.doLoginEvent())
    document.querySelector("#login_screen #password").addEventListener("keypress", async(e) => {
      if (e.key === "Enter") {
        return await this.doLoginEvent();
      }
      await scrollToBottom()
    })

    document.querySelector("#login_screen #password").addEventListener("focus", async() => {
      document.querySelector("#login_screen").classList.add('focused')

      await scrollToBottom()
      await scrollToBottom(200)
      await scrollToBottom(1600)
    })

    document.querySelector("#login_screen #password").addEventListener("blur", async() => {
      document.querySelector("#login_screen").classList.remove('focused')
    })

    window.addEventListener("click", async() => {
      const login_screen = document.querySelector("#login_screen")
      const input_field = input_form.querySelector("#password")

      if(login_screen.classList.contains('inactive') || isStandaloneApp()) return

      input_field.focus()
    })
  }

  doLoginEvent = async() => {
    freezeRoot()

    const status_message = document.querySelector("#login_screen #status_message")
    const input_form = document.querySelector("#login_screen #input_form")
    const input_field = input_form.querySelector("#password")
    const show_password = input_form.querySelector(".show-password")

    const current_screen = currentScreen()
    const password = DOMPurify.sanitize(document.querySelector("#login_screen #password").value);

    status_message.classList.add('active')
    input_form.classList.add('inactive')

    const result = await doLogin(password)

    if(result) {
      hideNotification()
      await hideLogin()
      if(current_screen.name === 'dashboardScreen') await reloadScreen()
    } else {
      await showNotification('Password is wrong!', 'error', 1800, isStandaloneApp() ? 60 : 0)
      input_form.classList.remove('inactive')
    }

    setTimeout(() => {
      input_form.classList.remove('inactive')
    }, 1000)

    // reset to init screen
    show_password.innerHTML = '<span class="icon icon-eye"></span>'
    input_field.type = 'password'
    status_message.classList.remove('active')
    unFreezeRoot()
  }

  goToScreen = async(name, params = {}, force = false) => {
    return goToScreen(name, params, true, force)
  }

  initCustomActions = async() => {
    if(isIOs() || isStandaloneApp()) {
      const url_params = new URLSearchParams(window.location.search)
      if(url_params.has('popup')) {
        document.querySelector("#login_screen").classList.add('mini')

        await disableFooter()
      }

      this.disableDoubleClickZoom()
      await this.handleFooterVisibility()
    }
  }

  // Disable double click event on iOS
  disableDoubleClickZoom = () => {
    let lastTouchEnd = 0
    const delay = 400

    document.addEventListener('touchend', function(event) {
      var now = (new Date()).getTime();
      if (now - lastTouchEnd <= delay) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  limitScroll = () => {
    let ticking = false
    window.addEventListener('scroll', async() => {
      if(!ticking) {
        window.requestAnimationFrame(async() => {
          const bodyElement = document.getElementsByTagName('body')[0]
          const bodyElementOffset = bodyElement.offsetHeight;
          const innerHeight = window.innerHeight

          // Get the current scroll position
          const scrollPosition = window.scrollY;

          if((scrollPosition + innerHeight > bodyElementOffset)) {
            await scrollToBottom()
          }

          ticking = false;
        });

        ticking = true;
      }
    });
  }

  handleFooterVisibility = async() => {
    let ticking = false
    window.addEventListener('resize', () => {
      if(!ticking) {
        window.requestAnimationFrame(async() => {
          const htmlElement = document.getElementsByTagName('html')[0]
          const htmlElementOffset = htmlElement.offsetHeight;

          if(htmlElementOffset < 400 || !(await this.db.stores.wallets.exists())) {
            await disableFooter()
          } else {
            await enableFooter()
          }

          ticking = false;
        });

        ticking = true;
      }
    })
  }

  enableFooter = () => {
    this.db.stores.wallets.exists().then(r => {
      if(r) enableFooter()
    })
  }

  disableFooter = () => {
    return disableFooter()
  }

  showInit = (locked = false) => {
    return showInit(locked)
  }

  hideInit = (unlocked = false) => {
    return hideInit(unlocked)
  }

  fastCheckLogin = async() => {
    const logged_in = await sendMessage('fast_check_login')

    return !!logged_in
  }

  showLogin = async(instant = false, force = false) => {
    await showLogin(instant, force)

    setTimeout(async() => {
      return await goToScreen('dashboardScreen')
    }, 1200) // redirect to dashboard
  }
}

export default userInterface

export {
  showNotification
}