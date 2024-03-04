import Screen, { goBackScreen, goToScreen } from "./index.js";
import { balanceToHuman, formatAmount, getAmountDecimal } from "@bitgreen/browser-wallet-utils";
import { bbbTokenPrice } from "@bitgreen/browser-wallet-core";
import { sendMessage } from "../messaging.js";
import anime from "animejs";
import BigNumber from "bignumber.js";

export default async function tokenBBBScreen(params) {
  const screen = new Screen({
    template_name: "layouts/default_custom_header_medium",
    header: false,
    footer: true,
  });
  await screen.init();

  await screen.set('#heading', 'token/bbb/heading')

  await screen.set("#bordered_content", "token/bbb/content");

  sendMessage('get_balance').then(async(balance) => {
    const vesting_contract = await sendMessage('get_vesting_contract')
    const last_block = await sendMessage('get_last_block')

    const bbb_available = new BigNumber(balance.free)
    let bbb_total = new BigNumber(balance.total)
    if(vesting_contract) {
      bbb_total = bbb_total.plus(new BigNumber(vesting_contract?.amount))

      const bbb_vesting_info = getAmountDecimal(formatAmount(balanceToHuman(new BigNumber(vesting_contract?.amount)), 2), 2)
      const bbb_vesting_usd_info = getAmountDecimal(formatAmount(balanceToHuman(new BigNumber(vesting_contract?.amount)) * bbbTokenPrice, 2), 2) // TODO: update price!
      screen.setParam('#bordered_content .bbb-vesting-amount', bbb_vesting_info.amount)
      screen.setParam('#bordered_content .bbb-vesting-decimals', bbb_vesting_info.decimals)
      screen.setParam('#bordered_content .bbb-vesting-usd-amount', bbb_vesting_usd_info.amount)
      screen.setParam('#bordered_content .bbb-vesting-usd-decimals', bbb_vesting_usd_info.decimals)

      if(last_block.header.number > vesting_contract?.expiry) {
        document.querySelector("#bordered_content #vesting_info").classList.remove('transaction-item-disabled')
        document.querySelector("#bordered_content #vesting_withdraw").classList.remove('d-none')
      } else {
        const now = new Date().getTime()
        const unlock_date = new Date(now + ((vesting_contract?.expiry - last_block.header.number) * 12)).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        })

        document.querySelector("#bordered_content #vesting_unlocks").classList.remove('d-none')

        screen.setParam('#bordered_content #vesting_unlocks .unlocks-from', unlock_date)
      }

      document.querySelector("#bordered_content #vesting_info").classList.remove('d-none')
    }

    const bbb_info = getAmountDecimal(formatAmount(balanceToHuman(bbb_total), 2), 2)
    const usd_info = getAmountDecimal(formatAmount(balanceToHuman(bbb_total) * bbbTokenPrice, 2), 2) // TODO: update price!

    screen.setParam('#bordered_content #amounts .bbb-amount', bbb_info.amount)
    screen.setParam('#bordered_content #amounts .bbb-decimals', bbb_info.decimals)

    screen.setParam('#bordered_content #amounts .usd-amount', usd_info.amount)
    screen.setParam('#bordered_content #amounts .usd-decimals', usd_info.decimals)

    const bbb_available_info = getAmountDecimal(formatAmount(balanceToHuman(bbb_available), 2), 2)
    const bbb_available_usd_info = getAmountDecimal(formatAmount(balanceToHuman(bbb_available) * bbbTokenPrice, 2), 2) // TODO: update price!
    screen.setParam('#bordered_content .bbb-available-amount', bbb_available_info.amount)
    screen.setParam('#bordered_content .bbb-available-decimals', bbb_available_info.decimals)
    screen.setParam('#bordered_content .bbb-available-usd-amount', bbb_available_usd_info.amount)
    screen.setParam('#bordered_content .bbb-available-usd-decimals', bbb_available_usd_info.decimals)

    const bbb_locked_info = getAmountDecimal(formatAmount(balanceToHuman(balance.frozen + balance.reserved), 2), 2)
    const bbb_locked_usd_info = getAmountDecimal(formatAmount(balanceToHuman(balance.frozen + balance.reserved) * bbbTokenPrice, 2), 2) // TODO: update price!
    screen.setParam('#bordered_content .bbb-locked-amount', bbb_locked_info.amount)
    screen.setParam('#bordered_content .bbb-locked-decimals', bbb_locked_info.decimals)
    screen.setParam('#bordered_content .bbb-locked-usd-amount', bbb_locked_usd_info.amount)
    screen.setParam('#bordered_content .bbb-locked-usd-decimals', bbb_locked_usd_info.decimals)

    if(bbb_available > 0) {
      document.querySelector("#bordered_content #bbb_send").classList.remove('disabled')
    }
  })

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });

  screen.setListeners([
    {
      element: "#heading #go_back",
      listener: () => goBackScreen()
    },
    {
      element: "#bordered_content #bbb_send",
      listener: () => goToScreen('assetSendScreen', {
        asset: 'bbb'
      })
    },
    {
      element: "#bordered_content #vesting_withdraw",
      listener: () => goToScreen('extrinsicSendScreen', {
        pallet: 'vestingContract',
        call: 'withdrawVested'
      })
    }
  ]);
}
