import { AccountStore, SessionStore, SettingsStore, CacheStore, WalletStore } from '../stores/index.js'
import NetworkStore from "../stores/network.js";

class DatabaseService {
    constructor() {
        this.stores = {}
    }

    async init() {
        const networks_store = new NetworkStore();

        const current_network = await networks_store.current();

        const cache_store = new CacheStore(current_network);

        this.stores = {
            accounts: new AccountStore(),
            session: new SessionStore(),
            settings: new SettingsStore(),
            wallets: new WalletStore(),
            networks: networks_store,
            cache: cache_store
        };
    }

    async ensureInit() {
        if (Object.keys(this.stores).length === 0) {
            await this.init();
        }
    }
}

export default DatabaseService