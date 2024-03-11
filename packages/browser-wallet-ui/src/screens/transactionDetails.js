import Screen, { goBackScreen } from './index.js'
import {AccountStore, bbbTokenPrice, NetworkStore, TransactionStore} from "@bitgreen/browser-wallet-core";
import {balanceToHuman, formatAddress, getAmountDecimal} from "@bitgreen/browser-wallet-utils";

export default async function transactionDetailsScreen(params) {
  const screen = new Screen({
    template_name: 'layouts/full_page',
    template_params: {
      title: 'Transaction Detail'
    }
  })
  await screen.init()

  const networks_store = new NetworkStore()
  const accounts_store = new AccountStore()

  const current_network = await networks_store.current()
  const current_account = await accounts_store.current()

  const transactions_store = new TransactionStore(current_network, current_account)
  const transaction = await transactions_store.get(params?.hash)

  const asset_info = getAmountDecimal(balanceToHuman(transaction.amount, 2), 2)
  const usd_info = getAmountDecimal(balanceToHuman(transaction.amount) * bbbTokenPrice, 2) // TODO: update price!
  const fee_info = getAmountDecimal(0.27, 2) // TODO: calculate fees!
  const sent = transaction.from.toLowerCase() === current_account.address.toLowerCase()
  const account_name = '(' + (current_account.name.length > 14 ? current_account.name.substring(0,14)+'...' : current_account.name) + ')'

  await screen.set('.content', 'transaction/details', {
    asset_amount: asset_info.amount,
    asset_decimals: asset_info.decimals,
    usd_amount: usd_info.amount,
    usd_decimals: usd_info.decimals,
    fee_amount: fee_info.amount,
    fee_decimals: fee_info.decimals,
    from_account_address: formatAddress(transaction.from, 16, 16),
    from_account_name: sent ? account_name : '',
    recipient_name: !sent ? account_name : '',
    recipient_address: formatAddress(transaction.to, 16, 16),
    wss_endpoint: encodeURI(current_network.url),
    block_number: transaction.blockNumber
  })

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => goBackScreen()
    }
  ])
}