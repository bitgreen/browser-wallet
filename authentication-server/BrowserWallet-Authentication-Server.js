// Authentication Server - Example to verify the signed token from the Browser Wallet
// express is a quite famous library for http/https protocol, we use it to create a simple web server in nodejs
const express = require('express');
const bodyParser = require('body-parser');
const { cryptoWaitReady, decodeAddress, signatureVerify } = require('@polkadot/util-crypto');
const {u8aToHex} = require('@polkadot/util');


// create web server object
const app = express();

mainloop();
async function mainloop(){
    console.log("[info] - Browser Wallet/ Authentication Server - ver. 1.00 - Starting");
    //await cryptoWaitReady();
    app.use(bodyParser.urlencoded({ extended: true }));
    //check authentication
    app.post('/',async function(req, res) {
        BrowserWalletToken="";
         if (typeof req.body.BrowserWalletToken != 'undefined'){
              BrowserWalletToken=req.body.BrowserWalletToken;
              bj=JSON.parse(BrowserWalletToken);
              // verify signature
              console.log(bj);
              const publicKey = decodeAddress(bj.address);
              console.log("Public Key: ", publicKey);
              const hexPublicKey = u8aToHex(publicKey);
              console.log("Hex Public Key: ", hexPublicKey);              
              const signature=bj.signature;
              console.log("Signature: ",signature);
              const message=bj.message
              console.log("Message: ",message);
              if(signatureVerify(message, signature, hexPublicKey).isValid===true ) {
                res.send("Authentication is valid for:"+bj.address);
              }else {
                  res.send("Authentication is NOT valid for:"+bj.address);              
              }
            
         }else {
              res.send("BrowserWalletToken: "+BrowserWalletToken);        
        }
        //console.log("BrowserWalletToken: ",BrowserWalletToken);
    });
    // listening to server port
    console.log("[info] - listening for connections on port TCP/3001...");
    app.listen(3001,function() {});
}


