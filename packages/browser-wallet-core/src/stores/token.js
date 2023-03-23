import BaseStore from "./base.js";

class TokenStore extends BaseStore {
  constructor(network, account) {
    const network_name = network.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^-+|-+$/g, '')

    super('token_' + network_name + '_' + account.address)

    this.network = network
    this.account = account
  }

  async fetch() {
    if(!['mainnet', 'testnet'].includes(this.network.id)) return false;

    const url = this.network.api_endpoint + '/tokens/transaction?account=' + this.account.address;
    let result = await fetch(url)
    result = await result.json()

    for(const token of result) {
      await this.asyncSet(token.id, token)
    }

    return result
  }
}

export default TokenStore