import { AccountStore, SessionStore, SettingsStore, CacheStore, WalletStore } from '../stores/index.js'
import NetworkStore from "../stores/network.js";

class DatabaseService {
    constructor() {
        this.init().then()
    }

    async init() {
        const networks_store = new NetworkStore()
        const cache_store = new CacheStore(await networks_store.current())

        this.stores = {
            accounts: new AccountStore(),
            session: new SessionStore(),
            settings: new SettingsStore(),
            wallets: new WalletStore(),
            networks: networks_store,
            cache: cache_store
        }
    }
}

export default DatabaseService