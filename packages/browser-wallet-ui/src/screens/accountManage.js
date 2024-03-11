import Screen, { goBackScreen, goToScreen } from './index.js'
import { AccountStore, CacheStore, NetworkStore } from "@bitgreen/browser-wallet-core";

import * as jdenticon from 'jdenticon'
import {formatAddress} from "@bitgreen/browser-wallet-utils";
import anime from "animejs";

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
  const networks_store = new NetworkStore()
  const cache_store = new CacheStore(await networks_store.current())
  const current_account = await accounts_store.current()
  const all_accounts = await accounts_store.all()

  for(const a of all_accounts) {
    const account_id = a?.key
    const account = a.value
    const kyc_level = await cache_store.get('kyc_' + account.address)

    await screen.append('#root #wallet_list', 'accounts/manage/list_item', {
      account_id,
      derivation_path: account_id?.toString() === 'main' ? '' : '//' + account_id,
      hide_derivation: account_id?.toString() === 'main' ? 'd-none hidden' : '',
      account_jdenticon: jdenticon.toSvg(account?.address,56),
      account_name: (account?.name && account?.name.length > 10) ? account?.name.substring(0,10)+'...' : account?.name,
      account_address: formatAddress(account?.address, 16, 8),
      is_main: account_id?.toString() === 'main' ? '' : 'hidden',
      is_current: account_id?.toString() === current_account?.id?.toString() ? '' : 'hidden',
      is_kyc_verified: kyc_level ? `verified verified-${kyc_level}` : 'unverified',
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

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });
}