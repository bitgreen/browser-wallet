import BaseStore from "./base.js";

class TokenStore extends BaseStore {
  constructor() {
    super('token')
  }

  async fetch(account) {
    const url = 'https://api-testnet.bitgreen.org/tokens/transaction?account=' + account.address;
    let result = await fetch(url)
    result = await result.json()
    await this.asyncSet('token', result)
    return result
  }
}

export default TokenStore