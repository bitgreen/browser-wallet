// remove password (if saved) after X minutes of inactivity
export const passwordTimeout = 60000*10 // 10 minutes

// reconnect to the port every X minutes.
// do not change this value, it is important to keep background alive in mv3
export const reconnectTime = 60000*4; // 4 minutes

export const idleTime = 60000*2 // 2 minutes

// list of all known apps
export const knownApps = [
    {
        title: 'Bitgreen',
        domain: 'https://bitgreen.org'
    }
]