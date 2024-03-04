import { databaseService, polkadotApi } from '@bitgreen/browser-wallet-core'
import userInterface, { showNotification } from '@bitgreen/browser-wallet-ui'

const db = new databaseService()
const ui = new userInterface()

const extension = async() => {
  await db.ensureInit()

  await ui.initUi()

  // preload polkadot api
  const polkadotApiReady = await polkadotApi(true)

  if(!polkadotApiReady) {
    return setTimeout(() => {
      polkadotApi(true).then(async(api_ready) => {
        if(!api_ready) {
          return await ui.goToScreen('connectionErrorScreen')
        }

        await extension()
      })
    }, 2000)
  }

  const params = new URLSearchParams(window.location.search)

  const command = params.has('command') ? params.get('command') : null

  if(command === 'new_wallet') {
    return await ui.goToScreen('walletCreateScreen')
  }

  // Break if there is no wallet created/imported, and return to welcome screen.
  if(!await db.stores.wallets.exists()) {
    if(await db.stores.settings.asyncGet('skip_intro')) {
      if(!params.has('popup')) {
        await showNotification('You need a wallet to perform this action. Please create or import one.', 'alert', 2000)
      }
      return await ui.goToScreen('walletScreen', {}, true)
    } else {
      return await ui.goToScreen('welcomeScreen')
    }
  }

  if(command === 'sign_in' && params.get('origin')) {
    return await ui.goToScreen('signInScreen', {
      message_id: params.get('id'),
      tab_id: params.get('tab_id'),
      domain: params.get('origin'),
      title: params.get('title')
    })
  }

  if(command === 'send') {
    return await ui.goToScreen('assetSendScreen', {
      message_id: params.get('id'),
      tab_id: params.get('tab_id'),
      kill_popup: params.get('kill_popup'),
      amount: params.get('amount'),
      recipient: params.get('recipient')
    })
  }

  if(command === 'extrinsic') {
    return await ui.goToScreen('extrinsicSendScreen', {
      message_id: params.get('id'),
      tab_id: params.get('tab_id'),
      kill_popup: params.get('kill_popup'),
      domain: params.get('domain'),
      title: params.get('title'),
      pallet: params.get('pallet'),
      call: params.get('call'),
      call_parameters: params.get('call_parameters')
    })
  }

  return await ui.goToScreen('dashboardScreen')
}

extension().then()
