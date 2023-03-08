import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { hexToU8a, isHex } from "@polkadot/util";
import BigNumber from "bignumber.js";

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

const balanceToHuman = (balance, decimals = 2) => {
    const calc_decimals = Math.pow(10, decimals)
    return (Math.floor(balance / 1000000000000000000 * calc_decimals) / calc_decimals).toFixed(decimals);
}

const formatAmount = (amount, decimals) => {
    let formatted_amount
    if(typeof amount === 'number') {
        amount = amount.toFixed(decimals).toString()
    }

    // Split the number string into the integer and decimal parts
    const parts = amount.split(".");

    // Add commas to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Pad the decimal part with zeros if necessary
    if (parts.length > 1) {
        parts[1] = parts[1].padEnd(decimals, "0").substring(0, decimals);
    } else {
        parts[1] = (0).toString().padEnd(decimals, "0");
    }

    // Concatenate the integer and decimal parts with a period separator
    formatted_amount = parts.join(".");

    return formatted_amount
}

const humanToBalance = (amount) => {
    const decimals = new BigNumber(1000000000000000000)
    const amountBalance = new BigNumber(parseFloat(amount))

    const result = amountBalance.times(decimals);
    return result.toFixed(0)
}

const getAmountDecimal = (amount, decimals = 2) => {
    let amount_info = null
    if(typeof amount === 'string') {
        amount_info = amount.split('.')
    } else {
        amount_info = parseFloat(amount).toFixed(decimals).toString().split('.')
    }

    return {
        amount: amount_info[0],
        decimals: amount_info[1]?.substring(0, 2) || '00'
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

const formatAddress = (address, first = 8, last = 6) => {
    return address?.substring(0, first) + '...' + address?.substring(address?.length - last)
}

const getOperatingSystem = () => {
    let userAgent = navigator.userAgent;
    let osName = '';

    if (userAgent.search('Windows') !== -1) {
        osName = "windows";
    } else if (userAgent.search('Mac') !== -1) {
        osName = "mac";
    } else if (userAgent.search('X11') !== -1 && !(userAgent.search('Linux') !== -1)) {
        osName = "unix";
    } else if (userAgent.search('Linux') !== -1 && userAgent.search('X11') !== -1) {
        osName = "linux";
    }

    return osName;
}

const isWindows = () => {
    return getOperatingSystem() === 'windows'
}

const isMacOs = () => {
    return getOperatingSystem() === 'mac'
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
    formatAmount,
    humanToBalance,
    getAmountDecimal,
    addressValid,
    formatAddress,
    getOperatingSystem,
    isWindows,
    isMacOs
}