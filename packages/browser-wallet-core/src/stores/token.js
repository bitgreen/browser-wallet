import BaseStore from "./base.js"; 
class TokenStore extends BaseStore {
    constructor( ) {
         
        super('token' )
  
    }
 
    async fetch(account)
    {
 
        const url = 'https://api-testnet.bitgreen.org/tokens/transaction?account=' + account.address;
        //const url = 'https://api-testnet.bitgreen.org/tokens/transaction?account=5H3R2XduBHH5uXHaJhYQeFqfFzMJct67xTZq9G7QWP5tNxX4';
        let result = await fetch(url)
        result = await result.json()  
         await this.asyncSet('token', result) 
        return result
    }
  
}

export default TokenStore