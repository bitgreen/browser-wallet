import Screen, { goBackScreen, goToScreen, reloadScreen } from './index.js'
import { AssetStore,AccountStore, NetworkStore} from "@bitgreen/browser-wallet-core"; 
import { sendMessage } from "../messaging.js"; 
import DOMPurify from "dompurify";
import { showNotification } from "../notifications.js";
import {isFirefox} from "@bitgreen/browser-wallet-utils";
import dashboardScreen from './dashboard.js';
import {getAmountDecimal } from "@bitgreen/browser-wallet-utils";
 
export default async function allAssetType(params) {
    const screen = new Screen({
        template_name: 'layouts/default_custom_header',
        header: false,
        footer: true,
    })
    await screen.init()
    
    await screen.set('#heading', 'asset/type/heading', {
            title:"All assets"
      })
    await screen.set('#bordered_content', 'asset/type/all_asset_type')
         
    const accounts_store = new AccountStore()
 
    const current_account = await accounts_store.current()

    const asset_store = new AssetStore( )
    const all_asset = await asset_store.fetch(current_account);
      
    for(const a of all_asset) {
        const asset = a  
        const defaultLogo = "assets/3ca609dfb4d2c2335575-Vector.png";
        await screen.append('#root #asset_list', 'asset/type/list_item', {
            assetId:asset?.assetId,
            assetName:asset?.assetName,
            balance: asset?.balance,
            decimal: getAmountDecimal(asset?.balance,2).decimals,
            balanceUsd: asset?.balanceUsd,
            assetLogo: (asset?.assetLogo != null) ?  asset?.assetLogo: defaultLogo, 
            nftImage:asset?.nftImage,
        })
   
    }

    screen.setListeners([
        {
            element: '#heading #go_back',
            listener: () => goBackScreen()
        },
          {
            element: '#root #asset_list .button-item',
            listener: (e) => {
            }
        }
       
    ])


}