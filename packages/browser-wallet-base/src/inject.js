class BitgreenWalletPlaceholder {
  provider = undefined;
  isBitgreenWallet = true;
  connected = false;
  isConnected = () => false;
  __waitProvider = async() => {
    const self = this;
    if(self.provider) {
      return self.provider;
    } else {
      return await new Promise((resolve, reject) => {
        let retry = 0;
        const interval = setInterval(() => {
          if(++retry > 30) {
            clearInterval(interval);
            reject(new Error('BitgreenWallet provider not found'))
          }
          if(self.provider) {
            clearInterval(interval);
            resolve(self.provider)
          }
        }, 100);
      })
    }
  }

  on() {
    this.__waitProvider().then((provider) => {
      provider.on(...arguments);
    });
  }

  off() {
    this.__waitProvider().then((provider) => {
      provider.off(...arguments);
    });
  }

  addListener() {
    this.__waitProvider().then((provider) => {
      provider.addListener(...arguments);
    });
  }

  removeListener() {
    this.__waitProvider().then((provider) => {
      provider.removeListener(...arguments);
    });
  }

  removeAllListeners() {
    this.__waitProvider().then((provider) => {
      provider.removeAllListeners(...arguments);
    });
  }

  async request() {
    const provider = await this.__waitProvider();
    return await provider.request(...arguments);
  }

  async send() {
    const provider = await this.__waitProvider();
    return await provider.send(...arguments);
  }

  async sendAsync() {
    const provider = await this.__waitProvider();
    return await provider.sendAsync(...arguments);
  }
}


window.BitgreenWallet = new Proxy(new BitgreenWalletPlaceholder(), {
  get(obj, prop) {
    if(prop === 'provider') {
      return undefined;
    }

    if(obj.provider) {
      return Reflect.get(obj.provider, prop);
    } else {
      return Reflect.get(obj, prop);
    }
  }
})