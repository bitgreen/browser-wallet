import BaseStore from "./base.js";

class AccountStore extends BaseStore {
    constructor() {
        super('account');
    }

    async exists() {
        return await this.asyncTotal() > 0
    }
}

export default AccountStore