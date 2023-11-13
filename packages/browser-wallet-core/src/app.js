import { knownApps } from "./constants.js";

export const checkIfAppIsKnown = (domain) => {
    // Check for exact match first
    for(const app of knownApps) {
        if (app.domain === domain) {
            return app;
        }
    }

    // Check for wildcard domains
    for(const app of knownApps) {
        // Create a regex pattern from the domain, replacing '*' with a regex wildcard
        const pattern = app.domain.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);

        if (regex.test(domain)) {
            return app;
        }
    }

    return false
}