import Screen, { goBackScreen, goToScreen, reloadScreen } from "./index.js";
import { getAmountDecimal } from "@bitgreen/browser-wallet-utils";
import {sendMessage} from "../messaging.js";

export default async function tokenAllScreen(params) {
  const screen = new Screen({
    template_name: "layouts/default",
    header: true,
    footer: true,
  });
  await screen.init();

  await screen.set('#heading', 'shared/heading', {
    title: 'Other Tokens'
  })

  await screen.set("#bordered_content", "token/all/content");

  const all_token = await sendMessage('get_tokens')

  for (const token of all_token) {
    const defaultLogo = "assets/3ca609dfb4d2c2335575-Vector.png";
    await screen.append("#root #token_list", "token/type/list_item", {
      tokenId:
        token?.value?.id === "NaN" || typeof token?.value?.id == "undefined" ? 0 : token?.id,
      tokenName: token?.value?.tokenName == null ? "null" : token?.value?.tokenName,
      balance: token?.value?.balance,
      decimal: getAmountDecimal(token?.value?.balance, 2).decimals,
      balanceUsd: token?.value?.balanceUsd === "NaN" ? 0 : token?.value?.balanceUsd,
      tokenLogo: token?.value?.tokenLogo != null ? token?.value?.tokenLogo : defaultLogo,
      nftImage: token?.value?.nftImage,
    });
  }

  screen.setListeners([
    {
      element: "#heading #go_back",
      listener: () => goBackScreen(),
    },
    {
      element: "#root #asset_list .button-item",
      listener: (e) => {},
    },
  ]);
}
