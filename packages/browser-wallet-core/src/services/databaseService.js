import { AccountStore, SessionStore, SettingsStore, WalletStore } from '../stores/index.js'

class DatabaseService {
    constructor() {
        this.stores = {
            accounts: new AccountStore(),
            session: new SessionStore(),
            settings: new SettingsStore(),
            wallets: new WalletStore()
        }
    }
}

export default DatabaseService