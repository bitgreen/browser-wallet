import Screen, {clearHistory, goToScreen, scrollToBottom} from './index.js'
import { disableKillPopup, sendMessage } from "../messaging.js";
import {AccountStore, checkIfAppIsKnown, WalletStore} from "@bitgreen/browser-wallet-core";

import DOMPurify from "dompurify";
import { showNotification } from "../notifications.js";
import anime from "animejs";

export default async function extrinsicSendScreen(params) {
    const wallet_store = new WalletStore()
    if(!await wallet_store.exists()) {
        await showNotification('You need a wallet to perform this action. Please create or import one.', 'alert', 3200)
        await clearHistory()
        return await goToScreen('walletScreen', {}, false, true)
    }

    const screen = new Screen({
        template_name: 'layouts/default',
        login: false,
        header: true,
        footer: false,
        tab_id: params?.tab_id,
        message_id: params?.message_id,
        win_height: 700
    })
    await screen.init()

    const domain = params?.domain
    const pallet = params?.pallet
    const call = params?.call
    const call_parameters = params?.call_parameters ? JSON.parse(params.call_parameters) : []

    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()

    await screen.set('#heading', 'shared/heading', {
        title: 'Confirm Transaction'
    })

    await screen.set('#bordered_content', 'extrinsic/send', {
        domain,
        pallet,
        call,
        call_parameters: call_parameters ? JSON.stringify(call_parameters).substring(0, 150) : '[]'
    })

    await screen.set('#app_info', 'app_info', {
        domain,
        title: params?.title?.substring(0, 60)
    });
    if(checkIfAppIsKnown(domain)) {
        document.querySelector('#app_info').classList.add('known')
    }

    await screen.append('#bordered_content', 'global/loading', {
        title: 'processing transaction',
        desc: 'Hold tight while we get confirmation of this transaction.',
        top: '5px',
        padding_top: '100px'
    });

    document.querySelectorAll("#bordered_content .transaction-item").forEach(t => {
        t.addEventListener("click", function(e) {
            if(t.classList.contains('active')) {
                t.classList.remove('active')
            } else {
                t.classList.add('active')
            }
        })
    })

    anime({
        targets: '#bordered_content',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeInOutSine',
        duration: 400
    });

    screen.setListeners([
        {
            element: '#approve_extrinsic',
            listener: async() => await approveExtrinsic()
        },
        {
            element: '#password',
            type: 'keypress',
            listener: async(e) => {
                if(e.key === "Enter") {
                    await approveExtrinsic()
                }
                await scrollToBottom()
            }
        },
        {
            element: '#password',
            type: 'focus',
            listener: async() => {
                await scrollToBottom()
                await scrollToBottom(200)
                await scrollToBottom(1600)
            }
        },
        {
            element: '#deny_extrinsic',
            listener: async() => {
                screen.sendMessageToTab({
                    success: false,
                    status: 'denied',
                    error: 'User has denied this request.'
                })

                window.close()

                return await goToScreen('dashboardScreen')
            }
        }
    ])

    const approveExtrinsic = async() => {
        showProcessing()

        const response = await sendMessage('extrinsic', {
            password: DOMPurify.sanitize(document.querySelector('#root #password')?.value),
            account_id: current_account.id,
            pallet: pallet,
            call: call,
            call_parameters: call_parameters,
            tab_id: params?.tab_id
        }, params?.message_id)

        if(response?.success) {
            // send message to tab if response is successful
            screen.sendMessageToTab({
                ...response
            })

            showProcessingDone()

            hideProcessing(2200)
        } else if(response?.status === 'failed' && response.error) {
            // send message to tab if response is successful
            screen.sendMessageToTab({
                ...response
            })

            hideProcessing()
            await showNotification(response.error, 'error', 3200)
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

        // mark transaction(s) as completed
        document.querySelectorAll("#bordered_content .transaction-item").forEach(t => {
            t.querySelector('.status').classList.add('success')
            t.querySelector('.status').innerHTML = '<span class="icon icon-check"></span>'
        })

        setTimeout(() => {
            content_done_el.classList.add('active')

            content_done_text_el.innerHTML = 'Transaction Completed'
            content_done_desc_el.innerHTML = 'You can close this window and continue with the application that made the request.'
        }, 600)

        setTimeout(() => {
            checkmark_el.classList.add('show')
        }, 800)

        setTimeout(() => {
            loading_el.classList.add('done')
        }, 1200)

        anime({
            targets: '#bordered_content .footer',
            translateY: 200,
            duration: 1200,
            delay: 0
        });
    }

    const hideProcessing = (delay = 800) => {
        setTimeout(() => {
            const loading_el = document.querySelector("#loading_content")

            loading_el.classList.remove('active')
            screen.unFreezeRoot()
        }, delay)
    }
}