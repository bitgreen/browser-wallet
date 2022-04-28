# Browser-Wallet
BitGreen Browser extension with wallet functionalities.

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
- Stakes/Unstakes funds
- Authentication by signing (new)

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
 // authenticate signing a random message and calling back a function once the authentication token is available in the sessionvariable "BrowserWalletToken"
BW.authenticate(callbackauthentication);
```

For a working page, please check [examples_webpage.html](examples_webpage.html)














