import { resetElement, updateElement } from "../screens.js";
import { sendMessage } from "../messaging.js";
import {
    formatAddress,
    getCurrentBrowser,
    isFirefox,
    isIOs,
    isMacOs,
    isSafari, isStandaloneApp,
    isWindows,
    sleep
} from "@bitgreen/browser-wallet-utils";
import {AccountStore, CacheStore, NetworkStore} from "@bitgreen/browser-wallet-core";
import { hideNotification } from "../notifications.js";

import anime from 'animejs';
import * as jdenticon from "jdenticon";

/* all screens */
import welcomeScreen from './welcome.js'
import walletScreen from './wallet.js'
import walletImportScreen from "./walletImport.js";
import walletCreateScreen from "./walletCreate.js";
import walletConfirmScreen from "./walletConfirm.js";
import walletPasswordScreen from "./walletPassword.js";
import walletFinishScreen from "./walletFinish.js";
import walletBackupScreen from "./walletBackup.js";
import dashboardScreen from "./dashboard.js";
import signInScreen from "./signIn.js";
import assetAllScreen from "./assetAll.js";
import assetSendScreen from "./assetSend.js";
import accountManageScreen from "./accountManage.js";
import accountCreateScreen from "./accountCreate.js";
import settingsScreen from "./settings.js";
import accountEditScreen from "./accountEdit.js";
import assetReceiveScreen from "./assetReceive.js";
import assetTransactionReviewScreen from "./assetTransactionReview.js";
import assetTransactionFinishScreen from "./assetTransactionFinish.js";
import networkManageScreen from "./networkManage.js";
import networkCreateScreen from "./networkCreate.js";
import extrinsicSendScreen from "./extrinsicSend.js";
import transactionHistoryScreen from "./transactionHistory.js";
import transactionDetailsScreen from "./transactionDetails.js";
import tokenAllScreen from "./tokenAll.js";
import tokenBBBScreen from "./tokenBBB.js";
import stakingHomeScreen from "./stakingHome.js";
import stakingIntroScreen from "./stakingIntro.js";
import stakingCollatorsScreen from "./stakingCollators.js";
import stakingCollatorScreen from "./stakingCollator.js";
import kycStartScreen from "./kycStart.js";
import kycBasicScreen from "./kycBasic.js";
import connectionErrorScreen from "./connectionError.js";
import kycAdvancedScreen from "./kycAdvanced.js";
import kycAccreditedScreen from "./kycAccredited.js";

const current_browser = getCurrentBrowser()

let logged_in = false
let lock_timeout = null

class Screen {
    initialized = false
    tab = false

    options = {
        element: '#root',
        template_name: 'init',
        template_params: {},
        header: false,
        footer: false,
        login: true,
        auto_load: true,
        smooth_load: false,
        freeze_root: false,
        freeze_root_delay: 0,
        win_width: 400,
        win_height: 600
    }

    constructor(opts) {
        this.header_el = document.querySelector('#header')
        this.footer_el = document.querySelector('#main_footer')

        this.options = {
            ...this.options,
            ...opts
        }
    }

    async init() {
        logged_in = await this.fastCheckLogin(true)

        this.options.login ? await showLogin(true) : hideLogin(true)

        this.resizeTo(this.options.win_width, this.options.win_height)

        this.options.freeze_root ? this.freezeRoot() : this.unFreezeRoot

        this.options.header ? this.showHeader() : this.hideHeader()
        this.options.footer ? this.showFooter() : this.hideFooter()

        if(this.options.smooth_load) this.resetRoot()
        if(this.options.auto_load) await this.set() && hideInit()
        if(this.options.tab_id && this.options.message_id) await this.loadTab()

        setTimeout(this.unFreezeRoot, this.options.freeze_root_delay)

        this.initialized = true

        return this.initialized
    }

    async fastCheckLogin(init = true) {
        if(init) {
            clearTimeout(lock_timeout)
        }

        // refresh status every 10 seconds
        lock_timeout = setTimeout(async() => {
            logged_in = await this.fastCheckLogin(false)

            if(this.options.login && !logged_in) await showLogin()
        }, 10000)

        return await sendMessage('fast_check_login')
    }

    resizeTo(width, height) {
        if(isWindows()) {
            // Add 16px width and 39px height on windows.
            width += 16
            height += 39
        } else if(isMacOs()) {
            // Add 39px height on macOS.
            height += 39
        }

        window.resizeTo(width, height) // Set window height
    }

    resetRoot() {
        document.querySelector('#root').classList.remove('init')
    }

    showRoot() {
        document.querySelector('#root').classList.add('init')
    }

    freezeRoot() {
        document.querySelector('#root').classList.add('freeze')
    }

    unFreezeRoot() {
        document.querySelector('#root').classList.remove('freeze')
    }

    showInit() {
        document.querySelector("#init_screen").classList.remove("inactive")
    }

    async set(element = this.options.element, template_name = this.options.template_name, params = this.options.template_params) {
        await updateElement(element, template_name, params, false)

        if(element === '#root') this.showRoot()

        return true
    }

    async append(element, template_name, params) {
        return await updateElement(element, template_name, params, true)
    }

    async reset(element) {
        return await resetElement(element)
    }

    setParam(element, value) {
        document.querySelector(element).innerHTML = value
    }

    setListeners(options = []) {
        for(let option of options) {
            if(option.element) {
                for(let element of document.querySelectorAll(option.element)) {
                    this.setListener(element, option.listener, option.type)
                }
            }
        }
    }

    setListener(element, method, type = 'click') {
        return element.addEventListener(type, method)
    }

    showHeader() {
        if(!this.header_el.classList.contains('visible')) {
            anime({
                targets: '#header',
                duration: 400,
                translateY: [-60, 0],
                opacity: 1,
                easing: 'linear',
                delay: !this.header_el.classList.contains('init') ? 400 : 0
            });
        }

        this.header_el.classList.add('visible')
        this.header_el.classList.add('init')
    }

    hideHeader() {
        if(this.header_el.classList.contains('visible')) {
            anime({
                targets: '#header',
                duration: 400,
                translateY: [0, -60],
                opacity: [1, 0],
                easing: 'linear',
                delay: 0
            });
        }

        this.header_el.classList.remove('visible')
    }

    showFooter() {
        const current_screen = currentScreen()

        if(!logged_in) return false

        if(!this.footer_el.classList.contains('visible') && !this.footer_el.classList.contains('disabled')) {
            anime({
                targets: '#main_footer',
                duration: 300,
                translateY: [60, 0],
                opacity: 1,
                easing: 'linear',
                delay: 400
            });
        }

        for(let element of this.footer_el.querySelectorAll('.item')) {
            element.classList.remove('active')

            if(element.id === 'go_' + current_screen.name) {
                element.classList.add('active')
            }

            if(element.id === 'go_stakingHomeScreen' && current_screen.name.includes('staking')) {
                element.classList.add('active')
            }
        }

        this.footer_el.classList.add('visible')
    }

    hideFooter() {
        if(this.footer_el.classList.contains('visible')) {
            anime({
                targets: '#main_footer',
                duration: 300,
                translateY: [0, 120],
                opacity: [1, 0],
                easing: 'linear',
                delay: 0
            });
        }

        this.footer_el.classList.remove('visible')
    }

    hideInit() {
        setTimeout(function() {
            document.querySelector("#init_screen").classList.add("fade-out");
        }, 200);
        setTimeout(function() {
            document.querySelector("#init_screen").classList.add("inactive")
            document.querySelector("#init_screen").classList.remove("fade-out")
        }, 400)
    }

    async loadTab() {
        this.options.tab_id = parseInt(this.options.tab_id)
        this.options.message_id = parseFloat(this.options.message_id)

        if(!this.options.tab_id || !this.options.message_id) {
            return false
        }

        this.tab = await current_browser.tabs.connect(this.options.tab_id, { name: 'PORT_CONTENT_RESOLVE=' + this.options.message_id });

        return this.tab
    }

    sendMessageToTab(response) {
        try {
            this.tab.postMessage({
                id: this.options.message_id,
                response
            })

            return true
        } catch(e) {
            return false
        }
    }
}

const freezeRoot = () => {
    document.querySelector('#root').classList.add('freeze')
}

const unFreezeRoot = () => {
    document.querySelector('#root').classList.remove('freeze')
}

const showInit = (locked = false) => {
    document.querySelector("#init_screen").classList.remove("inactive")
    document.querySelector("#init_screen").classList.add("fade-in")

    if(locked) {
        document.querySelector("#init_screen").classList.add("locked")
    }

    document.querySelector("#init_screen").classList.add("loaded")
}

const hideInit = (unlocked = false) => {
    const isLoaded = document.querySelector("#init_screen").classList.contains("loaded")

    if(unlocked || !document.querySelector("#init_screen").classList.contains("locked")) {
        setTimeout(function() {
            document.querySelector("#init_screen").classList.remove("fade-in")
            document.querySelector("#init_screen").classList.add("fade-out");
        }, unlocked && isLoaded ? 0 : 300);
        setTimeout(function() {
            document.querySelector("#init_screen").classList.add("inactive")
            document.querySelector("#init_screen").classList.remove("fade-out")
        }, unlocked && isLoaded ? 300 : 600)
    }
}

const checkLogin = async() => {
    return await sendMessage('check_login')
}

const showLogin = async(instant = false, force = false) => {
    if(logged_in && !force) {
        return hideLogin()
    }

    logged_in = false

    if(document.querySelector("#login_screen").classList.contains('inactive')) {
        document.querySelector("#login_screen").classList.remove('inactive')
        document.querySelector("#login_screen").removeAttribute('style');

        anime({
            targets: '.separator',
            easing: 'linear',
            duration: 300,
            delay: 300,
            translateY: [20, 0],
            opacity: [0, 1]
        });

        anime({
            targets: '.browser-wallet',
            easing: 'linear',
            duration: 300,
            delay: 400,
            translateX: [-30, 0],
            opacity: [0, 1]
        });

        anime({
            targets: '.footer-only',
            easing: 'linear',
            duration: 400,
            delay: 500,
            opacity: [0, 1]
        });

        anime({
            targets: '#login_option',
            easing: 'linear',
            duration: 300,
            delay: 600,
            translateY: [-20, 0],
            opacity: [0, 1]
        });

        if(!instant) {
            anime({
                targets: '#login_screen',
                easing: 'linear',
                duration: 200,
                opacity: [0, 1]
            });
        }
    }

    setTimeout(() => {
        if(!isStandaloneApp()) document.querySelector("#login_screen #password").focus();
    }, 100)
}

const doLogin = async(password) => {
    const result = await sendMessage('unlock_wallet', {
        password
    })

    if(result) {
        logged_in = true
    }

    return result
}

const hideLogin = (instant = false) => {
    if(!instant) {
        document.querySelector("#login_screen").classList.add("fade-out");

        setTimeout(() => {
            document.querySelector("#login_screen").classList.add("inactive")
            document.querySelector("#login_screen").classList.remove("fade-out")
            document.querySelector("#login_screen #password").value = ''; // remove password from a field
        }, 400);
    } else {
        document.querySelector("#login_screen").classList.add("inactive")
        document.querySelector("#login_screen #password").value = ''; // remove password from a field
    }
}

const enableFooter = () => {
    const footer_el = document.querySelector('#main_footer')

    if(footer_el.classList.contains('disabled') && footer_el.classList.contains('visible')) {
        anime({
            targets: '#main_footer',
            duration: 300,
            translateY: [60, 0],
            opacity: 1,
            easing: 'linear',
            delay: 400
        });
    }

    footer_el.classList.remove('disabled')
}

const disableFooter = () => {
    const footer_el = document.querySelector('#main_footer')

    if(!footer_el.classList.contains('disabled')) {
        anime({
            targets: '#main_footer',
            duration: 300,
            translateY: [0, 120],
            opacity: [1, 0],
            easing: 'linear',
            delay: 0
        });
    }

    footer_el.classList.add('disabled')
}

const screens = {
    welcomeScreen,
    walletScreen,
    walletCreateScreen,
    walletImportScreen,
    walletConfirmScreen,
    walletPasswordScreen,
    walletFinishScreen,
    walletBackupScreen,
    accountManageScreen,
    accountCreateScreen,
    accountEditScreen,
    dashboardScreen,
    signInScreen,
    assetAllScreen,
    assetSendScreen,
    assetReceiveScreen,
    assetTransactionReviewScreen,
    assetTransactionFinishScreen,
    transactionHistoryScreen,
    transactionDetailsScreen,
    settingsScreen,
    networkManageScreen,
    networkCreateScreen,
    extrinsicSendScreen,
    tokenAllScreen,
    tokenBBBScreen,
    stakingHomeScreen,
    stakingIntroScreen,
    stakingCollatorsScreen,
    stakingCollatorScreen,
    kycStartScreen,
    kycBasicScreen,
    kycAdvancedScreen,
    kycAccreditedScreen,
    connectionErrorScreen
}

let screen_history = []
let active_screen = null
let transitioning = false

const goToScreen = async(name, params = {}, go_back = false, force = false) => {
    if(!force) hideNotification()

    // pause if still changing screen
    if(transitioning && !force) return false
    transitioning = true
    setTimeout(() => {
        transitioning = false
    }, 600)

    if(typeof screens[name] !== 'function') {
        console.warn(`Screen not found. [${name}]`)
        return false
    }

    if(active_screen?.name === name && !force) {
        return false
    }

    if(!go_back && !force) {
        screen_history.push({name, params})
    }

    active_screen = {
        name, params
    }

    if(!force) {
        anime({
            targets: '#root',
            opacity: [1, 0],
            easing: 'easeInOutSine',
            duration: 150
        });

        anime({
            targets: '#root',
            opacity: [0, 1],
            easing: 'easeInOutSine',
            duration: 1,
            delay: 300
        });

        await sleep(300)
    }

    await screens[name](params)

    transitioning = false

    return true
}

const currentScreen = () => {
    return screen_history[screen_history.length - 1]
}

const updateCurrentParams = (params) => {
    let current_screen = screen_history[screen_history.length - 1]
    current_screen.params = {
        ...current_screen.params,
        ...params
    }
}

const goBackScreen = async() => {
    screen_history.pop()

    const previous_screen = screen_history[screen_history.length - 1]

    if(previous_screen) {
        return await goToScreen(previous_screen.name, previous_screen.params, true)
    } else {
        await clearHistory()
        return await goToScreen('dashboardScreen')
    }
}

const clearHistory = async() => {
    // send response to page if any
    for(const screen of screen_history) {
        if(screen?.params?.message_id && screen?.params?.tab_id) {
            const tab = await current_browser.tabs.connect(parseInt(screen.params.tab_id), { name: 'PORT_CONTENT_RESOLVE=' + screen.params.message_id });

            try {
                tab.postMessage({
                    id: screen.params.message_id,
                    response: {
                        success: false,
                        status: 'expired',
                        error: 'Request expired.'
                    }
                })
            } catch(e) {
                // console.log(e)
            }
        }
    }
    screen_history = [currentScreen()]
    return true
}

const reloadScreen = async() => {
    const current_screen = currentScreen()

    if(current_screen) {
        return await goToScreen(current_screen.name, current_screen.params, true, true)
    } else {
        return await goToScreen('dashboardScreen')
    }
}

const updateAccounts = async(current_account_id = null) => {
    const accounts_store = new AccountStore()
    const networks_store = new NetworkStore()
    const cache_store = new CacheStore(await networks_store.current())

    if(current_account_id) {
        await accounts_store.asyncSet('current', current_account_id)
    }

    const accounts = await accounts_store.asyncAll()
    const current_account = await accounts_store.current()

    const header_logo_el = document.querySelector("#header #top_logo");
    const accounts_modal_el = document.querySelector("#accounts_modal");
    const current_account_el = document.querySelector("#header #current_wallet");
    const go_copy_el = document.querySelector("#header #go_copy");

    if(!current_account) {
        header_logo_el.classList.add('full')
        current_account_el.classList.add('hidden')
        go_copy_el.classList.add('hidden')

    } else {
        header_logo_el.classList.remove('full')
        current_account_el.classList.remove('hidden')
        go_copy_el.classList.remove('hidden')
    }

    accounts_modal_el.querySelector('.address').innerHTML = formatAddress(current_account?.address, 16, 8)

    setTimeout(async() => {
        await resetElement('#accounts_modal #wallet_list')

        for(const a of accounts) {
            const account = a?.value
            const account_id = a?.key
            const account_jdenticon = jdenticon.toSvg(account.address,56)
            const is_current = account_id?.toString() === current_account?.id?.toString()
            const is_kyced = await cache_store.asyncGet('kyc_' + account.address)

            if(is_current) {
                current_account_el.querySelector('.jdenticon .jdenticon-content').innerHTML = account_jdenticon
                current_account_el.querySelector('.name').innerHTML = (account.name && account.name.length > 14) ? account.name.substring(0,14)+'...' : account.name
                current_account_el.querySelector('.address').innerHTML = formatAddress(account?.address, 8, 8)

                if(is_kyced) {
                    current_account_el.querySelector('.kyc-status').classList.add('verified')
                } else {
                    current_account_el.querySelector('.kyc-status').classList.remove('verified')
                }

                go_copy_el.dataset.address = account?.address;
                accounts_modal_el.querySelector('#copy_address .btn').dataset.address = account?.address

                accounts_modal_el.querySelector('.title').innerHTML = (account.name && account.name.length > 14) ? account.name.substring(0,14)+'...' : account.name
                accounts_modal_el.querySelector('.address').innerHTML = formatAddress(account?.address, 12, 8)

                if(is_kyced) {
                    accounts_modal_el.querySelector('.kyc-status').classList.add('verified')
                    accounts_modal_el.querySelector('.kyc-status').classList.remove('unverified')
                } else {
                    accounts_modal_el.querySelector('.kyc-status').classList.remove('verified')
                    accounts_modal_el.querySelector('.kyc-status').classList.add('unverified')
                }

                if(account_id?.toString() === 'main') {
                    accounts_modal_el.querySelector('.badge-primary').classList.remove('hidden')
                } else {
                    accounts_modal_el.querySelector('.badge-primary').classList.add('hidden')
                }
            }

            const kyc_level = await cache_store.asyncGet('kyc_' + account.address)

            await updateElement('#accounts_modal #wallet_list', 'accounts/modal_item', {
                account_id,
                account_jdenticon,
                account_name: (account.name && account.name.length > 10) ? account.name.substring(0,10)+'...' : account.name,
                account_address: formatAddress(account?.address, 16, 8),
                is_main: account_id?.toString() === 'main' ? '' : 'hidden',
                is_current: is_current ? '' : 'hidden',
                is_kyc_verified: kyc_level ? `verified verified-${kyc_level}` : 'unverified',
            }, true)
        }

        document.querySelectorAll("#accounts_modal #wallet_list .wallet").forEach(w => {
            w.addEventListener("click", async(e) => {
                const account_id = e.target.dataset?.id

                accounts_modal_el.classList.remove('fade')
                accounts_modal_el.classList.remove('show')

                await updateAccounts(account_id)

                await reloadScreen()
            })
        })
    }, 200)
}

const copyText = async(text) => {
    await navigator.clipboard.writeText(text);
}

const scrollToBottom = async(delay = 0) => {
    if(delay > 0) await sleep(delay)

    const bodyElement = document.getElementsByTagName('body')[0]
    const bodyElementOffset = bodyElement.offsetHeight;
    const outerHeight = window.outerHeight

    const url_params = new URLSearchParams(window.location.search)
    if(url_params.has('popup')) {
        window.scrollTo(0, 1000)
    } else {
        window.scrollTo(0, outerHeight - bodyElementOffset + 90)
    }
}

export default Screen
export {
    screens,
    showLogin,
    doLogin,
    hideLogin,
    goToScreen,
    goBackScreen,
    reloadScreen,
    updateCurrentParams,
    currentScreen,
    clearHistory,
    updateAccounts,
    copyText,
    enableFooter,
    disableFooter,
    scrollToBottom,
    freezeRoot,
    unFreezeRoot,
    showInit,
    hideInit
}