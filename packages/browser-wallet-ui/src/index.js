import { updateElement  } from './screens.js'
import {
    goToScreen,
    doLogin,
    hideLogin,
    copyText,
    updateAccounts,
    showLogin,
    currentScreen,
    clearHistory
} from './screens/index.js'
import { renderChart } from "./chart.js";
import { sendMessage } from "./messaging.js";
import { hideNotification, showNotification } from "./notifications.js";

import DOMPurify from 'dompurify';
import * as jdenticon from 'jdenticon'

/* import stores */
import { AccountStore, databaseService } from "@bitgreen/browser-wallet-core";

/* import all css files */
import './styles/main.css'
import './styles/icomoon.css'
import 'bootstrap/dist/css/bootstrap.css'

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
    }

    initHeader = async() => {
        await updateElement('#header', 'shared/header', {
            account_jdenticon: jdenticon.toSvg(this.current_account.address,56),
            account_address: this.current_account?.address?.substring(0,8)+'...'+this.current_account?.address?.substring(this.current_account?.address.length-8),
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
        document.querySelector("#accounts_modal #copy_address").addEventListener("click", async() => {
            const accounts_store = new AccountStore()
            const current_account = await accounts_store.current()

            await copyText(current_account.address)
            await showNotification('Account copied to clipboard.', 'info')
        });
        document.querySelector("#accounts_modal #lock_wallet").addEventListener("click", async(e) => {
            accounts_modal_el.classList.remove('fade')
            accounts_modal_el.classList.remove('show')

            await showLogin(false, true)
            await sendMessage('lock_wallet')
            setTimeout(async() => {
                return await goToScreen('dashboardScreen')
            }, 1200) // redirect to dashboard
        })
        document.querySelector("#accounts_modal #manage_accounts").addEventListener("click", async() => {
            accounts_modal_el.classList.remove('fade')
            accounts_modal_el.classList.remove('show')

            return await goToScreen('accountManageScreen')
        })
    }

    initAccounts = async() => {
        const current_account = await this.db.stores.accounts.current()
        const accounts = await this.db.stores.accounts.asyncAll()

        await updateElement('#accounts_modal', 'accounts/modal', {
            current_account_name: (current_account?.name && current_account?.name?.length > 14) ? current_account?.name?.substring(0,14)+'...' : current_account?.name,
            current_account_address: current_account?.address?.substring(0,12)+'...'+current_account?.address?.substring(current_account.address.length-8),
            is_primary: current_account?.id === '0' ? '' : 'hidden'
        }, false)

        await updateAccounts(current_account?.id)
    }

    initFooter = async() => {
        await updateElement('#main_footer', 'shared/footer', {}, false)

        document.querySelector("#main_footer #go_dashboardScreen").addEventListener("click", () => goToScreen('dashboardScreen'))
        document.querySelector("#main_footer #go_assetSendScreen").addEventListener("click", async() => {
            await clearHistory()
            await goToScreen('assetSendScreen')
        })
        document.querySelector("#main_footer #go_transactionHistoryScreen").addEventListener("click", async() => {
            await clearHistory()
            await goToScreen('transactionHistoryScreen')
        })
    }

    initLogin = async() => {
        await updateElement('#login_screen', 'login', {
            checked: await this.db.stores.settings.asyncGet('keep_me_signed_in') ? 'checked' : ''
        }, false)

        document.querySelector("#login_screen #do_login").addEventListener("click", () => this.doLoginEvent())
        document.querySelector("#login_screen #password").addEventListener("keypress", async(e) => {
            if (e.key === "Enter") {
                return await this.doLoginEvent();
            }
        })
    }

    doLoginEvent = async() => {
        const current_screen = currentScreen()
        const password = DOMPurify.sanitize(document.querySelector("#login_screen #password").value);
        const keep_me_signed_in = document.querySelector("#login_screen #keep_me_signed_in").checked;

        const result = await doLogin(password, keep_me_signed_in)

        if(result) {
            hideNotification()
            await hideLogin()
            if(current_screen.name === 'dashboardScreen') await renderChart()
        } else {
            await showNotification('Password is wrong!', 'error')
        }
    }

    goToScreen = async(name, params) => {
        return goToScreen(name, params)
    }
}

export default userInterface

export {
    showNotification
}