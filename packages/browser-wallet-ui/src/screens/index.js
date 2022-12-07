import { updateElement } from "../screens.js";
import anime from 'animejs';

/* all screens */
import welcomeScreen from './welcome.js'
import walletScreen from './wallet.js'
import walletImportScreen from "./walletImport.js";
import walletCreateScreen from "./walletCreate.js";
import walletConfirmScreen from "./walletConfirm.js";
import walletPasswordScreen from "./walletPassword.js";
import walletFinishScreen from "./walletFinish.js";
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
        this.header_el = document.querySelector('#header')

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
                duration: 300,
                translateY: [-60, 0],
                opacity: 1,
                easing: 'linear',
                delay: !this.header_el.classList.contains('init') ? 800 : 0
            });
        }

        this.header_el.classList.add('visible')
        this.header_el.classList.add('init')
    }

    hideHeader() {
        if(this.header_el.classList.contains('visible')) {
            anime({
                targets: '#header',
                duration: 300,
                translateY: [0, -60],
                opacity: [1, 0],
                easing: 'linear',
                delay: 0
            });
        }

        this.header_el.classList.remove('visible')
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
    walletImportScreen,
    walletConfirmScreen,
    walletPasswordScreen,
    walletFinishScreen,
    portfolioScreen
}

let screen_history = []

const goToScreen = async(name, params, go_back = false) => {
    if(typeof screens[name] !== 'function') {
        console.warn(`Screen not found. [${name}]`)
        return false
    }

    if(!go_back) {
        screen_history.push({name, params})
    }

    return await screens[name](params)
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
    }

    return false
}

const clearHistory = () => {
    screen_history = []
    return true
}

export default Screen
export {
    screens,
    goToScreen,
    goBackScreen,
    updateCurrentParams,
    clearHistory
}