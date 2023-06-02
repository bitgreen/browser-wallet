import Screen, { goBackScreen, goToScreen, reloadScreen } from "./index.js";
import {balanceToHuman, getAmountDecimal} from "@bitgreen/browser-wallet-utils";
import {sendMessage} from "../messaging.js";
import {bbbTokenPrice} from "@bitgreen/browser-wallet-core";
import {renderTemplate} from "../screens.js";
import anime from "animejs";

export default async function assetAllScreen(params) {
  const screen = new Screen({
    template_name: 'layouts/default_custom_header',
    header: false,
    footer: true
  });
  await screen.init();

  await screen.set('#heading', 'asset/all/heading')

  await screen.set('#bordered_content', 'asset/all/content')

  sendMessage('get_all_balances').then(async(balances) => {
    const defaultIcon = await renderTemplate('shared/icons/default')

    const bbbIcon = await renderTemplate('shared/icons/bbb')
    const usdtIcon = await renderTemplate('shared/icons/usdt')
    const usdcIcon = await renderTemplate('shared/icons/usdc')
    const dotIcon = await renderTemplate('shared/icons/dot')

    const carbonCreditIcon = await renderTemplate('shared/icons/carbon_credit')

    for (const token of balances.tokens) {
      let icon = defaultIcon
      if(token.token_name === 'BBB') icon = bbbIcon
      if(token.token_name === 'USDT') icon = usdtIcon
      if(token.token_name === 'USDC') icon = usdcIcon
      if(token.token_name === 'DOT') icon = dotIcon

      const balance_info = getAmountDecimal(balanceToHuman(token.total), 2)
      const balance_usd_info = getAmountDecimal(balanceToHuman(token.total) * token.price, 2)
      const price_info = getAmountDecimal(token.price, 2)

      await screen.append("#root #transactions", "token/all/list_item", {
        tokenName: token.token_name,
        balance: balance_info.amount,
        decimal: balance_info.decimals,

        tokenLogo: icon,

        price: token.price > 0 ? `<span class="dollar">$</span>${price_info.amount}` : '',
        priceDecimal: token.price > 0 ? '.' + price_info.decimals : 'N/A',
        balanceUsd: token.price > 0 ? `<span class="dollar">$</span>${balance_usd_info.amount}` : '',
        balanceUsdDecimal: token.price > 0 ? '.' + balance_usd_info.decimals : 'N/A'
      });
    }

    for (const asset of balances.assets) {
      const balance_info = getAmountDecimal(asset.balance, 2)
      const balance_usd_info = getAmountDecimal(asset.balance * asset.price, 2)
      const price_info = getAmountDecimal(asset.price, 2)

      await screen.append("#root #transactions", "asset/all/list_item", {
        balance: balance_info.amount,
        decimal: balance_info.decimals,

        assetLogo: carbonCreditIcon,

        price: asset.price > 0 ? `<span class="dollar">$</span>${price_info.amount}` : '',
        priceDecimal: asset.price > 0 ? '.' + price_info.decimals : 'N/A',
        balanceUsd: asset.price > 0 ? `<span class="dollar">$</span>${balance_usd_info.amount}` : '',
        balanceUsdDecimal: asset.price > 0 ? '.' + balance_usd_info.decimals : 'N/A'
      });
    }

    anime({
      targets: '#transactions .button-item',
      translateX: [-20, 0],
      opacity: [0, 1],
      easing: 'easeInOutSine',
      duration: 250,
      delay: function(el, i) { return (i * 150) > 1200 ? 1200 : (i * 150) },
    });
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
      element: ".heading #go_back",
      listener: () => goBackScreen(),
    },
    {
      element: "#root #transactions .button-item",
      listener: (e) => {},
    },
  ]);
}
