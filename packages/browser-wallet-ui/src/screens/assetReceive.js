import Screen, { copyText } from './index.js'
import { AccountStore } from "@bitgreen/browser-wallet-core";
import { showNotification } from "../notifications.js";
import QRCode from 'qrcode'
import anime from "animejs";

export default async function assetReceiveScreen() {
  const screen = new Screen({
    template_name: 'layouts/default',
    header: true,
    footer: true
  })
  await screen.init()

  const accounts_store = new AccountStore()
  const current_account = await accounts_store.current()

  await screen.set('#heading', 'shared/heading', {
    title: 'Receive'
  })

  await screen.set('#bordered_content', 'asset/receive', {
    address: current_account.address
  })

  await QRCode.toString(current_account.address, {
    width: 160,
    quality: 4,
    margin: 0,
    color: {
      dark:"#224851",
      light:"#ffffff"
    },
    errorCorrectionLevel: 'L'
  }, (err, string) => {
    document.querySelector("#qrcode").innerHTML = string
  });

  screen.setListeners([
    {
      element: '#bordered_content #copy_qrcode, #bordered_content #copy_address',
      listener: async() => {
        await copyText(current_account.address)
        await showNotification('Account address copied to clipboard.', 'info', 2000, 44)
      }
    }
  ])

  anime({
    targets: '#bordered_content',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeInOutSine',
    duration: 400
  });
}