import Screen, { goBackScreen, goToScreen, reloadScreen } from "./index.js";
import {
  AssetStore,
  AccountStore,
  TokenStore
} from "@bitgreen/browser-wallet-core";
import { getAmountDecimal } from "@bitgreen/browser-wallet-utils";

export default async function assetAllScreen(params) {
  const screen = new Screen({
    template_name: 'layouts/full_page',
    template_params: {
      title: 'All Assets'
    },
    header: false,
    footer: true,
  });
  await screen.init();

  await screen.set('.content', 'asset/all/content')

  const accounts_store = new AccountStore();

  const current_account = await accounts_store.current();
  const token_store = new TokenStore();
  const all_token = await token_store.fetch(current_account);
  const asset_store = new AssetStore();
  const all_asset = await asset_store.fetch(current_account);
  for (const a of all_token) {
    const asset = a;
    const defaultLogo = "assets/3ca609dfb4d2c2335575-Vector.png";
    await screen.append("#root #asset_list", "asset/all/list_item", {
      assetId:
        asset?.assetId == "NaN" || typeof asset?.assetId == "undefined"
          ? 0
          : asset?.assetId,
      assetName: asset?.assetName,
      balance: asset?.balance,
      decimal: getAmountDecimal(asset?.balance, 2).decimals,
      balanceUsd: asset?.balanceUsd == "NaN" ? 0 : asset?.balanceUsd,
      assetLogo: asset?.assetLogo != null ? asset?.assetLogo : defaultLogo,
      nftImage: asset?.nftImage,
    });
  }

  for (const a of all_asset) {
    const asset = a;
    const defaultLogo = "assets/3ca609dfb4d2c2335575-Vector.png";
    await screen.append("#root #asset_list", "asset/all/list_item", {
      assetId: asset?.assetId,
      assetName: asset?.assetName,
      balance: asset?.balance,
      decimal: getAmountDecimal(asset?.balance, 2).decimals,
      balanceUsd: asset?.balanceUsd == "NaN" ? 0 : asset?.balanceUsd,
      assetLogo: asset?.assetLogo != null ? asset?.assetLogo : defaultLogo,
      nftImage: asset?.nftImage,
    });
  }

  screen.setListeners([
    {
      element: ".heading #go_back",
      listener: () => goBackScreen(),
    },
    {
      element: "#root #asset_list .button-item",
      listener: (e) => {},
    },
  ]);
}
