## Authentication Server
The server side should authenticate the token verifying the address against the signature/message.  
There is a authentication server based on nodejs/express to show how to verify the signature:
[Authentication Server](../authentication-server/)

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
