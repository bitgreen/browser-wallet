import EventEmitter from 'eventemitter3';

let sendRequest

class PostMessageProvider {
  #eventemitter;

  isClonable = true;

  // Whether or not the actual extension background provider is connected
  #isConnected = false;

  constructor(_sendRequest) {
    this.#eventemitter = new EventEmitter();

    sendRequest = _sendRequest;
  }

  clone() {
    return new PostMessageProvider(sendRequest);
  }

  async connect() {
    // FIXME This should see if the extension's state's provider can disconnect
    console.error('PostMessageProvider.disconnect() is not implemented.');
  }

  async send(method, params) {
    return sendRequest('pub(rpc.send)', { method, params });
  }
}

export default PostMessageProvider