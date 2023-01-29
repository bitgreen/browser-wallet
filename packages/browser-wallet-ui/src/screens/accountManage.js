import Screen, { goBackScreen, goToScreen } from './index.js'
import { AccountStore } from "@bitgreen/browser-wallet-core";

import * as jdenticon from 'jdenticon'
import {formatAddress} from "@bitgreen/browser-wallet-utils";

export default async function accountManageScreen() {
    const screen = new Screen({
        template_name: 'layouts/default_custom_header',
        header: false,
        footer: true
    })
    await screen.init()

    await screen.set('#heading', 'accounts/manage/heading')
    await screen.set('#bordered_content', 'accounts/manage/content')

    const accounts_store = new AccountStore()
    const current_account = await accounts_store.current()
    const all_accounts = await accounts_store.asyncAll()

    for(const a of all_accounts) {
        const account_id = a?.key
        const account = a.value
        await screen.append('#root #wallet_list', 'accounts/manage/list_item', {
            account_id,
            derivation_path: account_id?.toString() === 'main' ? '' : '//' + account_id,
            hide_derivation: account_id?.toString() === 'main' ? 'd-none hidden' : '',
            account_jdenticon: jdenticon.toSvg(account?.address,56),
            account_name: (account?.name && account?.name.length > 10) ? account?.name.substring(0,10)+'...' : account?.name,
            account_address: formatAddress(account?.address, 16, 8),
            is_main: account_id?.toString() === 'main' ? '' : 'hidden',
            is_current: account_id?.toString() === current_account?.id?.toString() ? '' : 'hidden'
        })
    }

    screen.setListeners([
        {
            element: '#heading #new_account',
            listener: () => goToScreen('accountCreateScreen')
        },
        {
            element: '#heading #go_back',
            listener: () => goBackScreen()
        },
        {
            element: '#root #wallet_list .button-item',
            listener: (e) => {
                return goToScreen('accountEditScreen', {
                    account_id: e.target.dataset?.id
                })
            }
        }
    ])
}