# Browser-Wallet
BitGreen Browser extension with wallet functionalities.

The Bitgreen Browser Wallet is a browser extension that allows users to create wallets, send and receive funds, and make disbursements to the Bitgreen ecosystem in order to create, sell, purchase and retire Verified Carbon Credits (VCUs). To incorporate this functionality into your own project, please see the technical description below. If you require any assistance using these features, or this repo, please contact us at [contact], we are happy to assist.

Features:
- New Account creation with 24 secret words (also defined secret seed).  
- Stores the secret words in an encrypted structure in the permanent storage of the browser.  
- 1 layer encryption by AES256-OFB with a first key of 256 bit.
- 1 layer encryption by AES256-CRT with a different key of 256 bit.
- 1 layer encryption by AES256-OFB with a different key of 256 bit.
- Total key lenght is 768 bit derived from the password by thousands of nested hashes of Sha512, Blake2  and Kekkak.  
- Derives the encryption password by random init vector and 900,000 recurring hashing with sha2,kekkak and blake2 algorithms.  
- Shows current balance from the blockchain.  
- Transfers Funds by signing the transaction.
- Shows account address to receive funds.
- Import of an existing secret seed
- Creation of additional Accounts
- Programmatically calls to any pallet with signed transations
- Stakes/Unstakes funds
- Authentication by signing a random token

## Browser Compatibility
The wallet extension is available for the following browsers:  
- Chrome
- Firefox 
- Safari (Desktop and Mobile version)
- Edge (compatible with Chrome Extension)
- Brave (compatible with Chrome extension)
- Other Browsers based on Chrome Engine

## Project Structure
- **packages/browser-wallet-base** - Extension base structure.
- **packages/browser-wallet-core** - Main features mostly used for background tasks, stores, API messaging.
- **packages/browser-wallet-ui** - The UI components for the extension.
- **packages/browser-wallet-utils** - Helpers and utilities for both UI and background.


## Authentication Server

The server side should authenticate the token verifiyng the address against the signature/message.  
There is a an authentication server based on nodejs/express to show how to verify the signature:
[Authentication Server](authentication-server/)  

The server requires Nodejs > 16.x and npm utility installed.  

to install the dependencies launch:  
```bash
npm install
```
from the same folder where the file BrowserWallet-Authentication-Server.js is located.
to run the server:
```bash
nodejs BrowserWallet-Authentication-Server.js
```

The server will answer on port 3001 and does expect a variable "BrowserWalletToken" with POST method.  
You can test the server with the utility CURL with the server running in your local machine:
```bash
curl -X POST -H "application/x-www-form-urlencoded" -d BrowserWalletToken='{"message":"1651209684994","signature":"0xfaca8deff055379324d6d172eefb48c9f53a78b6d1612c2e7e43effd3967b4344ffc486a9dc9afa08a1a15f5f46cb2d2317a31aab3ada5be866bb49599d7458d","address":"5EEdVDNbCB6jYKSzxH1puaGrhd2WWk1Xs3uoxrPAqJfkrnVs","publickey":"0x600a35e55307f1afc1379bb9e32bd10f5278554e97c7dfd4d6f43559f0fdd906"}' http://localhost:3001  
```
The message content is the timestamp of the token generation. The server side should consider expired the token after some time from its generation.  
  
The token is stored in the permanent browser storage, for increased security the calling script should move it to a session cookie to let it disappear after the browser is closed. An expiring date and time may be set in the cookie.

## Build Safari
To build the safari version execute from command line from the project folder:  
```bash
./setup-safari.sh
```
The command will prepare the project to be built with Xcode.
Open the project with Xcode and click on "Build".

## Build Chrome/Edge/Brave
To build the Chrome version (compatible for Edge and Brave browsers), execute from command line from the project folder:  
```bash
./setup-chrome.sh
```
The command will prepare the project to be built built from the developer console of Chrome.  


## Build Firefox
To build the Firefox version, execute from command line from the project folder:  
```bash
./setup-firefox.sh
```
The command will prepare the project to be built built from the developer console of Firefox.  


## Library BrowserWallet.js

The library is built to be used from a web app and it allows the following functions:

1) Authenticate  
2) Query any pallet/contract in the blockchain  
3) Transfer Funds   
3) Submit a transaction to the blockchain (extrinsic)  
There is a set of examples in: [example_webpage.html](example_webpage.html)  

You should embed the library in your web page with:  
```html
<script type="text/javascript" src="BrowserWallet.js"></script>
```
You should create an instance of the class with:  
```javascript
let BW= new BrowserWallet();
```

and then you can call the following functions:


### Authenticate  
You can authenticate a wallet calling the following function:  
```javascript
BW.authenticate(callback_function);
```
for example:
```javascript
BW.authenticate(answerCallback);
function answerCallback(answer) {
        console.log("Wallet answer: ",answer);
}
```
and receive back an answer like this:
```json
 {"message":"1671084749648#https://aisland.io","signature":"0x620130fadc2298da39fb5680264873935a19ed2c329820b2d70302a087a2d43cbc0a12bba4ba3db7dc635963c1325d6a8e24033119634e9cfcc977474f1e0180","address":"5CK7H9Dq6RwhmYZGFGsnuQuiUC25k3rZsRx42J9CtmkGUWun","publickey":"0x0afc47f08d991427edd7255ae5fccc5f3ee2d5152c9d06e41f44fa87bbb25313"}
```
The authentication token should be submitted to the server side for authentication as from the example in:  
[authentication-server](authentication-server)  

### Query Blockchain State  
You can query any pallet of the blochain with the following function:  
```javascript
BW.querypallet("palletname","function_name",parameters_array,callback_function);  
```
for example you can read the balance of an account with:  
```javascript
BW.querypallet("balances","account",'["5HpZcMvM6bJgoVvC5iBeyctZ3YggsBA9J6T8KAngLomUpotU"]',answerCallback);
function answerCallback(answer) {
        console.log("Wallet answer: ",answer);
}
```

### Submit Transaction (Extrinsic)  
You can submit an extrinsic to the blockchain and get back a call back with the answer in json format.
```javascript
BW.txpallet("palletname","function_name",parameters_array,callback_function);  
```
for example to create a new asset:  
```javascript
BW.txpallet("assets","create",'[1005,"5GGoUgUtw7tvQyJ7tknapdXkmZnduJbk2RJQNPMKqe7ufRCj",1]',answerCallback); 
function answerCallback(answer) {
        console.log("Wallet answer: ",answer);
} 
```
the callback function will receive in a single parameter the answer that could be an error:
```json
{"error":"assets.InUse: The asset ID is already taken."}
```
or a the hash of the block where the transactions has been written:
```json
{"inBlock":"0x2cbec7cd195c50c89fbc0a610f26d26b8653ab9aa942c35fec8ac01bea14ac03"}
```
Please consider that in Substrate, the transaction hash is not unique only the block hash is unique and can be used to read back the transaction iterating it.

### Transfer Funds (Extrinsic)  
You can submit a funds transfer to the blockchain and get back a call back with the answer in json format.
```javascript
BW.transfer("recipientaccount",amount,answerCallback);
```
for example to transfer 1 BBB to an account:
```javascript
BW.transfer("5HVfcSujPyT2hisdLDQhHXzCDx2e37UBM3h9fW65qkHx4FbN",1,answerCallback);
function answerCallback(answer) {
        console.log("Wallet answer: ",answer);
}
```
the callback function will receive in a single parameter the answer that could be an error:
```json
{"error":"No enough funds"}
```
or a the hash of the block where the transactions has been written:
```json
{"inBlock":"0x2cbec7cd195c50c89fbc0a610f26d26b8653ab9aa942c35fec8ac01bea14ac03"}
```

Please consider that in Substrate, the transaction hash is not unique only the block hash is unique and can be used to read back the transaction iterating it.
