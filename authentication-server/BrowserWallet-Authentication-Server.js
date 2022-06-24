// Authentication Server - Example to verify the signed token from the Browser Wallet
// express is a quite famous library for http/https protocol, we use it to create a simple web server in nodejs
const express = require('express');
const bodyParser = require('body-parser');
const RateLimit = require('express-rate-limit');
const { cryptoWaitReady, signatureVerify } = require('@polkadot/util-crypto');
const {stringToU8a,hexToU8a} = require('@polkadot/util');
// set limit of authentication from the same ip address
const limiter = RateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 5
});

// create web server object
let app = express();
// apply rate limiter to all requests
app.use(limiter);

mainloop();
async function mainloop(){
    console.log("[info] - Browser Wallet/ Authentication Server - ver. 1.00 - Starting");
    await cryptoWaitReady();
    app.use(bodyParser.urlencoded({ extended: true }));
    //check authentication
    app.post('/',async function(req, res) {
        BrowserWalletToken="";
         if (typeof req.body.BrowserWalletToken != 'undefined'){
              BrowserWalletToken=req.body.BrowserWalletToken;
              bj=JSON.parse(BrowserWalletToken);
              // verify signature
              const signature=hexToU8a(bj.signature);
              const message=stringToU8a(bj.message)
              if(signatureVerify(message, signature,bj.address).isValid) {
                res.send("Authentication is valid for:"+bj.address);
              }else {
                res.send("Authentication is NOT valid for:"+bj.address);              
              }
            
         }else {
              res.send("BrowserWalletToken has not been received");        
        }
    });
    // listening to server port
    console.log("[info] - listening for connections on port TCP/3001...");
    app.listen(3001,function() {});
}


