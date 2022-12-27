import BaseStore from "./base.js";

class AccountStore extends BaseStore {
    constructor() {
        super('account');
    }

    async exists() {
        return await this.asyncTotal() > 0
    }

    async current() {
        if(!await this.exists()) return false

        let current_id = await this.asyncGet('current')
        let account = await this.asyncGet(current_id)

        if(!current_id || !account) {
            current_id = '0'
            await this.asyncSet('current', current_id)
        }

        account = await this.asyncGet(current_id)

        return {
            id: current_id,
            name: '',
            address: '',
            ...account
        }
    }

    async asyncAll() {
        return new Promise((resolve) => {
            this.all(resolve, ['current']);
        });
    }

    async nextId() {
        let next_id = null
        for(const account of await this.asyncAll()) {
            if(parseInt(account?.key) >= next_id) {
                next_id = parseInt(account?.key) + 1
            }
        }

        return next_id
    }
}

export default AccountStore