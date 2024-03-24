import { databaseService, appMessageHandler } from '@bitgreen/browser-wallet-core'
import userInterface from '@bitgreen/browser-wallet-ui'

import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { isAndroid, isIOs } from "@bitgreen/browser-wallet-utils";
import { StatusBar } from '@capacitor/status-bar';

// Hide the splash (you should do this on app launch)
await SplashScreen.hide();

await StatusBar.setStyle({ style: 'DARK' });

if(isAndroid()) {
  await StatusBar.setBackgroundColor({ color: '#224851' });
}

const db = new databaseService()
const ui = new userInterface()

async function extension() {
  await db.ensureInit()

  await ui.initUi()

  // Break if there is no wallet created/imported, and return to welcome screen.
  if(!await db.stores.wallets.exists()) {
    if(await db.stores.settings.get('skip_intro')) {
      return await ui.goToScreen('walletScreen')
    } else {
      return await ui.goToScreen('welcomeScreen')
    }
  }

  return await ui.goToScreen('dashboardScreen', {
    extend_delay: true
  })
}
App.addListener('appStateChange', async({ isActive }) => {
  if(isActive) {
    const logged_in = await ui.fastCheckLogin()

    if(await ui.db.stores.wallets.exists() && !logged_in) {
      await ui.showLogin(true, true)
    }

    if(isAndroid()) {
      setTimeout(() => {
        ui.hideInit(true)
      }, 600)
    } else {
      ui.hideInit(true)
    }
  } else {
    ui.showInit(true)

    // reset body
    document.body.classList.remove('keyboard-opened')

    await Keyboard.hide()
  }
});
document.addEventListener('deviceready', async() => {
  await extension()



  Keyboard.addListener('keyboardWillShow', info => {
    document.body.classList.add('keyboard-opened')

    ui.disableFooter()

    if(isIOs()) {
      const footers = document.querySelectorAll('#login_screen .footer, #root .footer')
      for(const footer of footers) {
        footer.style.paddingBottom = info.keyboardHeight + 'px'
      }
    }
  });

  Keyboard.addListener('keyboardWillHide', info => {
    document.body.classList.remove('keyboard-opened')

    // reset elements
    if(isIOs()) {
      const footers = document.querySelectorAll('#login_screen .footer, #root .footer')
      for(const footer of footers) {
        footer.style.paddingBottom = ''
      }
    }

    ui.enableFooter()
  });
}, false)

// request message
window.addEventListener('message', async(event) => {
  const data = event.data;

  if(data.source !== 'ui') return false

  return appMessageHandler(data)
});