//TODO:  change account description, remove account, copy account without hidden field, improve support link
// update manifest to ver. 3.0
// TODO set a red light and switch to green when connected
// evaluate the encryption of account description and account code (better privacy)
// ask for access password initially to decrypt the data above and keep it open for the session till the browser is open

let keyspairv='';
let keyringv= new keyring.Keyring({ type: 'sr25519' });
let mnemonic='';
let apiv='';
let currentaccount='';
let balancev=0;
let balancevf='0.00';
let currentaccountid='1';
let accountdescription="Main Account";

// get last used account id
if(localStorage.getItem("webwalletcurrentaccountid")){
  currentaccountid=localStorage.getItem("webwalletcurrentaccountid");
  if(!localStorage.getItem("webwalletaccount"+currentaccountid)){ 
    currentaccountid='1';
  } 
}
// get account description
if(localStorage.getItem("webwalletdescription"+currentaccountid)){
  accountdescription=localStorage.getItem("webwalletdescription"+currentaccountid);
  if(accountdescription.length>20){
    accountdescription=accountdescription.substring(0,20);
  }
}
// get web wallet account
if(localStorage.getItem("webwalletaccount"+currentaccountid)){
  currentaccount=localStorage.getItem("webwalletaccount"+currentaccountid);
}

// add listeners for events (you cannot use onclick event in the extension)
document.addEventListener('DOMContentLoaded', function() {
   // open connection
    change_network();
    // network selection
    document.getElementById("network").addEventListener("change", change_network);
    // if at the least one account is available, we show it
    if(currentaccount.length>0){
      const params = new URLSearchParams(window.location.search)
      let command="";
      // evaluate possible actions
      if (params.has("command")){
        command=params.get('command');
        // transfer of funds
        if(command=="transfer" && params.has("recipient") && params.has("amount") && params.get("domain")){
          send(params.get("recipient"),params.get("amount"),params.get("domain")); 
        }
        // sign-in
        if(command=="signin" && params.get("domain")){
          signin(params.get("domain")); 
        }
        // tx command to submit any kind of extrinsic 
        if(command=="tx" && params.has("pallet") && params.has("call")  && params.has("parameters")&& params.get("domain")){
          extrinsic(params.get("pallet"),params.get("call"),params.get("parameters"),params.get("domain")); 
        }
      }else {
        // main dashboard
        dashboard();
      }
    //otherwise we let to create a new account
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
  // set identicon
  document.getElementById("idicon").innerHTML='<svg width="40" height="40" data-jdenticon-value="'+currentaccount+'"></svg>';
  // TODO set a red light and switch to green when connected
  let network='wss://testnet.bitgreen.org';
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
  // get balance and show it
  let { nonce, data: balance } = await apiv.query.system.account(currentaccount);
  if (balance.free>0){
    balancev=balance.free/1000000000000000000;
    balancevf=new Intl.NumberFormat().format(balancev);
  } else {
    balancev=0;
    balancevf="0.00";
  }
  document.getElementById("balance").innerHTML = '<h1>'+balancevf+' BBB</h1>';

  // get transactions and create the table
  let dt = new Date();
  let dtm=dt.toISOString().slice(0, 19).replace('T', '+');
  let url= 'https://testnet.bitgreen.org/api/transactions?account='+currentaccount+'&dts=2022-01-01+00:00:00&dte='+dtm;
  let n='';
  fetch(url)
  .then(response => response.json())
  .then(data => {
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
      const dt=data['transactions'][r]['date'];
      const amt=data['transactions'][r]['amount']/1000000000000000000;
      const amtf=new Intl.NumberFormat().format(amt);
      n=n+'<td>'+dt.substr(0,10)+'</dt>';
      n=n+'<td align ="right">'+amtf+' BBB</dt>';
      n=n+'</tr>';
    }
    try{
      document.getElementById("transactions").innerHTML = n;
    } 
    catch(e){
      console.log(e);
    }
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
  let n="<br><h3>Create New Keys</H3>"
  n=n+'<p>Please store carefully the secret words below in a safe place.</p>';
  n=n+'<p>They can be used to recover your keys in a different device and  should not be shared with untrusted parties.</p><p>Anyone having the secret words, can transfer your funds!</p>';
  n=n+'<p> Secret Words:</p>'
  n=n+'<div class="shadow-lg p-3 mb-5 bg-body rounded"><b>'+mnemonic+'</b></div>'
  n=n+'<p>Insert a STRONG password to encrypt the secret words on the local disk. A minimum of 12 characters should be used.</p>'
  // passwords
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Password</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword">';
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Repeat Password</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword2">';
  n=n+'</div>';
  n=n+'</div>';
  //description
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="description" class="col-sm-2 col-form-label">Description</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="text" class="form-control" id="description">';
  n=n+'</div>';
  n=n+'</div>';
  // show error if any
  if (typeof error !== 'undefined') {
    n=n+'<div class="alert alert-danger" role="alert">';
    n=n+error;
    n=n+'</div>';
}
  n=n+'<div class="row"> <div class="col"><button type="button" class="btn btn-primary" id="storekeys">Submit</button></div>';
  n=n+'<div class="col"><button type="button" class="btn btn-secondary" id="backmain">Back</button></div>';
  n=n+'</div>';
  document.getElementById("root").innerHTML = n;
  document.getElementById("storekeys").addEventListener("click", storekeys);
  document.getElementById("backmain").addEventListener("click", dashboard);

}
// import existing keys
function importkeys(obj,error) {
  // show the mnemonic seed and ask for password to secure them
  let n="<br><h3>Import Account</H3>"
  // mnemonic seed
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputMnemonic" class="col-sm-2 col-form-label">Mnemonic Seed (12..24 words)</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<textarea class="form-control" id="inputMnemonic" cols="3"></textarea>';
  n=n+'</div>';
  n=n+'</div>';
  //passwords
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Password</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword">';
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Repeat Password</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword2">';
  n=n+'</div>';
  n=n+'</div>';
  //description
  n=n+'<div class="mb-3 row">';
  n=n+'<label for="description" class="col-sm-2 col-form-label">Description</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="text" class="form-control" id="description">';
  n=n+'</div>';
  n=n+'</div>';
  // show errors if any
  if (typeof error !== 'undefined') {
    n=n+'<div class="alert alert-danger" role="alert">';
    n=n+error;
    n=n+'</div>';
  }
  n=n+'<div class="row"> <div class="col"><button type="button" class="btn btn-primary" id="storekeys">Submit</button></div>';
  n=n+'<div class="col"><button type="button" class="btn btn-secondary" id="backmain">Back</button></div>';
  n=n+'</div>';
  document.getElementById("root").innerHTML = n;
  document.getElementById("storekeys").addEventListener("click", importkeysvalidation);
  document.getElementById("backmain").addEventListener("click", dashboard);

}
// function to validate the seed phrase and eventually store the imported account
function importkeysvalidation(){
  const m=document.getElementById('inputMnemonic').value;
  const isValidMnemonic = util_crypto.mnemonicValidate(m);  
  if(!isValidMnemonic){
    importkeys("","Invalid Mnemonic Seed");
    return;
  } else {
    let k= new keyring.Keyring({ type: 'sr25519' });
    keyspairv = k.addFromUri(m, { name: '' }, 'sr25519');
    mnemonic=m;
    storekeys("",importkeys);
  }
}

// function to encrypt and store the secret words
function storekeys(obj,callback){
    // check for password fields
    const pwd=document.getElementById('inputPassword').value;
    const pwd2=document.getElementById('inputPassword2').value;
    let description=document.getElementById('description').value;
    if (typeof callback === 'undefined') {
      callback=newkeys;
    }
    // check for minimum length
    if(pwd.length<1){
      callback("","Password must be at the least 12 characters");
      return;
    }
    if(pwd!=pwd2){
        callback("","Password fields are not matching!");
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
    // get the next available accountid 
    for(i=1;i<=99;i++){
      if(!localStorage.getItem("webwalletaccount"+i)) {
        currentaccountid=i;
        break;
      }
    }
    if(i>99){
      alert("Too many accounts already created");
    }else {
      // store encrypted data
      localStorage.setItem("webwallet"+currentaccountid, value);
      // store main account data
      localStorage.setItem("webwalletaccount"+currentaccountid, keyspairv.address);
      if(!description){
        localStorage.setItem("webwalletdescription"+currentaccountid, keyspairv.address);
      }
      else{
        localStorage.setItem("webwalletdescription"+currentaccountid, description);
      }

    }
    dashboard();
}
// Main Dashboard 
function dashboard(){
  // refresh the identicon
  let ic=jdenticon.toSvg(currentaccount,40);
  try {
    document.getElementById("idicon").innerHTML = ic;
  } catch(e){
    console.log("No identicon available",e);
  }
  //let n='<br><center><H3>'+accountdescription+'</h3>'+currentaccount.substring(0,4)+"..."+currentaccount.substring(currentaccount.length-4);
  let n='<br><center><H3>'+accountdescription+'</h3>';
  n=n+'<input id="currentaccount" name="currentaccount" type="text" spellcheck="false" value="'+currentaccount+'" size="57" style="font-size:9px;">';
  n=n+'&nbsp;';
  n=n+'<a href="#" id="copyaccount" ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"> \
  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/> \
  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/> \
  </svg></a>'
  n=n+'<br>';
  n=n+'<hr>'
  n=n+'<div id="balance"><h1>'+balancevf+' BBB</h1></div>';
  n=n+'<hr>'
  n=n+'<div class="row">';
  n=n+'<div class="col">';
  n=n+'<button type="button" class="btn btn-primary" id="buy">Buy</button>';
  n=n+'</div>';
  n=n+'<div class="col">';
  n=n+'<button type="button" class="btn btn-primary" id="send">Send</button>'
  n=n+'</div>';
  n=n+'<div class="col">';
  n=n+'<button type="button" class="btn btn-primary" id="staking">Staking</button>'
  n=n+'</div>';
  n=n+'</div>';
  //n=n+'<input id="currentaccount" name="currentaccount" type="text" value="'+currentaccount+'" style="color:white;border:none;" >';
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
  document.getElementById("staking").addEventListener("click", staking);
  document.getElementById("copyaccount").addEventListener("click", clipboard_copy_account);
  document.getElementById("idicon").addEventListener("click", manageaccounts);
}
// Manage accounts (create/import/delete)
function manageaccounts(){
  let n='<br><center><H3>Manage Accounts</h3>';
  n=n+'&nbsp;';
  n=n+'<hr>'
  // add list of the available accounts
  n=n+'<ul class="list-group" style="text-align:left;">';
  for(i=1;i<=99;i++){
    if(localStorage.getItem("webwalletaccount"+i)) {
      n=n+'<li class="list-group-item list-group-item-action" id="'+i+'">';
      let ac=localStorage.getItem("webwalletaccount"+i);
      n=n+jdenticon.toSvg(ac,40);
      n=n+localStorage.getItem("webwalletdescription"+i);
      n=n+" ("+ac.substring(0,4)+"..."+ac.substring(ac.length-4)+')</li>';
    }
  }
  n=n+"</ul>"
  n=n+'<hr>'
  // icon for adding account
  n=n+'<ul class="list-group">';
  n=n+'<li class="list-group-item list-group-item-action" id="createaccount">';
  n=n+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-plus" viewBox="0 0 16 16"><path d="M8.5 6a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V10a.5.5 0 0 0 1 0V8.5H10a.5.5 0 0 0 0-1H8.5V6z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>';
  n=n+' Create Account';
  n=n+'</li>';
  n=n+'</ul>';
  // icon for importing account
  n=n+'<ul class="list-group">';
  n=n+'<li class="list-group-item list-group-item-action" id="importaccount">';
  n=n+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-down" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M3.5 10a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0 0 1h2A1.5 1.5 0 0 0 14 9.5v-8A1.5 1.5 0 0 0 12.5 0h-9A1.5 1.5 0 0 0 2 1.5v8A1.5 1.5 0 0 0 3.5 11h2a.5.5 0 0 0 0-1h-2z"/><path fill-rule="evenodd" d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z"/></svg>';
  n=n+' Import Account';
  n=n+'</li>';
  n=n+'</ul>';
  // icon for support
  n=n+'<ul class="list-group">';
  n=n+'<li class="list-group-item list-group-item-action" id="support">';
  n=n+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
  n=n+' Support&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
  n=n+'</li>';
  n=n+'</ul>';  
  n=n+'<hr>'
  n=n+'</center>';
  document.getElementById("root").innerHTML = n;
  document.getElementById("createaccount").addEventListener("click", newkeys);
  document.getElementById("importaccount").addEventListener("click", importkeys);
  document.getElementById("support").addEventListener("click", contactsupport);
  for(i=1;i<=99;i++){
    if(localStorage.getItem("webwalletaccount"+i)) {
      document.getElementById(i).addEventListener("click", function(){ setaccount(this.id);},false);
    } else {
      break;
    }
  }
}
// function to open a new tab to contact the support
function contactsupport(){
  window.open("https://bitgreen.org/contact");
}
// function to set new account and return to dashboard
function setaccount(id){
  currentaccount=localStorage.getItem("webwalletaccount"+id);
  currentaccountid=i;
  // set the last used account 
  localStorage.setItem("webwalletcurrentaccountid",id);
  // set accountdescription for showing in the different screens
  if(localStorage.getItem("webwalletdescription"+id)){
    accountdescription=localStorage.getItem("webwalletdescription"+id);
    if(accountdescription.length>20){
      accountdescription=accountdescription.substring(0,20);
    }
  }
  dashboard();
}
// function to show the form for sending funds
function send(recipient,amount,domain){
  let n='<br><center><h3>Main Account</h3>'+currentaccount.substring(0,4)+"..."+currentaccount.substring(currentaccount.length-4)+'<br>';
  n=n+'<hr>'
  n=n+'<div id="balance"><h1>'+balancevf+' BBB</h1></div>';
  n=n+"<hr><h3>Send Funds</H3>"
  n=n+'<div class="mb-3 row">';
  if(typeof domain!=='undefined'){
    n=n+'<div class="mb-3 row">';
    n=n+'<div class="col-sm-10"><div class="alert alert-warning" role="alert">Originated from: '+domain+'</div></div></div>';
  }
  n=n+'<div class="mb-3 row">';
  n=n+'<div class="col-sm-10">';
  if(typeof recipient==='string'){
    n=n+'<input type="text" class="form-control" id="inputRecipient" required placeholder="Recipient" value="'+recipient+'">';
  }else {
    n=n+'<input type="text" class="form-control" id="inputRecipient" required placeholder="Recipient">';
  }
  n=n+'</div>';
  n=n+'</div>';
  if (typeof error !== 'undefined') {
      n=n+'<div class="alert alert-danger" role="alert">';
      n=n+error;
      n=n+'</div>';
  }
  n=n+'<div class="mb-3 row">';
  //n=n+'<label for="inputAmount" class="col-sm-2 col-form-label">Amount</label>';
  n=n+'<div class="col-sm-10">';
  if(typeof amount!=='undefined'){
    n=n+'<input type="number" class="form-control" id="inputAmount" required placeholder="Amount" value="'+amount+'">';
  }
  else{
    n=n+'<input type="number" class="form-control" id="inputAmount" required placeholder="Amount">';
  }
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<div class="mb-3 row">';
  //n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Password</label>';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword" required placeholder="password">';
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
// function to show the form to sign-in
function signin(domain){
  let n='<br><center><h3>Account</h3>'+currentaccount.substring(0,4)+"..."+currentaccount.substring(currentaccount.length-4)+'<br>';
  n=n+'<hr>'
  n=n+'<div id="balance"><h1>'+balancevf+' BBB</h1></div>';
  n=n+"<hr>";
  if(typeof domain!=='undefined'){
    n=n+'<div class="alert alert-warning" role="alert">Originated from: '+domain+'</div>';
    n=n+'<input type="hidden" name="domain" id="domain" value="'+domain+'">';
  }
  n=n+"<h3>Sign In</H3>"  
  n=n+'<div class="mb-3 row">';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword" required placeholder="password">';
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<div class="row"> <div class="col"><button type="button" class="btn btn-primary" id="signin">Sign In</button></div>';
  n=n+'<div class="col"><button type="button" class="btn btn-secondary" id="backmain">Back</button></div>';
  n=n+'</div>';
  n=n+'</center>';
  document.getElementById("root").innerHTML = n;
  document.getElementById("signin").addEventListener("click", signinexecute);
  document.getElementById("backmain").addEventListener("click", dashboard);
}
// function to show the form to submit an extrisinc
async function extrinsic(pallet,call,parameters,domain){
  let n='<br><center><h3>Main Account</h3>'+currentaccount.substring(0,4)+"..."+currentaccount.substring(currentaccount.length-4)+'<br>';
  n=n+'<hr>'
  n=n+'<div id="balance"><h1>'+balancevf+' BBB</h1></div>';
  n=n+"<hr>";
  if(typeof domain!=='undefined'){
    n=n+'<div class="alert alert-warning" role="alert">Originated from: '+domain+'</div>';
    n=n+'<input type="hidden" name="domain" id="domain" value="'+domain+'">';
  }
  n=n+"<h3>"+pallet+" - "+call+"</H3>"  
  // insert the fields received
  n=n+'<input type="hidden" id="pallet" value="'+pallet+'">';
  n=n+'<input type="hidden" id="call" value="'+call+'">';
  const p= await stringToHex(parameters);
  n=n+'<input type="hidden" id="parameters" value="'+p+'">';
  // TODO SHOW THE PARAMETERS?
  n=n+'<div class="mb-3 row">';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword" required placeholder="password">';
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<div class="row"> <div class="col"><button type="button" class="btn btn-primary" id="submit">Submit</button></div>';
  n=n+'<div class="col"><button type="button" class="btn btn-secondary" id="backmain">Back</button></div>';
  n=n+'</div>';
  n=n+'</center>';
  document.getElementById("root").innerHTML = n;
  document.getElementById("submit").addEventListener("click", submitextrinsic);
  document.getElementById("backmain").addEventListener("click", dashboard);
}
// function to manage the staking of funds
async function staking(){
  let n='<br><center><h3>Main Account</h3>'+currentaccount.substring(0,4)+"..."+currentaccount.substring(currentaccount.length-4)+'<br>';
  n=n+'<hr>'
  n=n+'<div id="balance"><h1>'+balancevf+' BBB</h1></div>';
  n=n+"<hr>";
  //n=n+"<h3>Staking</h3>"
  // get amount bonded
  let bondamount= await get_amount_bonded(currentaccount);
  let nominator='';
  if(bondamount>0){
    nominator= await get_nominator(currentaccount);
  }
  if(bondamount>0){
    const bondamountv=bondamount/1000000000000000000;
    const bondamountvf=new Intl.NumberFormat().format(bondamountv);
    n=n+'<div id="stake"><h3>';
    if(nominator.length==0){
      n=n+'Bonded: ';
    }else {
      n=n+"Staken: ";
    }
    n=n+bondamountvf+' BBB</h3></div>';
  }else {
    n=n+"<h3>Staking</h3>"
  }
  // input amount
  if(bondamount==0){
    n=n+'<div class="mb-3 row">';
    n=n+'<div class="col-sm-10">';
    n=n+'<input type="number" class="form-control" id="inputAmount" required min="1" placeholder="Amount">';
    n=n+'</div>';
    n=n+'</div>';
  }
  // validators list box
  if (bondamount>0 && nominator.length==0) {
    n=n+'<div class="mb-3 row">';
    n=n+'<div class="col-sm-10">';
    n=n+'<select class="form-select form-select-sg mb-3" aria-label=".form-select-sg validators" name="validator" id="validator">';
    n=n+'<option value="0" selected>Select a Validator</option>';
    const validators = await apiv.query.session.validators();
    for (const validator of validators) {
      let vt=validator.toString();
      n=n+'<option value="'+vt+'">'+vt+'</option>';
    }
    n=n+'</select></div></div>';
  }
  // password
  n=n+'<div class="mb-3 row">';
  n=n+'<div class="col-sm-10">';
  n=n+'<input type="password" class="form-control" id="inputPassword" required placeholder="Password">';
  n=n+'</div>';
  n=n+'</div>';
  n=n+'<div id="error"></div>';
  n=n+'<div class="row">';
  // show appropriate buttons following the status of the staking
  if(bondamount>0 && nominator.length==0){
    n=n+'<div class="col"><button type="button" class="btn btn-primary" id="stakeid" " >Stake</button></div>';
    n=n+'<div class="col"><button type="button" class="btn btn-primary" id="unbondid">Unbond</button></div>';
  }
  else if(bondamount>0 && nominator.length>0){
    n=n+'<div class="col"><button type="button" class="btn btn-primary" id="unstakeid">Unstake</button></div>';
  }
  else if( bondamount==0) {
    n=n+'<div class="col"><button type="button" class="btn btn-primary" id="bondid">Bond</button></div>';
  }
  n=n+'<div class="col"><button type="button" class="btn btn-secondary" id="backmain">Back</button></div>';
  n=n+'</div>';
  n=n+'</center>';

  document.getElementById("root").innerHTML = n;
  if(bondamount>0 && nominator.length==0){
    document.getElementById("stakeid").addEventListener("click", stake);
    document.getElementById("unbondid").addEventListener("click", unbond);
  }
  else if (bondamount>0 && nominator.length>0){
    document.getElementById("unstakeid").addEventListener("click", unstake);
  }else if( bondamount==0) {
    document.getElementById("bondid").addEventListener("click", bond);
  }
  document.getElementById("backmain").addEventListener("click", dashboard);
}
// function to bond the amount inserted
async function bond(){
  let amount=document.getElementById("inputAmount").value;
  let password=document.getElementById("inputPassword").value;
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet"+currentaccountid)){
    encrypted=localStorage.getItem("webwallet"+currentaccountid);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=await decrypt_webwallet(encrypted,password);
    if(r==true){
      let n="Do you confirm the bonding of: "
      n=n+amount;
      n=n+" BBB?";
      let r=confirm(n);
      if(r==true){
        const amountb=BigInt(amount)*1000000000000000000n;
        apiv.tx.staking.bond(keyspairv.address,amountb,1)
          .signAndSend(keyspairv, ({ status, events, dispatchError }) => {
          if (status.isInBlock || status.isFinalized) {
            if (dispatchError) {
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = apiv.registry.findMetaError(dispatchError.asModule);
                const { docs, name, section } = decoded;
                alert(`Error in transaction: ${section}.${name}: ${docs.join(' ')}`);
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                alert(`Error in transaction: ${dispatchError.toString()}`);
              }
            } 
          }
        });
        alert("The bonding has been submitted to the blockchain, please check the result in the transaction history.");
        dashboard();
      }else{
        alert("The bonding has been cancelled!");
      }
    }else {
      alert("Password is wrong!")
      return;
    }
  }
}
// function to unbond the current fund
async function unbond(){
  let amount= await get_amount_bonded(currentaccount);
  let password=document.getElementById("inputPassword").value;
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet"+currentaccountid)){
    encrypted=localStorage.getItem("webwallet"+currentaccountid);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=await decrypt_webwallet(encrypted,password);
    if(r==true){
      let n="Do you confirm the unbonding of: "
      n=n+(amount/1000000000000000000);
      n=n+" BBB? It will take effect within 1 hour.";
      let r=confirm(n);
      if(r==true){
        const amountb=BigInt(amount);
        apiv.tx.staking.unbond(amountb)
          .signAndSend(keyspairv, ({ status, events, dispatchError }) => {
          if (status.isInBlock || status.isFinalized) {
            if (dispatchError) {
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = apiv.registry.findMetaError(dispatchError.asModule);
                const { docs, name, section } = decoded;
                alert(`Error in transaction: ${section}.${name}: ${docs.join(' ')}`);
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                alert(`Error in transaction: ${dispatchError.toString()}`);
              }
            } 
          }
        });
        alert("The unbonding has been submitted to the blockchain, please check the result in the transaction history and expect the effect after 1 hour.");
        dashboard();
      }else{
        alert("The unbonding has been cancelled!");
      }
    }else {
      alert("Password is wrong!")
      return;
    }
  }
}
// function to stake the amount inserted
async function stake(){
  let validator=document.getElementById("validator").value;
  let password=document.getElementById("inputPassword").value;
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet"+currentaccountid)){
    encrypted=localStorage.getItem("webwallet"+currentaccountid);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=await decrypt_webwallet(encrypted,password);
    if(r==true){
      let n="Do you confirm the nomination of validator: "+validator+" ?";
      let r=confirm(n);
      if(r==true){
        console.log("Nominating Validator:"+validator);
        const validators=[validator];
        apiv.tx.staking.nominate(validators)
          .signAndSend(keyspairv, ({ status, events, dispatchError }) => {
          if (status.isInBlock || status.isFinalized) {
            if (dispatchError) {
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = apiv.registry.findMetaError(dispatchError.asModule);
                const { docs, name, section } = decoded;
                alert(`Error in transaction: ${section}.${name}: ${docs.join(' ')}`);
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                alert(`Error in transaction: ${dispatchError.toString()}`);
              }
            } 
          }
        });
        alert("The staking has been submitted to the blockchain, please check the result in the transaction history.");
        dashboard();
      }else{
        alert("The staking has been cancelled!");
      }
    }else {
      alert("Password is wrong!")
      return;
    }
  }
}
// function to unstake the amount inserted
async function unstake(){
  let password=document.getElementById("inputPassword").value;
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet"+currentaccountid)){
    encrypted=localStorage.getItem("webwallet"+currentaccountid);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=await decrypt_webwallet(encrypted,password);
    if(r==true){
      let n="Do you confirm to removal of your staking ? It will be done within 1 hour (ERA time)";
      let r=confirm(n);
      if(r==true){
        apiv.tx.staking.chill()
          .signAndSend(keyspairv, ({ status, events, dispatchError }) => {
          if (status.isInBlock || status.isFinalized) {
            if (dispatchError) {
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = apiv.registry.findMetaError(dispatchError.asModule);
                const { docs, name, section } = decoded;
                alert(`Error in transaction: ${section}.${name}: ${docs.join(' ')}`);
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                alert(`Error in transaction: ${dispatchError.toString()}`);
              }
            } 
          }
        });
        alert("The unstaking has been submitted to the blockchain, please check the result in the transaction history.");
        dashboard();
      }else{
        alert("The unstaking has been cancelled!");
      }
    }else {
      alert("Password is wrong!")
      return;
    }
  }
}
// function to ask confirmation and submit the extrinsic
async function transferfunds(){
  let accountrecipient=document.getElementById("inputRecipient").value;
  let amount=document.getElementById("inputAmount").value;
  let password=document.getElementById("inputPassword").value;
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet"+currentaccountid)){
    encrypted=localStorage.getItem("webwallet"+currentaccountid);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=await decrypt_webwallet(encrypted,password);
    if(r==true){
      let n="Do you confirm the transfer of: "
      n=n+amount;
      n=n+" BBB, to: "+accountrecipient+' ?';
      let r=confirm(n);
      if(r==true){
        const amountb=BigInt(amount)*1000000000000000000n;
        apiv.tx.balances.transfer(accountrecipient, amountb)
          .signAndSend(keyspairv, ({ status, events }) => {
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
          }
        );
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
// function to submit the extrinsic
async function submitextrinsic(){
  const pallet=document.getElementById("pallet").value;
  const call=document.getElementById("call").value;
  const password=document.getElementById("inputPassword").value;
  const parametershex=document.getElementById("parameters").value;
  const parameterstxt= await hexToString(parametershex);
  console.log("parameterstxt:",parameterstxt);
  const parameters=JSON.parse(parameterstxt);
  console.log("parameters:",parameters);
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet"+currentaccountid)){
    encrypted=localStorage.getItem("webwallet"+currentaccountid);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=await decrypt_webwallet(encrypted,password);
    if(r==true){
      // build the transactions using "spread" operator to pass the correct number of parameters
      apiv.tx[pallet][call](...parameters).signAndSend(keyspairv, ({ status, events,dispatchError }) => {
          // status would still be set, but in the case of error we can shortcut
          // to just check it (so an error would indicate InBlock or Finalized)
          if (dispatchError) {
            if (dispatchError.isModule) {
              // for module errors, we have the section indexed, lookup
              const decoded = apiv.registry.findMetaError(dispatchError.asModule);
              const { docs, name, section } = decoded;
              const e=`${section}.${name}: ${docs.join(' ')}`;
              console.log("Transaction Error: ",e);
              alert("Transaction Error: "+e);
            } else {
              // Other, CannotLookup, BadOrigin, no extra info
              console.log(dispatchError.toString());
              alert("Transaction Error: "+dispatchError.toString());
            }
          }
        });
      alert("The Transactions has been submitted to the blockchain, please check the result in the transaction history.");
      dashboard();
    }else {
      alert("Password is wrong!")
      return;
    }
  }
}
// function to execute the signin
async function signinexecute(){
  let password=document.getElementById("inputPassword").value;
  let domain=document.getElementById("domain").value;
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet"+currentaccountid)){
    encrypted=localStorage.getItem("webwallet"+currentaccountid);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=await decrypt_webwallet(encrypted,password);
    if(r==true){
      let n="Do you confirm the sign in?"
      let r=confirm(n);
      if(r==true){
        // get current epoch time
        let dt = new Date();
        let timestamp = dt.getTime()
        let message = timestamp.toString()+"#"+domain;
        const signature = keyspairv.sign(util.stringToU8a(message));
        //const isValid = keyspairv.verify(util.stringToU8a(message), signature, keyspairv.publicKey);
        //const isValid=util_crypto.signatureVerify(util.stringToU8a(message), signature,keyspairv.address);
        //const hexsignature=util.u8aToHex(signature);
        //console.log(`signature ${util.u8aToHex(signature)} is ${isValid ? 'valid' : 'invalid'}`);
        // return connection token
        let cdt=new Date();
        cdt.setMonth(cdt.getMonth() + 1);
        let asw={"message": message, "signature": util.u8aToHex(signature), "address": keyspairv.address, "publickey": util.u8aToHex(keyspairv.publicKey)};
        //console.log("keypairv.address: ",keyspairv.address);
        let asws=JSON.stringify(asw);
        //console.log("asws: ",asws);
        // Target the original caller
        chrome.runtime.sendMessage({ type: "BROWSER-WALLET", command: "signinanswer",message: asws}, (response) => {
          console.log('Received web page data', response);
        });
        window.close();
      }else{
        alert("The signin has been cancelled!");
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
    try {
      keyspairv = keyringv.addFromUri(mnemonicdecrypted, { name: '' }, 'sr25519');
      return(true);
    }
    catch(e){
      console.log(e);
      return(false);
    }
    
  }

}

//copy the account to the clipboard
async function clipboard_copy_account(){
  document.getElementById("currentaccount").select();
  document.execCommand("copy");
  alert("Account Copied: "+currentaccount);
}
// function to get the amount bonded for staking
async function get_amount_bonded(address){
  const locks = await apiv.query.balances.locks(address);
  for (const lock of locks) {
    if(lock.id.toString()=='0x7374616b696e6720'){  //staking in hex
        return(parseFloat(lock.amount));
    }
   }
   return(0);
}
// function to read of there is a nominator for an account
async function get_nominator(address){
  console.log(address);
  const nominators = await apiv.query.staking.nominators(address);
  if (nominators.isSome) {
      let n=nominators.unwrap();
      console.log(n.targets[0].toString());
      return(n.targets[0].toString());
  }else {
      return("");
  }
}
// function to convert string to hex
async function stringToHex(asciiString) {
  let hex = '';
  let tempASCII, tempHex;
  asciiString.split('').map( i => {
      tempASCII = i.charCodeAt(0)
      tempHex = tempASCII.toString(16);
      hex = hex + tempHex + ' ';
  });
  hex = hex.trim();
  return(hex);
}
// function to convert hex to string
async  function hexToString(hexString) {
  let stringOut = '';
  hexString.split(' ').map( (i) => {
      tempAsciiCode = parseInt(i, 16);
      stringOut = stringOut + String.fromCharCode(tempAsciiCode);
  });
  return(stringOut);
}
