
let keyspairv='';
let keyringv= new keyring.Keyring({ type: 'sr25519' });
let mnemonic='';
let apiv='';
let primaryaccount='';
let balancev=0;
let balancevf='0.00';
change_network();
if(localStorage.getItem("primaryaccount")){
  primaryaccount=localStorage.getItem("primaryaccount");
}

// add listeners for events
document.addEventListener('DOMContentLoaded', function() {
    // network selection
    document.getElementById("network").addEventListener("change", change_network);
    if(primaryaccount.length>0){
      dashboard();
    }else {
      // set new/import keys screen
      let n='<br><center><H3>New to Bitgreen?</h3><br>';
      n=n+'<div class="row">';
      n=n+'<div class="col">Create new keys';
      n=n+'</div>';
      n=n+'<div class="col">Or import keys';
      n=n+'</div>';
      n=n+'</div>';
      n=n+'<div class="row">';
      n=n+'<div class="col">';
      n=n+'<button type="button" class="btn btn-primary" id="newkeys">New Keys</button>';
      n=n+'</div>';
      n=n+'<div class="col">';
      n=n+'<button type="button" class="btn btn-primary" id="importkeys">Import Keys</button>'
      n=n+'</div>';
      n=n+'</div>';
      n=n+'</center>';
      document.getElementById("root").innerHTML = n;
      document.getElementById("newkeys").addEventListener("click", newkeys);
      document.getElementById("importkeys").addEventListener("click", importkeys);
    }
  });
// function to connect/change network
async function change_network() {
  // TODO set a red light
  let network='wss://testnet.bitg.org';
  if(document.getElementById("network")){
    network=document.getElementById('network').value;
  }
  const wsProvider = new api.WsProvider(network);
  apiv = await api.ApiPromise.create({ provider: wsProvider,types:
    {
      "CallOf": "Call",
      "DispatchTime": {
        "_enum": {
          "At": "BlockNumber",
          "After": "BlockNumber"
        }
      },
      "ScheduleTaskIndex": "u32",
      "DelayedOrigin": {
        "delay": "BlockNumber",
        "origin": "PalletsOrigin"
      },
      "StorageValue": "Vec<u8>",
      "GraduallyUpdate": {
        "key": "StorageKey",
        "targetValue": "StorageValue",
        "perBlock": "StorageValue"
      },
      "StorageKeyBytes": "Vec<u8>",
      "StorageValueBytes": "Vec<u8>",
      "RpcDataProviderId": "Text",
      "OrderedSet": "Vec<AccountId>",
      "OrmlAccountData": {
        "free": "Balance",
        "frozen": "Balance",
        "reserved": "Balance"
      },
      "OrmlBalanceLock": {
        "amount": "Balance",
        "id": "LockIdentifier"
      },
      "DelayedDispatchTime": {
        "_enum": {
          "At": "BlockNumber",
          "After": "BlockNumber"
        }
      },
      "DispatchId": "u32",
      "Price": "FixedU128",
      "OrmlVestingSchedule": {
        "start": "BlockNumber",
        "period": "BlockNumber",
        "periodCount": "u32",
        "perPeriod": "Compact<Balance>"
      },
      "VestingScheduleOf": "OrmlVestingSchedule",
      "PalletBalanceOf": "Balance",
      "ChangeBalance": {
        "_enum": {
          "NoChange": "Null",
          "NewValue": "Balance"
        }
      },
      "BalanceWrapper": {
        "amount": "Balance"
      },
      "BalanceRequest": {
        "amount": "Balance"
      },
      "EvmAccountInfo": {
        "nonce": "Index",
        "contractInfo": "Option<EvmContractInfo>",
        "developerDeposit": "Option<Balance>"
      },
      "CodeInfo": {
        "codeSize": "u32",
        "refCount": "u32"
      },
      "EvmContractInfo": {
        "codeHash": "H256",
        "maintainer": "H160",
        "deployed": "bool"
      },
      "EvmAddress": "H160",
      "CallRequest": {
        "from": "Option<H160>",
        "to": "Option<H160>",
        "gasLimit": "Option<u32>",
        "storageLimit": "Option<u32>",
        "value": "Option<U128>",
        "data": "Option<Bytes>"
      },
      "CID": "Vec<u8>",
      "ClassId": "u32",
      "ClassIdOf": "ClassId",
      "TokenId": "u64",
      "TokenIdOf": "TokenId",
      "TokenInfoOf": {
        "metadata": "CID",
        "owner": "AccountId",
        "data": "TokenData"
      },
      "TokenData": {
        "deposit": "Balance"
      },
      "Properties": {
        "_set": {
          "_bitLength": 8,
          "Transferable": 1,
          "Burnable": 2
        }
      },
      "BondingLedger": {
        "total": "Compact<Balance>",
        "active": "Compact<Balance>",
        "unlocking": "Vec<UnlockChunk>"
      },
      "Amount": "i128",
      "AmountOf": "Amount",
      "AuctionId": "u32",
      "AuctionIdOf": "AuctionId",
      "TokenSymbol": {
        "_enum": {
          "BITG": 0,
          "USDG": 1
        }
      },
      "CurrencyId": {
        "_enum": {
          "Token": "TokenSymbol",
          "DEXShare": "(TokenSymbol, TokenSymbol)",
          "ERC20": "EvmAddress"
        }
      },
      "CurrencyIdOf": "CurrencyId",
      "AuthoritysOriginId": {
        "_enum": [
          "Root"
        ]
      },
      "TradingPair": "(CurrencyId,  CurrencyId)",
      "AsOriginId": "AuthoritysOriginId",
      "SubAccountStatus": {
        "bonded": "Balance",
        "available": "Balance",
        "unbonding": "Vec<(EraIndex,Balance)>",
        "mockRewardRate": "Rate"
      },
      "Params": {
        "targetMaxFreeUnbondedRatio": "Ratio",
        "targetMinFreeUnbondedRatio": "Ratio",
        "targetUnbondingToFreeRatio": "Ratio",
        "unbondingToFreeAdjustment": "Ratio",
        "baseFeeRate": "Rate"
      },
      "Ledger": {
        "bonded": "Balance",
        "unbondingToFree": "Balance",
        "freePool": "Balance",
        "toUnbondNextEra": "(Balance, Balance)"
      },
      "ChangeRate": {
        "_enum": {
          "NoChange": "Null",
          "NewValue": "Rate"
        }
      },
      "ChangeRatio": {
        "_enum": {
          "NoChange": "Null",
          "NewValue": "Ratio"
        }
      },
      "BalanceInfo": {
        "amount": "Balance"
      },
      "Rate": "FixedU128",
      "Ratio": "FixedU128",
      "PublicKey": "[u8; 20]",
      "DestAddress": "Vec<u8>",
      "Keys": "SessionKeys2",
      "PalletsOrigin": {
        "_enum": {
          "System": "SystemOrigin",
          "Timestamp": "Null",
          "RandomnessCollectiveFlip": "Null",
          "Balances": "Null",
          "Accounts": "Null",
          "Currencies": "Null",
          "Tokens": "Null",
          "Vesting": "Null",
          "Utility": "Null",
          "Multisig": "Null",
          "Recovery": "Null",
          "Proxy": "Null",
          "Scheduler": "Null",
          "Indices": "Null",
          "GraduallyUpdate": "Null",
          "Authorship": "Null",
          "Babe": "Null",
          "Grandpa": "Null",
          "Staking": "Null",
          "Session": "Null",
          "Historical": "Null",
          "Authority": "DelayedOrigin",
          "ElectionsPhragmen": "Null",
          "Contracts": "Null",
          "EVM": "Null",
          "Sudo": "Null",
          "TransactionPayment": "Null"
        }
      },
      "LockState": {
        "_enum": {
          "Committed": "None",
          "Unbonding": "BlockNumber"
        }
      },
      "LockDuration": {
        "_enum": [
          "OneMonth",
          "OneYear",
          "TenYears"
        ]
      },
      "EraIndex": "u32",
      "Era": {
        "index": "EraIndex",
        "start": "BlockNumber"
      },
      "Commitment": {
        "state": "LockState",
        "duration": "LockDuration",
        "amount": "Balance",
        "candidate": "AccountId"
      },
      "AssetDetails": {
          "owner": "AccountId",
          "issuer": "AccountId",
          "admin": "AccountId",
          "freezer": "AccountId",
          "supply": "Balance",
          "deposit": "DepositBalance",
          "max_zombies": "u32",
          "min_balance":"Balance",
          "zombies":"u32",
          "accounts":"u32",
          "is_frozen":"bool"
      },
      "AssetMetadata": {
          "deposit":"DepositBalance",
          "name": "Vec<u8>",
          "symbol": "Vec<u8>",
          "decimals":"u8"
      },
      "AssetBalance" : {
          "balance":"Balance",
          "is_frozen":"bool",
          "is_zombie":"bool"
      },
      "AssetId":"u32",
      "BalanceOf":"Balance",
      "VCU": {
        "serial_number": "i32",
        "project": "Vec<u8>",
        "amount_co2": "Balance",
        "ipfs_hash": "Vec<u8>"
      }
    }  
   });
  // TODO set a green light
  // get balance
  let { nonce, data: balance } = await apiv.query.system.account(primaryaccount);
  if (balance.free>0){
    balancev=balance.free/1000000000000000000;
    balancevf=new Intl.NumberFormat().format(balancev);
  } else {
    balancev=0;
    balancevf="0.00";
  }
  document.getElementById("balance").innerHTML = '<h1>'+balancevf+' BITG</h1>';
  // get transactions and create the table
  let dt = new Date();
  let dtm=dt.toISOString().slice(0, 19).replace('T', '+');
  let url= 'https://testnet.bitg.org:9443/transactions?account='+primaryaccount+'&dts=2022-01-01+00:00:00&dte='+dtm;
  fetch(url)
  .then(response => response.json())
  .then(data => {
    let n='';
    n=n+'<table class="table table-striped table-hover">';
    n=n+'<thead>';
    n=n+'<tr>';
    n=n+'<th scope="col">Transactions</th>';
    n=n+'<th scope="col">Amount</th>';
    n=n+'</tr>';
    n=n+'</thead>';
    n=n+'<tbody>';
    n=n+'<tr></tr>';
    for(r in data.transactions){
      n=n+'<tr>';
      const dt=data['transactions'][r]['dtblockchain'];
      const amt=data['transactions'][r]['amount']/1000000000000000000;
      const amtf=new Intl.NumberFormat().format(amt);
      n=n+'<td>'+dt.substr(0,10)+'</dt>';
      n=n+'<td align ="right">'+amtf+' BITG</dt>';
      n=n+'</tr>';
    }
    document.getElementById("transactions").innerHTML = n;
  }); 
}
// generate keys pair
function newkeys(obj,error) {
  let k= new keyring.Keyring({ type: 'sr25519' });
  if (typeof error == 'undefined'){
      // generate mnemonic 24 words as key
      mnemonic=util_crypto.mnemonicGenerate(24);
      keyspairv = k.addFromUri(mnemonic, { name: '' }, 'sr25519');
  }
  // show the mnemonic seed and ask for password to secure them
  let n="<br><h3>Create New Keys</H3>"
  n=n+'<p>Please store carefully the secret words below in a safe place.</p>';
  n=n+'<p>They can be used to recover your keys in a different device and  should not be shared with untrusted parties.</p><p>Anyone having the secret words, can transfer your funds!</p>';
  n=n+'<p> Secret Words:</p>'
  n=n+'<div class="shadow-lg p-3 mb-5 bg-body rounded"><b>'+mnemonic+'</b></div>'
  n=n+'<p>Insert a STRONG password to encrypt the secret words on the local disk. A minimum of 12 characters should be used.</p>'
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Password</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword">';
  n=n+'</div>';
  n=n+'</div>';
  if (typeof error !== 'undefined') {
      n=n+'<div class="alert alert-danger" role="alert">';
      n=n+error;
      n=n+'</div>';
  }
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Repeat Password</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword2">';
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<div class="row"> <div class="col"><button type="button" class="btn btn-primary" id="storekeys">Submit</button></div>';
  n=n+'<div class="col"><button type="button" class="btn btn-secondary" id="storekeys">Back</button></div>';
  n=n+'</div>';
  document.getElementById("root").innerHTML = n;
  document.getElementById("storekeys").addEventListener("click", storekeys);
}
// import existing keys
function importkeys() {
    alert("Import keys")
}
// function to encrypt and store the secret words
function storekeys(){
    // check for password fields
    const pwd=document.getElementById('inputPassword').value;
    const pwd2=document.getElementById('inputPassword2').value;
    // check for minimum length
    if(pwd.length<1){
      newkeys("","Password must be at the least 12 characters");
      return;
    }
    if(pwd!=pwd2){
        newkeys("","Password fields are not matching!");
        return;
    }
    // get ascii value of first 2 chars
    const vb1=pwd.charCodeAt(0);
    const vb2=pwd.charCodeAt(1);
    const p=vb1*vb2; // position to derive other 3 passwords
    // derive the password used for encryption with an init vector (random string) and 10000 hashes with 3 different algorithms
    let randomstring = '';
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < 32; i++ ) {
      randomstring += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    let dpwd1='';
    let dpwd2='';
    let dpwd3='';
    let h=util_crypto.keccakAsU8a(pwd+randomstring);
    for (let i = 0; i < 100000; i++) {
      h=util_crypto.keccakAsU8a(h);
      if (i==p){
        dpwd1=h;
      }
      h=util_crypto.sha512AsU8a(h);
      if (i==p){
        dpwd2=h;
      }
      h=util_crypto.blake2AsU8a(h);
      if (i==p){
        dpwd3=h;
      }
    }
  
    // 3 Layers encryption
    // encrypt the secret words in AES256-CFB
    let ivf='';
    for ( let i = 0; i < 16; i++ ) {
      ivf += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const ivaescfb = aesjs.utils.utf8.toBytes(ivf);
    const keyaescfb= dpwd1.slice(0,32);
    let aesCfb = new aesjs.ModeOfOperation.cfb(keyaescfb, ivaescfb);
    var mnemonicbytes = aesjs.utils.utf8.toBytes(mnemonic);

    let encryptedaescfb = aesCfb.encrypt(mnemonicbytes);
    // encrypt the outoput of AES256-CFB in AES256-CTR
    let ivs='';
    for ( let i = 0; i < 16; i++ ) {
      ivs += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const ivaesctr = aesjs.utils.utf8.toBytes(ivs);
    //const keyaes= aesjs.utils.utf8.toBytes(dpwd2.slice(0,32));
    const keyaesctr= dpwd2.slice(0,32);
    let aesCtr = new aesjs.ModeOfOperation.ctr(keyaesctr, ivaesctr);
    let encryptedaesctr = aesCtr.encrypt(encryptedaescfb);
    // encrypt the outoput of AES256-CTR in AES256-OFB
    let ivso='';
    for ( let i = 0; i < 16; i++ ) {
      ivso += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const ivaesofb = aesjs.utils.utf8.toBytes(ivso);
    const keyaesofb= dpwd3.slice(0,32);
    let aesOfb = new aesjs.ModeOfOperation.ofb(keyaesofb, ivaesofb);
    let encryptedaesofb = aesOfb.encrypt(encryptedaesctr);
    let encryptedhex=aesjs.utils.hex.fromBytes(encryptedaesofb);
    //convert to Hex json
    let value='{"iv":"'+randomstring+'","ivaescfb":"'+util.u8aToHex(ivaescfb)+'","ivaesctr":"'+util.u8aToHex(ivaesctr)+'","ivaesofb":"'+util.u8aToHex(ivaesofb)+'","encrypted":"'+encryptedhex+'"}';
    // store encrypted data
    localStorage.setItem("webwallet", value);
    // store main account data
    localStorage.setItem("primaryaccount", keyspairv.address);
    dashboard();
}
// Main Dashboard 
function dashboard(){
  let n='<br><center><H3>Main Account</h3>'+primaryaccount.substring(0,4)+"..."+primaryaccount.substring(primaryaccount.length-4);
  //n=n+'<div id="primaryaccount" name="primaryaccount" autofocus>'+primaryaccount+'</div>';
  n=n+'&nbsp;';
  n=n+'<a href="#" id="copyaccount" ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"> \
  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/> \
  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/> \
  </svg></a>'
  n=n+'<br>';
  n=n+'<hr>'
  n=n+'<div id="balance"><h1>'+balancevf+' BITG</h1></div>';
  n=n+'<hr>'
  n=n+'<div class="row">';
  n=n+'<div class="col">';
  n=n+'<button type="button" class="btn btn-primary" id="buy">Buy</button>';
  n=n+'</div>';
  n=n+'<div class="col">';
  n=n+'<button type="button" class="btn btn-primary" id="send">Send</button>'
  n=n+'</div>';
  n=n+'<div class="col">';
  n=n+'<button type="button" class="btn btn-primary" id="swap">Swap</button>'
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<input id="primaryaccount" name="primaryaccount" type="text" value="'+primaryaccount+'" style="color:white;border:none;" >';
  n=n+'<br><div id="transactions">';
  n=n+'<table class="table table-striped table-hover">';
  n=n+'<thead>';
  n=n+'<tr>';
  n=n+'<th scope="col">Transaction</th>';
  n=n+'<th scope="col">Amount</th>';
  n=n+'</tr>';
  n=n+'</thead>';
  n=n+'<tbody>';
  n=n+'<tr></tr>';
  n=n+'</div">';
  
  n=n+'</center>';
  document.getElementById("root").innerHTML = n;
  document.getElementById("buy").addEventListener("click", buy);
  document.getElementById("send").addEventListener("click", send);
  document.getElementById("swap").addEventListener("click", swap);
  document.getElementById("copyaccount").addEventListener("click", clipboard_copy_account);

}
// function to show the form for sending funds
function send(){
  let n='<br><center><h3>Main Account</h3>'+primaryaccount.substring(0,4)+"..."+primaryaccount.substring(primaryaccount.length-4)+'<br>';
  n=n+'<hr>'
  n=n+'<div id="balance"><h1>'+balancevf+' BITG</h1></div>';
  n=n+"<hr><h3>Send Funds</H3>"
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputRecipient" class="col-sm-2 col-form-label">Recipient Account</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="text" class="form-control" id="inputRecipient" required>';
  n=n+'</div>';
  n=n+'</div>';
  if (typeof error !== 'undefined') {
      n=n+'<div class="alert alert-danger" role="alert">';
      n=n+error;
      n=n+'</div>';
  }
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputAmount" class="col-sm-2 col-form-label">Amount</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="number" class="form-control" id="inputAmount" required>';
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Password</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword" required>';
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<div class="row"> <div class="col"><button type="button" class="btn btn-primary" id="transfer">Transfer</button></div>';
  n=n+'<div class="col"><button type="button" class="btn btn-secondary" id="backmain">Back</button></div>';
  n=n+'</div>';
  n=n+'</center>';
  document.getElementById("root").innerHTML = n;
  document.getElementById("transfer").addEventListener("click", transferfunds);
  document.getElementById("backmain").addEventListener("click", dashboard);
}
// function to ask confirmation and submit the extrinsic
async function transferfunds(){
  let accountrecipient=document.getElementById("inputRecipient").value;
  let amount=document.getElementById("inputAmount").value;
  let password=document.getElementById("inputPassword").value;
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet")){
    encrypted=localStorage.getItem("webwallet");
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=await decrypt_webwallet(encrypted,password);
    if(r==true){
      let n="Do you confirm the transfer of: "
      n=n+amount;
      n=n+" BITG, to: "+accountrecipient+' ?';
      let r=confirm(n);
      if(r==true){
        const amountb=BigInt(amount)*1000000000000000000n;
        apiv.tx.balances.transfer(accountrecipient, amountb).signAndSend(keyspairv, ({ status, events }) => {
          if (status.isInBlock || status.isFinalized) {
            events
              // find/filter for failed events
              .filter(({ event }) =>
                api.events.system.ExtrinsicFailed.is(event)
              )
              // we know that data for system.ExtrinsicFailed is
              .forEach(({ event: { data: [error, info] } }) => {
                if (error.isModule) {
                  // for module errors, we have the section indexed, lookup
                  const decoded = api.registry.findMetaError(error.asModule);
                  const { docs, method, section } = decoded;
                  alert(`Error in transaction: ${section}.${method}: ${docs.join(' ')}`);
                } else {
                  // Other, CannotLookup, BadOrigin, no extra info
                  alert('Error in transaction:'+error.toString());
                }
              });
          }
        });
        alert("The transfer has been submitted to the blockchain, please check the result in the transaction history.");
        dashboard();
      }else{
        alert("The funds transfer has been cancelled!");
      }
    }else {
      alert("Password is wrong!")
      return;
    }
  }
}
// function to decrypt the web wallet and return a key pair
async function decrypt_webwallet(encrypted,pwd){
  // get ascii value of first 2 chars
  const vb1=pwd.charCodeAt(0);
  const vb2=pwd.charCodeAt(1);
  const p=vb1*vb2; // position to derive other 3 passwords
  // derive the password used for encryption with an init vector (random string) and 10000 hashes with 3 different algorithms
  const enc=JSON.parse(encrypted);
  let randomstring = enc.iv;
  let dpwd1='';
  let dpwd2='';
  let dpwd3='';
  let h=util_crypto.keccakAsU8a(pwd+randomstring);
  for (let i = 0; i < 100000; i++) {
    h=util_crypto.keccakAsU8a(h);
    if (i==p){
      dpwd1=h;
    }
    h=util_crypto.sha512AsU8a(h);
    if (i==p){
      dpwd2=h;
    }
    h=util_crypto.blake2AsU8a(h);
    if (i==p){
      dpwd3=h;
    }
  }
  // decrypt AES-OFB
  const ivaesofb=util.hexToU8a(enc.ivaesofb);
  const keyaesofb= dpwd3.slice(0,32);
  let aesOfb = new aesjs.ModeOfOperation.ofb(keyaesofb, ivaesofb);
  const encryptedhex=enc.encrypted;
  const encryptedaesofb=aesjs.utils.hex.toBytes(encryptedhex);
  let encryptedaesctr = aesOfb.decrypt(encryptedaesofb);
  // decrypt AES-CTR
  const ivaesctr=util.hexToU8a(enc.ivaesctr);
  const keyaesctr= dpwd2.slice(0,32);
  let aesCtr = new aesjs.ModeOfOperation.ctr(keyaesctr, ivaesctr);
  let encryptedaescfb = aesCtr.decrypt(encryptedaesctr);
  // decrypt AES-CFB
  const ivaescfb=util.hexToU8a(enc.ivaescfb);
  const keyaescfb= dpwd1.slice(0,32);
  let aesCfb = new aesjs.ModeOfOperation.cfb(keyaescfb, ivaescfb);
  let decrypted = aesCfb.decrypt(encryptedaescfb);
  let mnemonicdecrypted = aesjs.utils.utf8.fromBytes(decrypted);
  if(!mnemonicdecrypted){
    return(false);
  }else {
    keyringv= new keyring.Keyring({ type: 'sr25519' });
    keyspairv = keyringv.addFromUri(util.u8aToString(mnemonicdecrypted), { name: '' }, 'sr25519');
    return(true);
  }

}
//copy the account to the clipboard
async function clipboard_copy_account(){
  document.getElementById("primaryaccount").select();
  document.execCommand("copy");
  alert("Account: "+primaryaccount);
}