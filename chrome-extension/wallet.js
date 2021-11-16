
let keyspair='';
let mnemonic='';
let apiv='';
let primaryaccount='';
change_network();
if(localStorage.getItem("primaryaccount")){
  primaryaccount=localStorage.getItem("primaryaccount");
}
alert("primary account:"+primaryaccount);
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
// function to connect/change networ
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
}
// generate keys pair
function newkeys(obj,error) {
  let k= new keyring.Keyring({ type: 'sr25519' });
  if (typeof error == 'undefined'){
      // generate mnemonic 24 words as key
      mnemonic=util_crypto.mnemonicGenerate(24);
      keyspair = k.addFromUri(mnemonic, { name: '' }, 'sr25519');
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
    let randomstring = ' ';
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
    // encrypt the secret words AES256
    const secretwordsPreEncryption = util.stringToU8a(mnemonic);
    const { encrypted, nonce } = util_crypto.naclEncrypt(secretwordsPreEncryption, h);
    //convert to Hex json
    let value='{"iv":"'+util.u8aToHex(randomstring)+'","nonce":"'+util.u8aToHex(nonce)+'","encrypted":"'+util.u8aToHex(encrypted)+'"}'
    //TODO - add multiple layers of encryption
    // encrypt the json with derived password 1
    //const json1PreEncryption = util.stringToU8a(value);
    //const {encrypted, nonce } = util_crypto.naclEncrypt(json1wordsPreEncryption, dpwd1);
    //value='{"iv":"'+util.u8aToHex(randomstring)+'","nonce":"'+util.u8aToHex(nonce)+'","encrypted":"'+util.u8aToHex(encrypted)+'"}'
    // store encrypted data
    localStorage.setItem("webwallet", value);
    // store main account data
    localStorage.setItem("primaryaccount", keyspair.address);
    dashboard();
}
  // Main Dashboard 
  function dashboard(){
    let n='<br><center><H3>Main Account</h3>'+primaryaccount.substring(0,4)+"..."+primaryaccount.substring(primaryaccount.length-4)+'<br>';
    n=n+'<hr>'
    n=n+'<div class="row">';
    n=n+'<div class="col">';
    n=n+'<button type="button" class="btn btn-primary" id="buy">Buy</button>';
    n=n+'</div>';
    n=n+'<div class="col">';
    n=n+'<button type="button" class="btn btn-primary" id="send">Send</button>'
    n=n+'</div>';
    n=n+'<div class="col">';
    n=n+'<button type="button" class="btn btn-primary" id="send">Swap</button>'
    n=n+'</div>';
    n=n+'</div>';
    n=n+'</center>';
    document.getElementById("root").innerHTML = n;
    document.getElementById("buy").addEventListener("click", buy);
    document.getElementById("send").addEventListener("click", send);
    document.getElementById("swap").addEventListener("click", swap);
  }
