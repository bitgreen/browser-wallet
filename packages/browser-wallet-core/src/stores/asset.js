import BaseStore from "./base.js"; 
class AssetStore extends BaseStore {
    constructor( ) {
         
        super('asset' )
  
    }
 
    async fetch(account)
    {
 
        //const url = 'https://api-testnet.bitgreen.org/assets/transaction?account=' + account.address;
        const url = 'https://api-testnet.bitgreen.org/assets/transaction?account=5EYCAe5fvJMpFoTxRjUDmf4VvqJcpBTDEiD9Jg86JVWFB4Xm';
        let result = await fetch(url)
        result = await result.json()  
         await this.asyncSet('asset', result) 
        return result
    }
  
}

export default AssetStore