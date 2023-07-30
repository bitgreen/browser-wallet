import { updateElement  } from './screens.js'
import {
    goToScreen,
    doLogin,
    hideLogin,
    copyText,
    updateAccounts,
    showLogin,
    currentScreen,
    clearHistory,
    reloadScreen,
    scrollToBottom,
    disableFooter,
    enableFooter,
    showInit,
    hideInit
} from './screens/index.js'
import { sendMessage } from "./messaging.js";
import { hideNotification, showNotification } from "./notifications.js";

import anime from 'animejs';
import DOMPurify from 'dompurify';
import * as jdenticon from 'jdenticon'
import {Tooltip} from 'bootstrap'

/* import stores */
import { AccountStore, databaseService } from "@bitgreen/browser-wallet-core";

/* import all css files */
import './styles/main.css'
import './styles/ios.css'
import './styles/icomoon.css'
import 'bootstrap/dist/css/bootstrap.css'
import {formatAddress, isIOs, isStandaloneApp} from "@bitgreen/browser-wallet-utils";

class userInterface {
    constructor() {
        this.db = new databaseService()
    }

    initUi = async() => {
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

        await updateElement('#accounts_modal', 'accounts/modal', {
            current_account_name: (current_account?.name && current_account?.name?.length > 14) ? current_account?.name?.substring(0,14)+'...' : current_account?.name,
            current_account_address: formatAddress(current_account?.address, 16, 8),
            full_account_address: current_account?.address,
            is_primary: current_account?.id === 'main' ? '' : 'hidden'
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

            await clearHistory()
            await goToScreen('assetSendScreen')
        })
        document.querySelector("#main_footer #go_transactionHistoryScreen").addEventListener("click", async() => {
            setTimeout(() => {
                transactionHistoryTooltip.hide()
            }, 800)

            await clearHistory()
            await goToScreen('transactionHistoryScreen')
        })
        document.querySelector("#main_footer #go_stakingHomeScreen").addEventListener("click", async() => {
            setTimeout(() => {
                stakeHomeTooltip.hide()
            }, 800)

            await clearHistory()
            await goToScreen('stakingHomeScreen')
        })
    }

    initLogin = async() => {
        await updateElement('#login_screen', 'login', {
            wallet_title: isStandaloneApp() ? 'WALLET APP' : 'BROWSER WALLET'
        }, false)

        document.querySelector("#login_screen #do_login").addEventListener("click", () => this.doLoginEvent())
        document.querySelector("#login_screen #password").addEventListener("keypress", async(e) => {
            if (e.key === "Enter") {
                return await this.doLoginEvent();
            }
            await scrollToBottom()
        })
    }

    doLoginEvent = async() => {
        const current_screen = currentScreen()
        const password = DOMPurify.sanitize(document.querySelector("#login_screen #password").value);

        const result = await doLogin(password)

        if(result) {
            hideNotification()
            await hideLogin()
            if(current_screen.name === 'dashboardScreen') await reloadScreen()
        } else {
            await showNotification('Password is wrong!', 'error', 1800, isStandaloneApp() ? 60 : 0)
        }
    }

    goToScreen = async(name, params) => {
        return goToScreen(name, params)
    }

    initCustomActions = async() => {
        if(isIOs() || isStandaloneApp()) {
            const url_params = new URLSearchParams(window.location.search)
            if(url_params.has('popup')) {
                document.querySelector("#login_screen").classList.add('mini')

                await disableFooter()
            }

            this.disableDoubleClickZoom()
            // this.limitScroll()
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
}

export default userInterface

export {
    showNotification
}