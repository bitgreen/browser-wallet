import { AccountStore, SessionStore, SettingsStore, WalletStore,AssetStore } from '../stores/index.js'

class DatabaseService {
    constructor() {
        this.stores = {
            accounts: new AccountStore(),
            session: new SessionStore(),
            settings: new SettingsStore(),
            wallets: new WalletStore(),
            assets: new AssetStore(),
        }
    }
}

export default DatabaseService