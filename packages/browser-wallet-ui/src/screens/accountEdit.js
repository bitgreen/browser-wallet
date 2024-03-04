import Screen, { copyText, goBackScreen, goToScreen, updateAccounts } from './index.js'
import { AccountStore, NetworkStore, CacheStore } from "@bitgreen/browser-wallet-core";
import { showNotification } from "../notifications.js";

import DOMPurify from 'dompurify';
import anime from "animejs";
import { formatAddress } from "@bitgreen/browser-wallet-utils";

export default async function accountEditScreen(params) {
  const screen = new Screen({
    template_name: 'layouts/default_custom_header_medium',
    template_params: {
      title: 'Manage Account',
      equal_padding: 'equal-padding'
    },
    header: false,
    footer: false
  })
  await screen.init()

  const account_id = params?.account_id

  const accounts_store = new AccountStore()
  const networks_store = new NetworkStore()
  const cache_store = new CacheStore(await networks_store.current())

  const account = await accounts_store.asyncGet(account_id)

  await screen.set('#heading', 'accounts/edit/heading', {
    account_name: account?.name,
    current_account_address: formatAddress(account?.address, 16, 8)
  })

  const kyc_level = await cache_store.asyncGet('kyc_' + account.address)

  await screen.set('#bordered_content', 'accounts/edit/content', {
    account_id,
    account_address: account?.address,
    derivation_path: account_id !== 'main' ? account_id : ''
  })

  if(kyc_level) {
    const go_kyc_el = document.querySelector('#heading #go_kyc')

    go_kyc_el.querySelector('.kyc-status .icon').classList.add('text-green')
    if(typeof kyc_level === 'string') {
      if(parseInt(kyc_level) === 4) {
        go_kyc_el.querySelector('.kyc-status .text').innerHTML = `Accredited (LVL ${kyc_level.toString()})`
      } else if(parseInt(kyc_level) > 1) {
        go_kyc_el.querySelector('.kyc-status .text').innerHTML = `Advanced (LVL ${kyc_level.toString()})`
      } else {
        go_kyc_el.querySelector('.kyc-status .text').innerHTML = `Basic (LVL ${kyc_level.toString()})`
      }
    }
  }

  if(account_id !== 'main') await screen.set('#bordered_content .footer .forget-account', 'accounts/edit/delete_button')

  await screen.append('#root', 'accounts/edit/delete_modal', {
    account_id,
    account_name: account?.name,
    account_address: account?.address
  })

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });

  const switch_account_el = document.querySelector("#switch_to_this")

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => goBackScreen()
    },
    {
      element: '#root #wallet_name',
      type: 'input',
      listener: () => {
        const wallet_name = document.querySelector("#root #wallet_name").value
        const save_wallet_button = document.querySelector("#root #save_wallet")

        if(wallet_name.length > 3) {
          save_wallet_button.classList.add('btn-primary')
          save_wallet_button.classList.remove('disabled')
        } else {
          save_wallet_button.classList.remove('btn-primary')
          save_wallet_button.classList.add('disabled')
        }
      }
    },
    {
      element: '#heading #copy_address',
      listener: async() => {
        await copyText(account.address)
        await showNotification('Account address copied to clipboard.', 'info', 2000, 54)
      }
    },
    {
      element: '#root #save_wallet',
      listener: async(e) => {
        const id = e.target.dataset.id;
        const name = DOMPurify.sanitize(document.querySelector("#root #wallet_name").value)
        const switch_account = switch_account_el?.checked === true

        await accounts_store.asyncSet(id, {
          ...account,
          name
        })

        await updateAccounts(switch_account ? id : null)

        await showNotification('Account data saved successfully.', 'success', 2000, 58)
      }
    },
    {
      element: '#root #delete_wallet',
      listener: async() => {
        document.querySelector("#delete_modal").classList.add('fade')
        document.querySelector("#delete_modal").classList.add('show')
      }
    },
    {
      element: '#root #go_kyc',
      listener: () => {
        if(kyc_level) {
          if(kyc_level === '4') {
            return goToScreen('kycAccreditedScreen', {
              account_id: account_id
            })
          }

          if(kyc_level === '2' || kyc_level === '3') {
            return goToScreen('kycAdvancedScreen', {
              account_id: account_id,
              kyc_level: kyc_level
            })
          }

          return goToScreen('kycBasicScreen', {
            account_id: account_id
          })
        } else {
          return goToScreen('kycStartScreen', {
            account_id: account_id
          })
        }
      }
    },
    {
      element: '#root #hide_modal',
      listener: () => {
        document.querySelector("#delete_modal").classList.remove('fade')
        document.querySelector("#delete_modal").classList.remove('show')
      }
    },
    {
      element: '#root #confirm_delete_wallet',
      listener: async(e) => {
        const id = e.target.dataset.id;

        accounts_store.remove(id, async() => {
          await updateAccounts()
          await goToScreen('accountManageScreen', {}, true)
          await showNotification('Account deleted successfully.', 'info', 2000, 58)
        })
      }
    }
  ])
}