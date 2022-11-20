import { showPopup } from "./index.js";

class Tabs {
    async handle(data, from, port) {
        switch(data.command) {
            case 'sign_in':
                return await this.signIn(data)
            default:
                return false
        }
    }

    signIn(data) {
        return new Promise((resolve, reject) => {
            let open_url = 'index.html?command=sign_in&domain=' + encodeURI(data.domain);
            showPopup(open_url);

            resolve('TEST SIGN IN RESPONSE')
        })
    }
}

export default Tabs