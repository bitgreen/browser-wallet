import Screen, { goToScreen } from './index.js'
import { sendMessage } from "../messaging.js";
import DOMPurify from "dompurify";
import { AccountStore, checkIfAppIsKnown } from "@bitgreen/browser-wallet-core";

import anime from "animejs";
import { showNotification } from "../notifications.js";

export default async function signInScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/default',
        login: false,
        header: true,
        footer: false,
        tab_id: params?.tab_id,
        message_id: params?.message_id
    })
    await screen.init()

    const domain = params?.domain
    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()

    await screen.set('#heading', 'shared/heading', {
        title: 'Sign In Request'
    })

    await screen.set('#bordered_content', 'sign_in', {
        domain: domain
    })

    await screen.set('#app_info', 'app_info', {
        domain,
        title: params?.title?.substring(0, 60)
    });
    if(checkIfAppIsKnown(domain)) {
        document.querySelector('#app_info').classList.add('known')
    }

    await screen.append('#bordered_content', 'global/loading', {
        title: 'Approving sign in',
        desc: 'Hold tight while we get confirmation of this sign in request.',
        top: '16px;',
        padding_top: '40px',
        checkmark_top: '88px'
    });

    await screen.append('#loading_content #content .done', 'global/button', {
        id: 'close_tab',
        title: 'Close and return',
        class: 'btn-dark btn-sm btn-rounded',
        icon: 'hidden m-0'
    });

    screen.setListeners([
        {
            element: '#execute_sign_in',
            listener: async() => await doSignIn()
        },
        {
            element: '#root #password',
            type: 'keypress',
            listener: async(e) => {
                if(e.key === "Enter") {
                    await doSignIn()
                }
            }
        },
        {
            element: '#deny_sign_in',
            listener: async() => {
                screen.sendMessageToTab({
                    status: 'denied'
                })

                window.close()

                return await goToScreen('dashboardScreen')
            }
        },
        {
            element: '#close_tab',
            listener: async() => {
                window.close()

                return await goToScreen('dashboardScreen')
            }
        },
    ])

    const doSignIn = async() => {
        showProcessing()

        const response = await sendMessage('sign_in', {
            password: DOMPurify.sanitize(document.querySelector('#root #password')?.value),
            account_id: current_account.id,
            domain: params?.domain,
            tab_id: params?.tab_id
        }, params?.message_id)

        if(response) {
            // send message to tab if response is successful
            screen.sendMessageToTab({
                success: true,
                ...response
            })

            showProcessingDone()
            // window.close()
        } else {
            hideProcessing()
            await showNotification('Password is wrong!', 'error')
        }
    }

    const showProcessing = () => {
        const loading_el = document.querySelector("#loading_content")

        loading_el.classList.add('active')

        screen.freezeRoot()
    }

    const showProcessingDone = () => {
        screen.unFreezeRoot()

        const loading_el = document.querySelector("#loading_content")
        const checkmark_el = loading_el.querySelector("#checkmark")
        const content_done_el = loading_el.querySelector("#content .done")
        const content_done_text_el = loading_el.querySelector("#content .done .text")
        const content_done_desc_el = loading_el.querySelector("#content .done .desc")

        const dark_element = document.querySelector('#loading_content #dark')

        dark_element.style.transition = "stroke-dasharray 1.2s ease-out, stroke-dashoffset 1.2s ease-out";
        dark_element.style.strokeDasharray = "100 0";
        dark_element.style.strokeDashoffset = "0";

        setTimeout(() => {
            content_done_el.classList.add('active')

            content_done_text_el.innerHTML = 'Sign in approved'
            content_done_desc_el.innerHTML = 'You can close this window and continue with the application that made the sign in request.'
        }, 600)

        setTimeout(() => {
            checkmark_el.classList.add('show')
        }, 800)

        setTimeout(() => {
            loading_el.classList.add('done')
        }, 1200)

        anime({
            targets: '#bordered_content .footer',
            translateY: 150,
            duration: 1200,
            delay: 0
        });
    }

    const hideProcessing = () => {
        const loading_el = document.querySelector("#loading_content")

        loading_el.classList.remove('active')
        screen.unFreezeRoot()
    }
}