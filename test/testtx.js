// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main () {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider('wss://testnet.bitgreen.org');

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  // Retrieve the chain & node information information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);
  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

}

main().catch(console.error).finally(() => process.exit());

// https://polkadot.js.org/docs/api/start/api.tx.subs

// const hash = await transfer.signAndSend(alice);
// console.log('Transfer sent with hash', hash.toHex());
