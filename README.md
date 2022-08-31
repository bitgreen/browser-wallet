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


## BrowserWallet.js
A library to facilitate the usage of the extension has been created. Currently it supports the following functions callable from a web page.  
From a web page you can request to :  
- Transfer Funds.
- Sign an authentication (and get a security token).

For example:
```html
<!-- include the library before using it -->
<script type="text/javascript" src="BrowserWallet.js"></script>
```
```js
// create the class object
let BW= new BrowserWallet();
// send 1 BBB to a recipient 5HVfcSujPyT2hisdLDQhHXzCDx2e37UBM3h9fW65qkHx4FbN
BW.send("5HVfcSujPyT2hisdLDQhHXzCDx2e37UBM3h9fW65qkHx4FbN",1);
 // authenticate signing a random message and calling back 
 // a function once the authentication token is available 
 // in the sessionvariable "BrowserWalletToken"
BW.authenticate(callbackauthentication);
```

For a working page, please check [examples_webpage.html](examples_webpage.html)

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

