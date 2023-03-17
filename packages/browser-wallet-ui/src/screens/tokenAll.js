import Screen, { goBackScreen, goToScreen, reloadScreen } from "./index.js";
import {
  AccountStore,
  TokenStore
} from "@bitgreen/browser-wallet-core";
import { getAmountDecimal } from "@bitgreen/browser-wallet-utils";

export default async function tokenAllScreen(params) {
  const screen = new Screen({
    template_name: "layouts/default_custom_header",
    header: false,
    footer: true,
  });
  await screen.init();

  await screen.set("#heading", "token/type/heading", {
    title: "Other Tokens",
  });
  await screen.set("#bordered_content", "token/type/all_asset_type");

  const accounts_store = new AccountStore();

  const current_account = await accounts_store.current();

  const token_store = new TokenStore();
  const all_token = await token_store.fetch(current_account);

  for (const a of all_token) {
    const token = a;
    const defaultLogo = "assets/3ca609dfb4d2c2335575-Vector.png";
    await screen.append("#root #token_list", "token/type/list_item", {
      tokenId:
        token?.id == "NaN" || typeof token?.id == "undefined" ? 0 : token?.id,
      tokenName: token?.tokenName == null ? "null" : token?.tokenName,
      balance: token?.balance,
      decimal: getAmountDecimal(token?.balance, 2).decimals,
      balanceUsd: token?.balanceUsd == "NaN" ? 0 : token?.balanceUsd,
      tokenLogo: token?.tokenLogo != null ? token?.tokenLogo : defaultLogo,
      nftImage: token?.nftImage,
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
