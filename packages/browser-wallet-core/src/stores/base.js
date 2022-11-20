class BaseStore {
    #prefix = '';

    constructor(prefix) {
        this.#prefix = prefix ? `${prefix}:` : '';
    }

    get(_key, update) {
        const key = `${this.#prefix}${_key}`;

        chrome.storage.local.get([key], (result) => {
            lastError('get');

            update(result[key]);
        });
    }

    async asyncGet(_key) {
        return new Promise((resolve) => {
            this.get(_key, resolve);
        });
    }

    remove(_key, update) {
        const key = `${this.#prefix}${_key}`;

        chrome.storage.local.remove(key, () => {
            lastError('remove');

            update && update();
        });
    }

    set(_key, value, update) {
        const key = `${this.#prefix}${_key}`;

        chrome.storage.local.set({ [key]: value }, () => {
            lastError('set');

            update && update();
        });
    }

    all(update) {
        this.allMap((map) => {
            Object.entries(map).forEach(([key, value]) => {
                update(key, value);
            });
        });
    }

    async asyncAll() {
        return new Promise((resolve) => {
            this.all(resolve);
        });
    }

    allMap(update) {
        chrome.storage.local.get(null, (result) => {
            lastError('all');

            const entries = Object.entries(result);
            const map = {};

            for(let i = 0; i < entries.length; i++) {
                const [key, value] = entries[i];

                if(key.startsWith(this.#prefix)) {
                    map[key.replace(this.#prefix, '')] = value;
                }
            }

            update(map);
        });
    }

    async asyncAllMap() {
        return new Promise((resolve) => {
            this.allMap(resolve);
        });
    }

    total(update) {
        this.allMap((map) => {
            update(Object.keys(map).length)
        });
    }

    async asyncTotal() {
        return new Promise((resolve) => {
            this.total(resolve);
        });
    }
}

const lastError = (type) => {
    const error = chrome.runtime.lastError;

    if(error) {
        console.error(`BaseStore.${type}:: runtime.lastError:`, error);
    }
};

export default BaseStore