import { AccountStore, SessionStore, SettingsStore, CacheStore, WalletStore } from '../stores/index.js'
import NetworkStore from "../stores/network.js";

class DatabaseService {
    constructor() {
        this.init()
    }

    init() {
        const networks_store = new NetworkStore()

        networks_store.current().then(current_network => {
            const cache_store = new CacheStore(current_network)

            this.stores = {
                accounts: new AccountStore(),
                session: new SessionStore(),
                settings: new SettingsStore(),
                wallets: new WalletStore(),
                networks: networks_store,
                cache: cache_store
            }
        })
    }
}

export default DatabaseService