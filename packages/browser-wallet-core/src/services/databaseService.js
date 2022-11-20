import { AccountStore, SettingsStore } from '../stores/index.js'

class DatabaseService {
    constructor() {
        this.stores = {
            accounts: new AccountStore(),
            settings: new SettingsStore()
        }
    }
}

export default DatabaseService