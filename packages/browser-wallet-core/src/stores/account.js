import BaseStore from "./base.js";

class AccountStore extends BaseStore {
    constructor() {
        super('account');
    }

    getByAddress(address, update) {
        if(!address) return update(null)

        this.asyncAll().then(all_accounts => {
            for(const account of all_accounts) {
                if(account.value.address.toLowerCase() === address.toString().toLowerCase()) {
                    update(this.asyncGet(account.key))
                }
            }

            update(null)
        })
    }

    async asyncGetByAddress(address) {
        return new Promise((resolve) => {
            this.getByAddress(address, resolve);
        });
    }

    async exists() {
        return await this.asyncTotal() > 0
    }

    async current() {
        if(!await this.exists()) return false

        let current_id = await this.asyncGet('current')
        let account = await this.asyncGet(current_id)

        if(!current_id || !account) {
            current_id = 'main'
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

    all(update, exclude = []) {
        this.allMap((map) => {
            let items = []

            for(const [key, value] of Object.entries(map)) {
                if(!exclude.includes(key)) items.push({key, value})
            }

            // Sort accounts by key. Keep 'main' at the top.
            items.sort((a, b) => {
                if(a.key === 'main') {
                    return -1
                } else {
                    if(parseInt(a.key) < parseInt(b.key)) {
                        return -1
                    }

                    if(parseInt(a.key) > parseInt(b.key)) {
                        return 1
                    }
                }

                return 0
            })

            update(items)
        });
    }
    async asyncAll() {
        return new Promise((resolve) => {
            this.all(resolve, ['current']);
        });
    }

    async nextId() {
        let next_id = 0
        for(const account of await this.asyncAll()) {
            if(parseInt(account?.key) >= next_id) {
                next_id = parseInt(account?.key) + 1
            }
        }

        return next_id.toString()
    }
}

export default AccountStore