import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { hexToU8a, isHex } from "@polkadot/util";
import BigNumber from "bignumber.js";
import Sortable from 'sortablejs';

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
  const calc_decimals = Math.pow(10, decimals)
  return (Math.floor(balance / 1000000000000000000 * calc_decimals) / calc_decimals).toFixed(decimals);
}

const formatAmount = (amount, decimals, symbol = '', force_k = false) => {
  let formatted_amount
  if(typeof amount !== 'number') {
    amount = new BigNumber(amount)
  }

  const string_amount = amount.toFixed(decimals).toString()

  // Split the number string into the integer and decimal parts
  const parts = string_amount.split(".");

  if(parts[0].length > 9) {
    return formatAmount(amount / 1000000000, decimals, 'B')
  } else if(parts[0].length > 6) {
    return formatAmount(amount / 1000000, decimals, 'M')
  } else if(parts[0].length > 4) {
    return formatAmount(amount / 1000, decimals, 'K')
  }

  if(force_k && parts[0].length > 3) {
    return formatAmount(amount / 1000, decimals, 'K')
  }

  // Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Pad the decimal part with zeros if necessary
  if (parts.length > 1) {
    parts[1] = parts[1].padEnd(decimals, "0").substring(0, decimals);
  } else {
    parts[1] = (0).toString().padEnd(decimals, "0");
  }

  // Concatenate the integer and decimal parts with a period separator
  formatted_amount = parts.join(".") + symbol;

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

  const regex = /[^0-9]$/;
  const match = amount_info[1] ? amount_info[1].match(regex) : null

  let decimal_info = amount_info[1]?.substring(0, decimals) || '00'
  if(match) {
    decimal_info = decimal_info + match[0]
  }

  return {
    amount: amount_info[0],
    decimals: decimal_info
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
  let osName = 'other';

  if (userAgent.match(/Windows/i)) {
    osName = "windows";
  } else if (userAgent.match(/Android/i)) {
    osName = "android";
  } else if (userAgent.match(/iPad/i) || navigator.platform === 'iPad' || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    osName = "ipad";
  } else if (userAgent.match(/iPhone/i)) {
    osName = "ios";
  } else if (userAgent.match(/Macintosh/i)) {
    osName = "macos";
  } else if (userAgent.match(/Linux/i)) {
    osName = "linux";
  }

  return osName;
}

const isWindows = () => {
  return getOperatingSystem() === 'windows'
}

const isMacOs = () => {
  return getOperatingSystem() === 'macos'
}

const isIOs = () => {
  return getOperatingSystem() === 'ios'
}

const isIPad = () => {
  return getOperatingSystem() === 'ipad'
}

const isAndroid = () => {
  return getOperatingSystem() === 'android'
}

const isStandaloneApp = () => {
  return isIOs() || isIPad() || isAndroid()
}

const getTotalStakedByAddress = (all_collators, address) => {
  let total_take = new BigNumber(0)

  for(const [key, collator] of Object.entries(all_collators)) {
    for(const [key, delegator] of Object.entries(collator.delegators)) {
      if(delegator.who === address) {
        total_take = total_take.plus(new BigNumber(delegator?.deposit.replaceAll(',', '')))
      }
    }
  }

  return total_take
}

const getApyByAddress = (all_collators, address, block_reward) => {
  const my_nominations = []

  for(const [key, collator] of Object.entries(all_collators)) {
    for(const [key, delegator] of Object.entries(collator.delegators)) {
      if(delegator.who === address) {
        my_nominations.push(calculateCollatorApy(all_collators, collator, block_reward))
      }
    }
  }

  let total_apy = new BigNumber(0)
  for(const apy of my_nominations) {
    total_apy = total_apy.plus(apy)
  }

  return total_apy.dividedBy(new BigNumber(my_nominations.length))
}

const getAverageApy = (all_collators, block_reward) => {
  block_reward = new BigNumber(block_reward.toString())

  let total_apy = new BigNumber(0)

  for(const [key, collator] of Object.entries(all_collators)) {
    total_apy = total_apy.plus(calculateCollatorApy(all_collators, collator, block_reward))
  }

  if(total_apy.isEqualTo(0)) return 0

  return total_apy.dividedBy(new BigNumber(all_collators.length))
}

const calculateCollatorApy = (all_collators, collator, block_reward) => {
  const blocks_per_year = new BigNumber(365 * 24 * 60 * 60 / 12)
  block_reward = new BigNumber(block_reward.toString())

  let total_stake = new BigNumber(0)
  for(const [key, collator] of Object.entries(all_collators)) {
    total_stake = total_stake.plus(new BigNumber(collator?.totalStake.replaceAll(',', '')))
  }

  if (total_stake.isEqualTo(0)) return 0; // Handle division by zero
  const collator_stake = new BigNumber(collator?.totalStake.replaceAll(',', ''));

  const share = collator_stake.dividedBy(total_stake).times(blocks_per_year).times(block_reward);

  if (share.isEqualTo(0)) return 0; // Handle division by zero

  const collator_apy = share.dividedBy(collator_stake).times(100)

  return collator_apy
}

const calculateUserApy = (stake, collator_stake, total_stake, block_reward, total_collators) => {
  stake = new BigNumber(stake.toString())
  collator_stake = new BigNumber(collator_stake.toString())
  total_stake = new BigNumber(total_stake.toString())
  block_reward = new BigNumber(block_reward.toString())
  total_collators = new BigNumber(total_collators)

  const blocks_per_year = new BigNumber(365 * 24 * 60 * 60 / 12)

  // Calculate expected reward per block
  const expected_reward_per_block = stake
    .dividedBy(collator_stake)
    .multipliedBy(new BigNumber(0.9)) // commission 10%
    .multipliedBy(block_reward)
    .dividedBy(total_collators);

  // calculate apy
  return expected_reward_per_block
    .multipliedBy(blocks_per_year)
    .dividedBy(total_stake)
    .multipliedBy(new BigNumber(100))
}

const calculateUserRewardPerBlock = (stake, apy, block_reward) => {
  stake = new BigNumber(stake.toString())
  apy = new BigNumber(apy.toString())
  block_reward = new BigNumber(block_reward.toString())

  const blocks_per_year = new BigNumber(365 * 24 * 60 * 60 / 12)

  const reward_per_year = stake.multipliedBy(apy).dividedBy(new BigNumber(100))

  return reward_per_year.dividedBy(blocks_per_year).dividedBy(block_reward)
}

const getCurrentBrowser = () => {
  let current_browser = null

  try {
    current_browser = (isFirefox() || isSafari()) ? browser : chrome
  } catch (e) {
  }

  return current_browser
}

// Custom reviver function to handle BigNumber instances
const customReviver = (key, value) => {
  if (typeof value === 'object' && value !== null && value._isBigNumber) {
    return new BigNumber(value);
  }
  return value;
}

// create sortable
const createMnemonicSortable = (cssQuerySelector, updateFunction, removeFunction) => {
  const sortableOuterElement = document.querySelector(cssQuerySelector);
  const sortable = Sortable.create(sortableOuterElement, {
    dataIdAttr: 'data-id',
    easing: "cubic-bezier(1, 0, 0, 1)",
    animation: 150,
    invertSwap: true,
    delay: 100,
    delayOnTouchOnly: true,
    emptyInsertThreshold: 100,
    onUpdate: updateFunction,
    onChoose: (evt) => {
      evt.item.classList.add('selected')
      document.querySelector(cssQuerySelector).classList.add('dragging')
    },
    onUnchoose: (evt) => {
      evt.item.classList.remove('selected')
      document.querySelector(cssQuerySelector).classList.remove('dragging')
    }
  });

  // for the app, just remove when "clicked" (touchstart -> touchend without actually moving)
  if(isStandaloneApp()) {
    sortableOuterElement.addEventListener('click', (e) => {
      for (let elem = e.target; elem && elem !== this; elem = elem.parentNode) {
        if (elem.matches && elem.matches(cssQuerySelector + ' > .word')) {
          removeFunction({target: elem.querySelector('.remove')})
          return;
        }
      }
    })
  }

  return sortable;
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
  isMacOs,
  isIOs,
  isIPad,
  isAndroid,
  isStandaloneApp,
  getTotalStakedByAddress,
  getApyByAddress,
  getAverageApy,
  calculateCollatorApy,
  calculateUserApy,
  calculateUserRewardPerBlock,
  getCurrentBrowser,
  customReviver,
  createMnemonicSortable
}