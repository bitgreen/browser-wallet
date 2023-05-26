import BaseStore from "./base.js";

class CacheStore extends BaseStore {
    constructor(network = null) {
        let network_name = 'global'
        if(network && network.name) {
            network_name = network.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '_')
                .replace(/^-+|-+$/g, '')
        }

        super('cache_' + network_name);

        this.network = network
    }
}

export default CacheStore