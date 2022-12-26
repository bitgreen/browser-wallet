import BaseStore from "./base.js";
import { isFirefox } from "@bitgreen/browser-wallet-utils";

const current_browser = isFirefox() ? browser : chrome

class SessionStore extends BaseStore {
    constructor() {
        super('');
    }

    get(_key, update) {
        const key = `${_key}`;

        current_browser.storage.session.get([key], (result) => {
            lastError('get');

            update(result[key]);
        });
    }

    remove(_key, update) {
        const key = `${_key}`;

        current_browser.storage.session.remove(key, () => {
            lastError('remove');

            update && update();
        });
    }

    set(_key, value, update) {
        const key = `${_key}`;

        current_browser.storage.session.set({ [key]: value }, () => {
            lastError('set');

            update && update();
        });
    }

    allMap(update) {
        current_browser.storage.session.get(null, (result) => {
            lastError('all');

            const entries = Object.entries(result);
            const map = {};

            for(let i = 0; i < entries.length; i++) {
                const [key, value] = entries[i];

                map[key] = value;
            }

            update(map);
        });
    }
}

const lastError = (type) => {
    const error = current_browser.runtime.lastError;

    if(error) {
        console.error(`SessionStore.${type}:: runtime.lastError:`, error);
    }
};

export default SessionStore