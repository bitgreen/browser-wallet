    //**************************************************************
    // Class to use the function offered from the Browser Wallet
    // function with # are private 
    // vers. 1.0
    //**************************************************************
    class BitgreenWallet{
        // constructor definition
        BWtimeout;
        BWcallback;
        constructor() {
            this.BWtimeout =0;
        }
        // transfer BBB
        transfer(recipient,amount,callback) {
            // set to zero the timeout
            this.BWtimeout=0;   
            this.BWcallback=callback;
            // remove session
            sessionStorage.removeItem("BrowserWalletTransfer");
            // call Extension for the transfer
            window.postMessage({ 
                type: "BROWSER-WALLET", 
                command: "transfer",
                recipient: recipient,
                amount: amount }, window.location.href);
            this.waitfortransfer();
        }
        // send BBB old version
        send(recipient,amount) {
            // call Extension for the transfer
            window.postMessage({ type: "BROWSER-WALLET", command: "transfer",recipient: recipient,amount: amount }, window.location.href);
        }
        // submit any kind of Extrinsic without transferring funds and no answer (legacy version)
        tx(pallet, call, parameters) {
            // call Extension for the extrinsic submission
            window.postMessage({
                type: "BROWSER-WALLET",
                command: "tx",
                pallet: pallet,
                call: call,
                parameters: parameters
            }, window.location.href);
        }
        // make a qquery to any pallet on chain
        querypallet(pallet, call, parameters,callback) {
            //set to zero the timeout
            this.BWtimeout=0;   
            this.BWcallback=callback;
            // remove session
            sessionStorage.removeItem("BrowserWalletQuery");
            window.postMessage({
                type: "BROWSER-WALLET",
                command: "querypallet",
                pallet: pallet,
                call: call,
                parameters: parameters
            }, window.location.href);
            
            this.waitforquery();
        }
        // submit any kind of Extrinsic without transferring funds and getting a call back to a function for the result
        txpallet(pallet, call, parameters,callback) {
        // set to zero the timeout
            this.BWtimeout=0;   
            this.BWcallback=callback;
            // remove session
            sessionStorage.removeItem("BrowserWalletTxPallet");
            // call Extension for the extrinsic submission
            window.postMessage({
                type: "BROWSER-WALLET",
                command: "txpallet",
                pallet: pallet,
                call: call,
                parameters: parameters
            }, window.location.href);
            this.waitfortx();
        }
        
        // authenticate for login,it generate a random message to be signed because signing a text received from the web page can be used for social engineering attacks
        authenticate(callback) {
            // remove session
            //sessionStorage.removeItem("bitgreenwallet");
            sessionStorage.removeItem("BrowserWalletToken");
            // set to zero the timeout
            this.BWtimeout=0;   
            this.BWcallback=callback;
            // call the extension to confirm the signature
            window.postMessage({ type: "BROWSER-WALLET", command: "signin"}, window.location.href);
            this.waitforsignature();
        }
        // open portfolio
        portfolio() {
            // call Extension for the transfer
            window.postMessage({ type: "BROWSER-WALLET", command: "portfolio" }, window.location.href);
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
                setTimeout(() => { this.waitforsignature();},1000);//wait 1 second and check again
                 this.BWtimeout=this.BWtimeout+1;
                return;
            }else {
                // execute the call back function
                this.BWtimeout=0;
                // execute call back
                if( this.BWcallback && typeof this.BWcallback == "function" )
                    this.BWcallback.call();
                return;
            }
        }
        // we use a session variable because of security constraint to read it from the library code.
        // we would have preferred to pass it back as parameters but not possible.
        // private function to wait for transfer result
        waitfortransfer() {
            // exit for timeout of 60 seconds
            if(this.BWtimeout>=60){
                this.BWtimeout=0;
                console.log("Timeout in transaction");
                return;            
            }
            //check if the session variable has been set
            if(sessionStorage.getItem("BrowserWalletTransfer")===null) {
                //wait 1 second and check again
                setTimeout(() => { this.waitfortransfer();},1000);//wait 1 second and check again
                 this.BWtimeout=this.BWtimeout+1;
                return;
            }else {
                // execute the call back function
                this.BWtimeout=0;
                // execute call back
                if( this.BWcallback && typeof this.BWcallback == "function" )
                    this.BWcallback.call();
                return;
            }
        }
        // private function to wait for pallet extrinsic result
        waitfortx() {
            // exit for timeout of xx seconds
            if(this.BWtimeout>=120){
                this.BWtimeout=0;
                console.log("Timeout in transaction");
                return;            
            }
            //check if the session variable has been set
            if(sessionStorage.getItem("BrowserWalletTxPallet")===null) {
                //wait 1 second and check again
                setTimeout(() => { this.waitfortx();},1000);//wait 1 second and check again
                 this.BWtimeout=this.BWtimeout+1;
                return;
            }else {
                // execute the call back function
                this.BWtimeout=0;
                // execute call back
                if( this.BWcallback && typeof this.BWcallback == "function" )
                    this.BWcallback.call();
                return;
            }
        }
        // private function to wait for pallet extrinsic result
        waitforquery() {
            // exit for timeout of xx seconds
            if(this.BWtimeout>=120){
                this.BWtimeout=0;
                console.log("Query Call Back - Timeout error");
                return;            
            }
            //check if the session variable has been set
            if(sessionStorage.getItem("BrowserWalletQuery")===null) {
                //wait 1 second and check again
                setTimeout(() => { this.waitforquery();},1000);//wait 1 second and check again
                 this.BWtimeout=this.BWtimeout+1;
                return;
            }else {
                // execute the call back function
                this.BWtimeout=0;
                // execute call back
                if( this.BWcallback && typeof this.BWcallback == "function" )
                    this.BWcallback.call();
                return;
            }
        }

    }
    // end class BitgreenWallet
