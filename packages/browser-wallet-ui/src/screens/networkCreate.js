import Screen, { goBackScreen, goToScreen } from './index.js'
import { NetworkStore } from "@bitgreen/browser-wallet-core";
import { sendMessage } from "../messaging.js";
import { showNotification } from "../notifications.js";

import DOMPurify from "dompurify";

export default async function networkCreateScreen(params) {
    const screen = new Screen({
        template_name: 'layouts/full_page',
        template_params: {
            title: params?.network_id ? 'Edit Custom Network' : 'Add New Network'
        },
        header: false,
        footer: false
    })
    await screen.init()

    const network_id = params?.network_id
    const network_store = new NetworkStore()
    const network = await network_store.asyncGet(network_id)

    await screen.set('.content', 'network/create', {
        network_id: network_id,
        network_name: network?.name,
        network_url: network?.url,
        is_new: params?.network_id ? 'hidden' : '',
        hide_delete: !params?.network_id ? 'hidden' : '',
    })

    const delete_modal_el = document.querySelector("#delete_modal")
    const network_name_el = document.querySelector("#network_name")
    const network_url_el = document.querySelector("#network_url")
    const switch_network_el = document.querySelector("#switch_to_this")

    screen.setListeners([
        {
            element: '.heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#root #network_name, #root #network_url',
            type: 'input',
            listener: () => checkNetwork()
        },
        {
            element: '#root #save_network',
            listener: async(e) => {
                const network_name = DOMPurify.sanitize(network_name_el.value)
                const network_url = DOMPurify.sanitize(network_url_el.value)
                const switch_network = switch_network_el?.value === 'on'

                await sendMessage('save_network', {
                    network_id,
                    network_name,
                    network_url,
                    switch_network
                })

                await goToScreen('networkManageScreen', {}, true)
                await showNotification('Network saved successfully!', 'success')
            }
        },
        {
            element: '#delete_network',
            listener: () => {
                delete_modal_el.classList.add('fade')
                delete_modal_el.classList.add('show')
            }
        },
        {
            element: '#hide_modal',
            listener: () => {
                delete_modal_el.classList.remove('fade')
                delete_modal_el.classList.remove('show')
            }
        },
        {
            element: '#confirm_delete_network',
            listener: async(e) => {
                const network_id = e.target.dataset.id;

                network_store.remove(network_id)

                await goToScreen('networkManageScreen', {}, true, true)
                await showNotification('Network deleted successfully.', 'info')
            }
        }
    ])

    const isValidWssUrl = (string) => {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "ws:" || url.protocol === "wss:";
    }

    const checkNetwork = () => {
        const save_network_el = document.querySelector("#save_network")

        if(network_name_el?.value?.length === 0 || network_url_el?.value?.length === 0 || !isValidWssUrl(network_url_el?.value)) {
            save_network_el.classList.add('disabled')
            save_network_el.classList.remove('btn-primary')
        } else {
            save_network_el.classList.remove('disabled')
            save_network_el.classList.add('btn-primary')
        }
    }
    checkNetwork()
}