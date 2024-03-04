import BaseStore from "./base.js";

class NetworkStore extends BaseStore {
  constructor() {
    super('network');
  }

  async exists() {
    return await this.asyncTotal() > 0
  }

  async current() {
    let current_id = await this.asyncGet('current')
    let network

    if(!current_id) {
      current_id = 'mainnet'
      await this.asyncSet('current', current_id)
    }

    if(current_id === 'mainnet') {
      network = {
        name: 'Mainnet',
        url: 'wss://mainnet.bitgreen.org',
        api_endpoint: 'https://api-mainnet.bitgreen.org'
      }
    } else if(current_id === 'testnet') {
      network = {
        name: 'Testnet',
        url: 'wss://testnet.bitgreen.org',
        api_endpoint: 'https://api-testnet.bitgreen.org'
      }
    } else {
      network = await this.asyncGet(current_id)
    }

    if(!network) {
      current_id = 'mainnet'
      await this.asyncSet('current', current_id)
    }

    return {
      id: current_id,
      name: '',
      url: '',
      ...network
    }
  }

  async asyncAll() {
    return new Promise((resolve) => {
      this.all(resolve, ['current']);
    });
  }

  async nextId() {
    let next_id = 1
    for(const network of await this.asyncAll()) {
      if(parseInt(network?.key) >= next_id) {
        next_id = parseInt(network?.key) + 1
      }
    }

    return next_id
  }
}

export default NetworkStore