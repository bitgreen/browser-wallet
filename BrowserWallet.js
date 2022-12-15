    //**************************************************************
    // Class to use the function offered from the Browser Wallet
    // function with # are private 
    // vers. 1.0
    //**************************************************************
    class BrowserWallet{
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
            this.waitforanswer("BrowserWalletTransfer");
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
            this.waitforanswer("BrowserWalletQuery");
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
            this.waitforanswer("BrowserWalletTxPallet");
        }
        
        // authenticate for login,it generate a random message to be signed because signing a text received from the web page can be used for social engineering attacks
        authenticate(callback) {
            // remove session
            sessionStorage.removeItem("BrowserWalletToken");
            // set to zero the timeout
            this.BWtimeout=0;   
            this.BWcallback=callback;
            // call the extension to confirm the signature
            window.postMessage(
                { type: "BROWSER-WALLET", 
                  command: "signin"
                }, window.location.href);
            this.waitforanswer("BrowserWalletToken");
        }
        // open portfolio
        portfolio() {
            // call Extension to open the portfolio
            window.postMessage({ type: "BROWSER-WALLET", command: "portfolio" }, window.location.href);
        }
        
        // private function to wait for blockchain answer
        waitforanswer(varname) {
            let answer='';
            // exit for timeout of 120 seconds
            if(this.BWtimeout>=1200){
                this.BWtimeout=0;
                console.log("Blockain answer in timeout error");
                this.BWcallback('{"error":"Timeout error in answer"}');
                return;            
            }
            //check if the session variable has been set
            if(sessionStorage.getItem(varname)===null) {
                //wait 1 second and check again
                setTimeout(() => { this.waitforanswer(varname);},100);//wait 0.100 second and check again
                this.BWtimeout=this.BWtimeout+1;
                return;
            }else {
                // execute the call back function
                this.BWtimeout=0;	
                // execute call back
                if( this.BWcallback && typeof this.BWcallback == "function" ){
                    answer=sessionStorage.getItem(varname);
                    this.BWcallback(answer);
                }
                return;
            }
        }

    }
// end class BrowserWallet
