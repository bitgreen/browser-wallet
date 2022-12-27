import { knownApps } from "./constants.js";

export const checkIfAppIsKnown = (domain) => {
    for(const app of knownApps) {
        if(app.domain === domain) {
            return true
        }
    }

    return false
}