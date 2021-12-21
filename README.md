# browser-wallet
BitGreen Browser extension for Multichain wallet functionalities.
Features:
- New Account creation with 24 secret words (also defined secret seed).  
- Stores the secret words in an encrypted structure in the permanent storage of the browser.  
- 1 layer encryption by [NACL](https://nacl.cr.yp.to) for 256 bit.
- 1 layer encryption by AES256-CRT with a different key of 256 bit.
- 1 layer encryption by AES256-OFB with a different key of 256 bit.
- Total key lenght is 768 bit derived from the password by thousands of nested hashes of Sha512, Blake2  and Kekkak.  
- Derives the encryption password by random init vector and 900,000 recurring hashing with sha2,kekkak and blake2 algorithms.  
- Shows current balance from the blockchain.  
- Transfers Funds bu signing the transaction.
- Shows account address to receive funds.

Ref:  
for Encryption:
https://nacl.cr.yp.to  
https://www.npmjs.com/package/@polkadot/util-crypto/  
https://github.com/sshcrack/aes-password  
https://github.com/F4stHosting/F4st_Crypt/  

