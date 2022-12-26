import BaseStore from "./base.js";

class WalletStore extends BaseStore {
    constructor() {
        super('wallet');
    }

    async exists() {
        return await this.asyncTotal() > 0
    }
}

export default WalletStore