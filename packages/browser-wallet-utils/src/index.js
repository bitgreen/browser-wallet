import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { hexToU8a, isHex } from "@polkadot/util";

const getBrowser = () => {
    let userAgent = navigator.userAgent;
    let browserName = '';

    if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "firefox";
    } else if (userAgent.match(/safari/i)) {
        browserName = "safari";
    } else if (userAgent.match(/opr\//i)) {
        browserName = "opera";
    } else if (userAgent.match(/edg/i)) {
        browserName = "edge";
    }

    return browserName;
}

const isChrome = () => {
    return getBrowser() === 'chrome'
}

const isFirefox = () => {
    return getBrowser() === 'firefox'
}

const isSafari = () => {
    return getBrowser() === 'safari'
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

let messageIdCounter = 0
const generateMessageId = () => {
    return `${Date.now()}.${++messageIdCounter}`;
}

const shuffleArray = (array) => {
    let cloned_array = [...array];
    for (let i = cloned_array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = cloned_array[i];
        cloned_array[i] = cloned_array[j];
        cloned_array[j] = temp;
    }
    return cloned_array
}

const randomString = (len) => {
    let text = "";

    let charset = "abcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const balanceToHuman = (balance, decimals = 4) => {
    return (parseInt(balance) / 1000000000000000000).toFixed(decimals)
}

const humanToBalance = (amount) => {
    return BigInt(parseInt((parseFloat(amount)*10000).toString()))*100000000000000n
}

const getAmountDecimal = (amount, decimals = 4) => {
    const amount_info = parseFloat(amount).toFixed(decimals).toString().split('.')

    return {
        amount: amount_info[0],
        decimals: amount_info[1]
    }
}

const addressValid = (address) => {
    try {
        encodeAddress(
            isHex(address)
                ? hexToU8a(address)
                : decodeAddress(address)
        );

        return true;
    } catch (error) {
        return false;
    }
}

export {
    getBrowser,
    isChrome,
    isFirefox,
    isSafari,
    sleep,
    generateMessageId,
    shuffleArray,
    randomString,
    randomNumber,
    balanceToHuman,
    humanToBalance,
    getAmountDecimal,
    addressValid
}