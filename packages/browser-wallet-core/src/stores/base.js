import {isFirefox, isIOs, isSafari} from "@bitgreen/browser-wallet-utils";

const current_browser = (isFirefox() || isSafari()) ? browser : chrome

class BaseStore {
    #prefix = '';

    constructor(prefix) {
        this.#prefix = prefix ? `${prefix}:` : '';
    }

    get(_key, update) {
        const key = `${this.#prefix}${_key}`;

        current_browser.storage.local.get([key], (result) => {
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

        current_browser.storage.local.remove(key, () => {
            lastError('remove');

            update && update();
        });
    }

    set(_key, value, update) {
        const key = `${this.#prefix}${_key}`;

        current_browser.storage.local.set({ [key]: value }, () => {
            lastError('set');

            update && update();
        });
    }

    async asyncSet(_key, value) {
        return new Promise((resolve) => {
            this.set(_key, value, resolve);
        });
    }

    all(update, exclude = []) {
        this.allMap((map) => {
            let items = []

            for(const [key, value] of Object.entries(map)) {
                if(!exclude.includes(key)) items.push({key, value})
            }

            update(items)
        });
    }

    async asyncAll() {
        return new Promise((resolve) => {
            this.all(resolve);
        });
    }

    allMap(update) {
        current_browser.storage.local.get(null, (result) => {
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
    const error = current_browser.runtime.lastError;

    if(error) {
        console.error(`BaseStore.${type}:: runtime.lastError:`, error);
    }
};

export default BaseStore