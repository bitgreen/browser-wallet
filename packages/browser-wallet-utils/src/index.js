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

export {
    getBrowser,
    isChrome,
    isFirefox,
    isSafari,
    sleep,
    generateMessageId
}