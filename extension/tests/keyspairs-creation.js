// Test Key pairs creation
const { Keyring } = require('@polkadot/api');
const util_crypto=require('@polkadot/util-crypto');
mainloop();
async function mainloop(){
    await util_crypto.cryptoWaitReady();
    console.log("Creating Key Pairs");
    let k= new Keyring({ type: 'sr25519' });
    if (typeof error == 'undefined'){
        mnemonic=util_crypto.mnemonicGenerate(12);
        console.log("Secret Seed:");
        console.log(mnemonic);
        let keyspair = k.addFromUri(mnemonic, { name: '' }, 'sr25519');
        console.log(keyspair);
    }
}