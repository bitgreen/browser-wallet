import { initUi, goToScreen } from '@bitgreen/browser-wallet-ui'
import { databaseService } from '@bitgreen/browser-wallet-core'

const db = new databaseService()

const extension = async() => {
    await initUi()

    if(await db.stores.accounts.exists()) {
        await goToScreen('portfolioScreen')
    } else {
        if(await db.stores.settings.asyncGet('skip_intro')) {
            await goToScreen('walletScreen')
        } else {
            await goToScreen('welcomeScreen')
        }
    }
}

extension().then(response => {
    // console.log('welcome')
})