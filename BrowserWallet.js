    //**************************************************************
    // Class to use the function offered from the Browser Wallet
    // function with # are private
    //**************************************************************
    class BitgreenWallet{
        // constructor definition
        BWtimeout;
        BWcallback;
        constructor() {
            this.BWtimeout =0;
        }
        // send BBB
        send(recipient,amount) {
            // call Extension for the transfer
            window.postMessage({ type: "BROWSER-WALLET", command: "transfer",recipient: recipient,amount: amount }, window.location.href);
        }
        // submit Extrinsic
        tx(pallet,call,parameters) {
            // call Extension for the extrinsic submission
            window.postMessage({ type: "BROWSER-WALLET", command: "tx",pallet: pallet,call: call,parameters:parameters }, window.location.href);
        }
        // authenticate for login,it generate a random message to be signed because signing a text received from the web page can be used for social engineering attacks
        authenticate(callback) {
            // remove session
            sessionStorage.removeItem("bitgreenwallet");
            // set to zero the timeout
            this.BWtimeout=0;   
            this.BWcallback=callback;
            // call the extension to confirm the signature
            window.postMessage({ type: "BROWSER-WALLET", command: "signin"}, window.location.href);
            this.waitforsignature();
        }
        // private function to wait for signature
        waitforsignature() {
            // exit for timeout of 60 seconds
            if(this.BWtimeout>=60){
                this.BWtimeout=0;
                console.log("Timeout in signing");
                return;            
            }
            //check if the session variable has been set, the server side should verify the signature at evevery call.
            if(sessionStorage.getItem("BrowserWalletToken")===null) {
                //wait 1 second and check again
                setTimeout(() => { this.waitforsignature();},5000);//wait 1 second and check again
                 this.BWtimeout=this.BWtimeout+1;
                return;
            }else {
                // execute the call back function
                let t=sessionStorage.getItem("BrowserWalletToken");
                //console.log("Signup complete - Token",t);
                this.BWtimeout=0;
                // execute call back
                if( this.BWcallback && typeof this.BWcallback == "function" )
                    this.BWcallback.call();
                return;
            }
        }
    }
    // end class BitgreenWallet
