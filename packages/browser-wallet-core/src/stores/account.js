import BaseStore from "./base.js";

class AccountStore extends BaseStore {
  constructor() {
    super('account');
  }

  async exists() {
    return await this.total() > 0
  }

  async current() {
    if(!await this.exists()) return false

    let current_id = await this.get('current')
    let account = await this.get(current_id)

    if(!current_id || !account) {
      current_id = 'main'
      await this.set('current', current_id)
    }

    account = await this.get(current_id)

    return {
      id: current_id,
      name: '',
      address: '',
      ...account
    }
  }

  async all(exclude = ['current']) {
    let map = await this.allMap()
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
      return 
    })

    return items
  }

  async nextId() {
    let next_id = 0
    for(const account of await this.all()) {
      if(parseInt(account?.key) >= next_id) {
        next_id = parseInt(account?.key) + 1
      }
    }

    return next_id.toString()
  }
}

export default AccountStore