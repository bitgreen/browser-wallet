# Bitgreen Browser Wallet
Bitgreen Browser extension with wallet functionalities.

The Bitgreen Browser Wallet is a browser extension that allows users to create wallets, send and receive funds, and make disbursements to the Bitgreen ecosystem in order to create, sell, purchase and retire Verified Carbon Credits (VCUs). To incorporate this functionality into your own project, please see the technical description below. If you require any assistance using these features, or this repo, please contact us at [contact], we are happy to assist.

### Features:
- New Account creation with 24 secret words (also defined secret seed).  
- Stores the secret words in an encrypted structure in the permanent storage of the browser.  
- 1 layer encryption by AES256-OFB with a first key of 256 bit.
- 1 layer encryption by AES256-CRT with a different key of 256 bit.
- 1 layer encryption by AES256-OFB with a different key of 256 bit.
- Total key length is 768 bit derived from the password by thousands of nested hashes of Sha512, Blake2  and Kekkak.  
- Derives the encryption password by random init vector and 900,000 recurring hashing with sha2,kekkak and blake2 algorithms.  
- Shows current balance from the blockchain.  
- Transfer Funds by signing the transaction.
- Shows account address to receive funds.
- Import of an existing secret seed
- Creation of additional Accounts
- Programmatically calls to any pallet with signed transactions
- Stakes/Unstakes funds
- Authentication by signing a random token
___

## Browser Compatibility
The wallet extension is available for the following browsers:  
- Chrome
- Firefox 
- Safari (Desktop and Mobile version)
- Edge (compatible with Chrome Extension)
- Brave (compatible with Chrome Extension)
- Other Browsers based on Chrome Engine
___

## Project Structure
- **packages/browser-wallet-base** - Extension base structure.
- **packages/browser-wallet-core** - Main features mostly used for background tasks, stores, API messaging.
- **packages/browser-wallet-ui** - The UI components for the extension.
- **packages/browser-wallet-utils** - Helpers and utilities for both UI and background.
___

## Developing & Building

First install required dependencies from root for this repo, by running the following command:
```bash
npm install
```
### Production Build
You can build all versions of extensions, and output will be located at `/build` directory, where each sub folder represents each browser extension type:
```bash
npm build
```
You can also specify which version to build. There is 3 possible versions of this extension: `chrome`, `firefox` and `safari`.
```bash
npm build:chrome
```
___
### Development
Also, you can use the `npm run dev:chrome` to start the local development of the extension. Please keep in mind that in this case, you need to specify browser type.
Webpack will be running with `--watch` flag set to true. Output directory is the same (read above).
___

## Wallet Docs
#### Check out set of [examples](examples.html).
Wallet automatically injects into a webpage when installed within the browser.
All Supported functions are listed below.
___
### Authenticate wallet account by signing a message
````javascript
// No params
signIn()
````
Check how to setup your own [authentication server](authentication-server/readme.md).
___
### Transfer funds to another address
````javascript
// amount: number = amount to send, in human-readable format
// recipient: substrateAddress = address of a recipient
// kill_popup: boolean = should popup be closed in case origin tab was closed 
send(amount = 0, recipient = false, kill_popup = true)
````
___
### Submit a transaction to the blockchain (extrinsic)
````javascript
// pallet: string = name of the pallet
// call: string = function to execute on this pallet
// call_parameters: array = parameters for this call
// kill_popup: boolean = should popup be closed in case origin tab was closed
extrinsic(pallet, call, call_parameters, kill_popup = true)
````
___
### Query any pallet/contract in the blockchain
````javascript
// same params as for extrinsic(), without kill_popup
query(pallet, call, call_parameters)
````
___

### Check if the wallet is installed
After window object load, you can check if the wallet injection code is there.
That way we can know if the user has the extension installed or not.
```javascript
window.addEventListener('load', async() => {
    // undefined if wallet extension is not installed
    const bitgreen_wallet = window.injectedWeb3?.['bitgreen-wallet-js']
});
```