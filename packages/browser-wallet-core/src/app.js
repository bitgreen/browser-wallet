import { knownApps } from "./constants.js";
import escapeStringRegexp from 'escape-string-regexp';

export const checkIfAppIsKnown = (domain) => {
    // Check for exact match first
    for(const app of knownApps) {
        if (app.domain === domain) {
            return app;
        }
    }

    // Check for wildcard domains
    for(const app of knownApps) {
        // Escape regex characters and replace '*' with a regex wildcard
        const pattern = escapeStringRegexp(app.domain.replace(/\*/g, '__WILDCARD__')).replace(/__WILDCARD__/g, '.*')
        const regex = new RegExp(`^${pattern}$`);

        console.log(pattern)
        console.log(domain)

        if (regex.test(domain)) {
            return app;
        }
    }

    return false
}