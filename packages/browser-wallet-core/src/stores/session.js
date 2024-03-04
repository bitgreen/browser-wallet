import BaseStore from "./base.js";
import {
  customReviver,
  getCurrentBrowser,
  isStandaloneApp
} from "@bitgreen/browser-wallet-utils";

const current_browser = getCurrentBrowser()

class SessionStore extends BaseStore {
  constructor() {
    super('');
  }

  get(_key, update) {
    const key = `${_key}`;

    if(isStandaloneApp()) {
      let value

      try {
        value = JSON.parse(sessionStorage.getItem(key), customReviver)
      } catch (e) {
        value = sessionStorage.getItem(key)
      }

      update(value)
    } else {
      current_browser.storage.session.get([key], (result) => {
        lastError('get');

        update(result[key]);
      });
    }
  }

  remove(_key, update) {
    const key = `${_key}`;

    if(isStandaloneApp()) {
      sessionStorage.removeItem(key);

      update && update()
    } else {
      current_browser.storage.session.remove(key, () => {
        lastError('remove');

        update && update();
      });
    }
  }

  set(_key, value, update) {
    const key = `${_key}`;

    if(isStandaloneApp()) {
      sessionStorage.setItem(key, JSON.stringify(value));

      update && update();
    } else {
      current_browser.storage.session.set({ [key]: value }, () => {
        lastError('set');

        update && update();
      });
    }
  }

  allMap(update) {
    if(isStandaloneApp()) {
      const map = {};

      for(let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        let value

        try {
          value = JSON.parse(localStorage.getItem(key), customReviver)
        } catch (e) {
          value = localStorage.getItem(key)
        }

        map[key] = value;
      }

      update(map);
    } else {
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
}

const lastError = (type) => {
  const error = current_browser.runtime.lastError;

  if(error) {
    console.error(`SessionStore.${type}:: runtime.lastError:`, error);
  }
};

export default SessionStore