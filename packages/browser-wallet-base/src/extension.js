import userInterface from '@bitgreen/browser-wallet-ui'
import { databaseService } from '@bitgreen/browser-wallet-core'

const db = new databaseService()
const ui = new userInterface(db)
console.log('asfasf')

const extension = async() => {
    console.log('here')
    await ui.initUi()
    console.log('here')


    if(await db.stores.accounts.exists()) {
        await ui.goToScreen('portfolioScreen')
    } else {
        if(await db.stores.settings.asyncGet('skip_intro')) {
            await ui.goToScreen('walletScreen')
        } else {
            await ui.goToScreen('welcomeScreen')
        }
    }
}

extension().then()
// document.addEventListener('DOMContentLoaded', async function () {
//     await extension()
// })