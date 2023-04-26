import BaseStore from "./base.js";

class AssetStore extends BaseStore {
  constructor(network, account) {
    const network_name = network.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^-+|-+$/g, '')

    super('asset_' + network_name + '_' + account.address)

    this.network = network
    this.account = account
  }

  async fetch() {
    if(!['mainnet', 'testnet'].includes(this.network.id)) return false;

    const url = this.network.api_endpoint + '/asset/transactions?account=' + this.account.address;
    let result = await fetch(url, {
      mode: 'cors',
      credentials: 'include',
    })
    result = await result.json()

    for(const asset of result) {
      await this.asyncSet(asset.id, asset)
    }

    return result
  }
}

export default AssetStore;
