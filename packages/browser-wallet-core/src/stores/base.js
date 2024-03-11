import { customReviver, getCurrentBrowser, isStandaloneApp } from '@bitgreen/browser-wallet-utils';
import { Preferences } from '@capacitor/preferences';

const current_browser = getCurrentBrowser();

class BaseStore {
  #prefix = '';

  constructor(prefix) {
    this.#prefix = prefix ? `${prefix}:` : '';
  }

  async get(key) {
    let value;
    if(key) {
      key = `${this.#prefix}${key.toString().toLowerCase()}`;
      if(isStandaloneApp()) {
        value = await Preferences.get({key});
        if(value) {
          try {
            value = JSON.parse(value.value, customReviver);
          } catch(e){}
        }
      } else {
        value = await current_browser.storage.local.get([key]);
        lastError('get');
        try {
          value = value[key];
        } catch(e){}
      }
    }

    return value;
  }

  async remove(key) {
    key = `${this.#prefix}${key.toString().toLowerCase()}`;
    if(isStandaloneApp()) {
      return Preferences.remove({key});
    } else {
      await current_browser.storage.local.remove(key);
      lastError('remove');
    }
  }

  async removeAll() {
    for(const record of await this.all()) {
        this.remove(record.key)
    }
  }

  async set(key, value) {
    key = `${this.#prefix}${key.toString().toLowerCase()}`;
    if(isStandaloneApp()) {
      return Preferences.set({
        key,
        value: JSON.stringify(value)
      })
    } else {
      await current_browser.storage.local.set({ [key]: value });
      lastError('set');
    }
  }

  async all(exclude = []) {
    let map = await this.allMap()
    let items = []

    for(const [key, value] of Object.entries(map)) {
      if(!exclude.includes(key)) items.push({key, value});
    }

    return items;
  }

  async allMap() {
    let keys;
    if(isStandaloneApp()) {
      keys = await Preferences.keys();
      keys = keys.keys;
    } else {
      keys = await current_browser.storage.local.get();
      lastError('all');
      try {
        keys = Object.keys(keys);
      } catch(e){}
    }
    let map = {};
    
    if(keys) {
      for(const key of keys) {
        if(this.#prefix && key.startsWith(this.#prefix)) {
          let _key = key.replace(this.#prefix, '');
          let value = await this.get(_key);
          map[_key] = value;
        }
      }
    }
    
    return map;
  }

  async total() {
    let map = await this.allMap();
    return Object.keys(map).length
  }
}

const lastError = (type) => {
  const error = current_browser.runtime.lastError;

  if(error) {
    console.error(`BaseStore.${type}:: runtime.lastError:`, error);
  }
}

export default BaseStore