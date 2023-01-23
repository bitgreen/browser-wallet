import { getCurrentTabId, sendMessageToTab, showPopup } from "./index.js";
import { polkadotApi } from "../polkadotApi.js";

class Tabs {
    async handle(data, from, port) {
        switch(data.command) {
            case 'sign_in':
                return await this.signIn(data.params)
            case 'send':
                return await this.send(data.params)
            case 'extrinsic':
                return await this.extrinsic(data.params)
            case 'query':
                return await this.query(data.params)
            default:
                return false
        }
    }

    signIn(params) {
        return new Promise(async(resolve, reject) => {
            await showPopup('sign_in', params);

            resolve(true)
        })
    }

    send(params) {
        return new Promise(async(resolve, reject) => {
            await showPopup('send', params);

            resolve(true)
        })
    }

    extrinsic(params) {
        return new Promise(async(resolve, reject) => {
            await showPopup('extrinsic', params);

            resolve(true)
        })
    }

    async query(params) {
        const polkadot_api = await polkadotApi()

        const pallet = params?.pallet
        const call = params?.call
        const call_parameters = params?.call_parameters
        let result

        try {
            result = {
                success: true,
                data: await polkadot_api.query[pallet][call](...call_parameters)
            }
        } catch(err) {
            result = {
                success: false,
                error: err.message
            };
        }

        await sendMessageToTab(await getCurrentTabId(), params.id, result)

        return result
    }
}

export default Tabs