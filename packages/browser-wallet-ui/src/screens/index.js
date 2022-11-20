import { sleep } from "@bitgreen/browser-wallet-utils";
import { updateElement } from "../screens.js";

/* all screens */
import welcomeScreen from './welcome.js'
import walletScreen from './wallet.js'
import walletCreateScreen from "./walletCreate.js";
import portfolioScreen from './portfolio.js'

class Screen {
    initialized = false

    options = {
        element: '#root',
        template_name: 'init',
        template_params: {},
        header: false,
        footer: false,
        login: true,
        auto_load: true,
        smooth_load: false
    }

    constructor(opts) {
        this.options = {
            ...this.options,
            ...opts
        }
    }

    async init() {
        this.options.header ? this.showHeader() : this.hideHeader()
        this.options.login ? this.showLogin() : this.hideLogin()

        if(this.options.smooth_load) this.resetRoot()
        if(this.options.auto_load) await this.set() && this.hide_init()

        this.initialized = true

        return this.initialized
    }

    resetRoot() {
        document.querySelector('#root').classList.remove('init')
    }

    showRoot() {
        document.querySelector('#root').classList.add('init')
    }

    async set(element = this.options.element, template_name = this.options.template_name, params = this.options.template_params) {
        await updateElement(element, template_name, params, false)

        if(element === '#root') this.showRoot()

        return true
    }

    async append(element, template_name, params) {
        return await updateElement(element, template_name, params, true)
    }

    setListeners(options = []) {
        for(let option of options) {
            if(option.element) {
                for(let element of document.querySelectorAll(option.element)) {
                    this.setListener(element, option.listener)
                }
            }
        }
    }

    setListener(element, method, type = 'click') {
        return element.addEventListener(type, method)
    }

    showHeader() {

    }

    hideHeader() {

    }

    showLogin() {

    }

    hideLogin() {
        document.getElementById("login_screen").classList.add("inactive")
    }

    hide_init() {
        setTimeout(function() {
            document.getElementById("init_screen").classList.add("fade-out");
        }, 300);
        setTimeout(function() {
            document.getElementById("init_screen").classList.add("inactive")
            document.getElementById("init_screen").classList.remove("fade-out")
        }, 600)
    }
}

const screens = {
    welcomeScreen,
    walletScreen,
    walletCreateScreen,
    portfolioScreen
}

const goToScreen = async(name, params) => {
    if(typeof screens[name] !== 'function') {
        console.log(`Screen not found. [${name}]`)
        return false
    }

    return await screens[name](params)
}

export default Screen
export {
    screens,
    goToScreen
}