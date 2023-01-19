// remove password (if saved) after X minutes of inactivity
export const passwordTimeout = 60000*10 // 10 minutes

// reconnect to the port every X minutes.
// do not change this value, it is important to keep background alive in mv3
export const reconnectTime = 60000*4; // 4 minutes

export const idleTime = 60000*2 // 2 minutes

export const bbbTokenPrice = 0.35 // price of bbb token

export const bbbTxFee = 0.272786238 // fee for sending bbb token

// list of all known apps
export const knownApps = [
    {
        title: 'Bitgreen',
        domain: 'https://bitgreen.org'
    },
    {
        title: 'Habbit - Bitgreen',
        domain: 'https://habbit.bitgreen.org'
    }
]