import Screen, { goBackScreen, goToScreen, reloadScreen } from "./index.js";
import {balanceToHuman, getAmountDecimal} from "@bitgreen/browser-wallet-utils";
import {sendMessage} from "../messaging.js";
import {bbbTokenPrice} from "@bitgreen/browser-wallet-core";
import {renderTemplate} from "../screens.js";
import anime from "animejs";

export default async function tokenAllScreen(params) {
  const screen = new Screen({
    template_name: "layouts/default_custom_header",
    header: false,
    footer: true,
  });
  await screen.init();

  await screen.set('#heading', 'asset/all/heading')

  await screen.set("#bordered_content", "token/all/content");

  const defaultIcon = await renderTemplate('shared/icons/default')

  const bbbIcon = await renderTemplate('shared/icons/bbb')
  const usdtIcon = await renderTemplate('shared/icons/usdt')
  const usdcIcon = await renderTemplate('shared/icons/usdc')
  const dotIcon = await renderTemplate('shared/icons/dot')

  const balances = await sendMessage('get_all_balances')

  for (const token of balances.tokens) {
    let icon = defaultIcon
    if(token.token_name === 'BBB') icon = bbbIcon
    if(token.token_name === 'USDT') icon = usdtIcon
    if(token.token_name === 'USDC') icon = usdcIcon
    if(token.token_name === 'DOT') icon = dotIcon

    // Skip BBB here
    if(token.token_name === 'BBB') continue

    const balance_info = getAmountDecimal(balanceToHuman(token.balance), 2)
    const balance_usd_info = getAmountDecimal(balanceToHuman(token.balance) * token.price, 2)
    const price_info = getAmountDecimal(token.price, 2)

    await screen.append("#root #transactions", "token/all/list_item", {
      tokenName: token.token_name,
      balance: balance_info.amount,
      decimal: balance_info.decimals,

      tokenLogo: icon,

      price: price_info.amount,
      priceDecimal: price_info.decimals,
      balanceUsd: balance_usd_info.amount,
      balanceUsdDecimal: balance_usd_info.decimals,
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

  screen.setListeners([
    {
      element: "#heading #go_back",
      listener: () => goBackScreen(),
    },
    {
      element: "#root #transactions .button-item",
      listener: (e) => {},
    },
  ]);
}
