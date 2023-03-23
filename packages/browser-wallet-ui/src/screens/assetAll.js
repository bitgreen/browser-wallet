import Screen, { goBackScreen, goToScreen, reloadScreen } from "./index.js";
import { getAmountDecimal } from "@bitgreen/browser-wallet-utils";
import {sendMessage} from "../messaging.js";

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

  const all_token = await sendMessage('get_tokens')

  for (const asset of all_token) {
    const defaultLogo = "assets/3ca609dfb4d2c2335575-Vector.png";
    await screen.append("#root #asset_list", "asset/all/list_item", {
      assetId:
        asset?.value?.assetId === "NaN" || typeof asset?.value?.assetId == "undefined"
          ? 0
          : asset?.value?.assetId,
      assetName: asset?.value?.assetName,
      balance: asset?.value?.balance,
      decimal: getAmountDecimal(asset?.balance, 2).decimals,
      balanceUsd: asset?.value?.balanceUsd === "NaN" ? 0 : asset?.value?.balanceUsd,
      assetLogo: asset?.value?.assetLogo != null ? asset?.value?.assetLogo : defaultLogo,
      nftImage: asset?.value?.nftImage,
    });
  }

  const all_asset = await sendMessage('get_assets')

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
