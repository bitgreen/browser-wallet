import BaseStore from "./base.js";

class AssetStore extends BaseStore {
  constructor() {
    super('asset');
  }

  async fetch(account) {
    const url = 'https://api-testnet.bitgreen.org/assets/transaction?account=' + account.address;
    let result = await fetch(url);
    result = await result.json();
    await this.asyncSet('asset', result);
    return result;
  }
}

export default AssetStore;
