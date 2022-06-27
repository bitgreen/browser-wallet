//TODO:  change account description, remove account, copy account without hidden field, improve support link
// TODO set a red light and switch to green when connected
// evaluate the encryption of account description and account code (better privacy)
// ask for access password initially to decrypt the data above and keep it open for the session till the browser is open

let keyspairv='';
let keyringv= new keyring.Keyring({ type: 'sr25519' });
let mnemonic='';
let mnemonic_array=[];
let shuffled_mnemonic_array=[];
let user_mnemonic_array=[];
let user_mnemonic_sortable = [];
let import_mnemonic_array=[];
let import_mnemonic_sortable=[];
let apiv='';
let currentaccount='';
let balancev=0;
let balancevf='0.00';
let currentaccountid='1';
let accountdescription="Main Account";
let skip_intro = false;

refresh_account();

// get web wallet account
if(localStorage.getItem("skip_intro")){
    skip_intro=localStorage.getItem("skip_intro");
}

function refresh_account() {
    // get last used account id
    if (localStorage.getItem("webwalletcurrentaccountid")) {
        currentaccountid = localStorage.getItem("webwalletcurrentaccountid");
        if (!localStorage.getItem("webwalletaccount" + currentaccountid)) {
            currentaccountid = '1';
        }
    }
    // get account description
    if (localStorage.getItem("webwalletdescription" + currentaccountid)) {
        accountdescription = localStorage.getItem("webwalletdescription" + currentaccountid);
        if (accountdescription.length > 20) {
            accountdescription = accountdescription.substring(0, 20);
        }
    }
    // get web wallet account
    if (localStorage.getItem("webwalletaccount" + currentaccountid)) {
        currentaccount = localStorage.getItem("webwalletaccount" + currentaccountid);
    }
}

// add listeners for events (you cannot use onclick event in the extension)
document.addEventListener('DOMContentLoaded', function () {
    // open connection
    change_network();
    // network selection
    // document.getElementById("network").addEventListener("change", change_network); // TODO: temp disabled
    // if at the least one account is available, we show it
    if (currentaccount.length > 0) {
        const params = new URLSearchParams(window.location.search)
        let command = "";
        // evaluate possible actions
        if (params.has("command")) {
            command = params.get('command');
            // transfer of funds
            if (command == "transfer" && params.has("recipient") && params.has("amount") && params.get("domain")) {
                const recipient=DOMPurify.sanitize(params.get("recipient"));
                const amount=DOMPurify.sanitize(params.get("amount"));
                const domain=DOMPurify.sanitize(params.get("domain"));
                send(recipient, amount, domain);
            }
            // sign-in
            if (command == "signin" && params.get("domain")) {
                const domain=DOMPurify.sanitize(params.get("domain"));
                signin(domain);
            }
            // tx command to submit any kind of extrinsic
            if (command == "tx" && params.has("pallet") && params.has("call") && params.has("parameters") && params.get("domain")) {
              const pallet=DOMPurify.sanitize(params.get("pallet"));
              const call=DOMPurify.sanitize(params.get("call"));
              const parameters=DOMPurify.sanitize(params.get("parameters"));
              const domain=DOMPurify.sanitize(params.get("domain"));
              extrinsic(pallet, call, parameters, domain);
            }
        } else {
            // main dashboard
            dashboard();
        }
        //otherwise we let to create a new account
    } else {
        // set new/import keys screen
        if (!skip_intro) {
            welcome_screen();
        } else {
            wallet_create();
        }
    }

    if (skip_intro) {
        hide_init()
    }
});
function welcome_screen() {
    // hide init screen
    anime({
        targets: '#init_screen',
        opacity: 0,
        duration: 1000,
        delay: 2000
    });
    anime({
        targets: '#init_screen .init-logo',
        delay: 700,
        easing: 'linear',
        keyframes: [
            { translateY: -100, scale: 0.32, duration: 800 },
            { translateX: -290, duration: 500 },
        ]
    });
    setTimeout(function() {
        document.getElementById("init_screen").classList.add("inactive")
    }, 3000)

    let n='<svg class="bitgreen-svg" width="220" height="55" stroke="#FFFFFF" stroke-width="1" viewBox="0 0 220 55" fill="none" fill-opacity="0" xmlns="http://www.w3.org/2000/svg">';
    n=n+'<path d="M23.4201 37.25H5.17224V29.0069H23.4201C25.6974 29.0069 27.5432 30.852 27.5432 33.1285C27.5432 35.4046 25.6974 37.25 23.4201 37.25ZM5.17224 16.5903H23.4201C25.6974 16.5903 27.5432 18.4354 27.5432 20.7119C27.5432 22.988 25.6974 24.8334 23.4201 24.8334H5.17224V16.5903ZM5.17224 4.17372H23.4201C25.6974 4.17372 27.5432 6.01884 27.5432 8.29528C27.5432 10.5714 25.6974 12.4168 23.4201 12.4168H5.17224V4.17372ZM32.9648 8.29528C32.9648 3.71411 29.2495 0.000244141 24.6666 0.000244141H0V12.4168V16.5903V24.8334V29.0069V41.4235H24.6666C29.2495 41.4235 32.9648 37.7096 32.9648 33.1285C32.9648 30.6573 31.8824 28.4398 30.1675 26.9202C31.8824 25.4005 32.9648 23.183 32.9648 20.7119C32.9648 18.2407 31.8824 16.0232 30.1675 14.5036C31.8824 12.9839 32.9648 10.7664 32.9648 8.29528Z" fill="white" fill-opacity="0"/>';
    n=n+'<path d="M38.5429 10.2782H43.5281V41.4235H38.5429V10.2782ZM37.8574 0H44.2758V5.17024H37.8574V0Z" fill="white" />';
    n=n+'<path d="M60.4272 41.4234C54.4449 41.4234 52.8871 39.1187 52.8871 34.1354V14.2022H46.967V11.3993L53.3232 9.84202L55.1927 3.3638H57.8722V10.278H68.1541V14.2022H57.8722V37.3744H67.7802V41.4234H60.4272Z" fill="white" fill-opacity="0"/>';
    n=n+'<path d="M95.753 25.0409C95.753 16.6318 91.9518 13.3303 85.3466 13.3303C78.2426 13.3303 74.8776 16.6318 74.8776 25.0409C74.8776 33.4501 78.2426 36.8139 85.3466 36.8139C91.9518 36.8139 95.753 33.5127 95.753 25.0409ZM95.753 10.278H100.738V41.4859C100.738 49.7703 96.6879 54.5664 85.3466 54.5664C76.0615 54.5664 71.0764 50.5178 70.5157 43.4165H75.4383C75.8122 47.5278 78.4294 50.6422 85.3466 50.6422C92.6996 50.6422 95.753 48.0882 95.753 41.4233V34.6958C93.6345 38.7448 89.7707 40.7384 84.1623 40.7384C74.3792 40.7384 69.7679 34.6336 69.7679 25.0409C69.7679 15.5105 74.3792 9.40573 84.1623 9.40573C89.8333 9.40573 93.6345 11.6486 95.753 15.635V10.278Z" fill="white" fill-opacity="0"/>';
    n=n+'<path d="M123.483 9.84195V14.763H122.174C112.952 14.4514 110.958 21.1786 110.958 29.9619V41.4234H105.973V10.2779H110.958V18.6872C112.827 13.2054 116.441 9.84195 122.361 9.84195H123.483Z" fill="white" fill-opacity="0"/>';
    n=n+'<path d="M128.779 23.2346H148.969C148.72 16.0711 145.043 13.0812 139.248 13.0812C133.328 13.0812 129.465 15.8844 128.779 23.2346ZM149.218 31.8308H153.767C153.144 36.5647 149.53 42.4199 139.186 42.4199C128.467 42.4199 123.732 35.1942 123.732 25.7886C123.732 16.5071 128.841 9.28143 139.186 9.28143C148.533 9.28143 153.83 15.6974 153.83 24.7918C153.83 25.6015 153.83 26.2246 153.705 26.9721H128.655C129.029 35.506 133.141 38.6201 139.373 38.6201C145.479 38.6201 148.283 35.755 149.218 31.8308Z" fill="white" fill-opacity="0"/>';
    n=n+'<path d="M162.36 23.2346H182.55C182.301 16.0711 178.624 13.0812 172.828 13.0812C166.909 13.0812 163.045 15.8844 162.36 23.2346ZM182.799 31.8308H187.348C186.725 36.5647 183.11 42.4199 172.766 42.4199C162.048 42.4199 157.312 35.1942 157.312 25.7886C157.312 16.5071 162.422 9.28143 172.766 9.28143C182.113 9.28143 187.41 15.6974 187.41 24.7918C187.41 25.6015 187.41 26.2246 187.285 26.9721H162.235C162.609 35.506 166.722 38.6201 172.953 38.6201C179.06 38.6201 181.864 35.755 182.799 31.8308Z" fill="white" fill-opacity="0"/>';
    n=n+'<path d="M220 21.5526V41.4235H215.015V22.1133C215.015 15.4481 212.086 13.4549 207.537 13.4549C200.62 13.4549 196.943 18.8118 196.943 29.5258V41.4235H191.958V10.2782H196.943V18.5003C198.937 12.5203 202.801 9.2814 208.908 9.2814C216.697 9.2814 220 13.5171 220 21.5526Z" fill="white" fill-opacity="0"/>';
    n=n+'</svg>';
    n=n+'<div class="separator"></div>';
    n=n+'<div class="browser-wallet">BROWSER WALLET</div>';
    n=n+'<button type="button" class="btn btn-primary" id="getstarted">Get started<span class="icon icon-right-arrow"></span></button>';
    document.getElementById("root").innerHTML = n;
    document.getElementById("getstarted").addEventListener("click", wallet_create);

    anime({
        targets: '.bitgreen-svg path',
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutSine',
        "fill-opacity": "1",
        "stroke-width": "0",
        duration: 500,
        // duration: function(el, i) { return 1000 - i * 100 },
        delay: function(el, i) { return i * 200 + 1600 },
    });

    anime({
        targets: '.separator',
        easing: 'linear',
        duration: 500,
        delay: 3000,
        translateY: [20, 0],
        opacity: [0, 1]
    });

    anime({
        targets: '.browser-wallet',
        easing: 'linear',
        duration: 300,
        delay: 3200,
        translateX: [-30, 0],
        opacity: [0, 1]
    });

    anime({
        targets: '#getstarted',
        easing: 'linear',
        duration: 400,
        delay: 3600,
        translateY: [40, 0],
        opacity: [0, 1]
    });

    localStorage.setItem("webwalletcurrentaccountid",false);
}
function hide_init() {
    anime({
        targets: '#init_screen',
        opacity: 0,
        duration: 1500,
        delay: 800
    });
    anime({
        targets: '#init_screen .init-logo',
        delay: 300,
        duration: 1500,
        easing: 'linear',
        opacity: [1, 0],
        scale: [1, 10, 500, 500]
    });
    setTimeout(function() {
        document.getElementById("init_screen").classList.add("inactive")
    }, 1200)
}
function wallet_create() {
    localStorage.setItem("skip_intro", true);

    let ic = '';
    if (currentaccount.length > 0) {
        // refresh the identicon
        ic = jdenticon.toSvg(currentaccount, 30);
    }

    let n='<div id="heading">';
        n=n+'<div id="menu" class="d-flex align-items-center">';
            n=n+'<div class="col-4 p-0">';
                n=n+'<svg id="top_logo" width="100" height="26" viewBox="0 0 100 26" fill="none" xmlns="http://www.w3.org/2000/svg">';
                n=n+'<path d="M10.6455 17.5305H2.35102V13.7836H10.6455C11.6806 13.7836 12.5196 14.6223 12.5196 15.657C12.5196 16.6916 11.6806 17.5305 10.6455 17.5305ZM2.35102 8.13969H10.6455C11.6806 8.13969 12.5196 8.97838 12.5196 10.0131C12.5196 11.0477 11.6806 11.8866 10.6455 11.8866H2.35102V8.13969ZM2.35102 2.49579H10.6455C11.6806 2.49579 12.5196 3.33448 12.5196 4.36923C12.5196 5.40382 11.6806 6.24266 10.6455 6.24266H2.35102V2.49579ZM14.984 4.36923C14.984 2.28687 13.2953 0.598755 11.2121 0.598755H0V6.24266V8.13969V11.8866V13.7836V19.4275H11.2121C13.2953 19.4275 14.984 17.7394 14.984 15.657C14.984 14.5338 14.492 13.5258 13.7125 12.8351C14.492 12.1443 14.984 11.1364 14.984 10.0131C14.984 8.88989 14.492 7.88192 13.7125 7.19118C14.492 6.50044 14.984 5.49247 14.984 4.36923Z" fill="white"/>';
                n=n+'<path d="M17.5196 5.27044H19.7856V19.4274H17.5196V5.27044ZM17.208 0.598511H20.1255V2.94862H17.208V0.598511Z" fill="white"/>';
                n=n+'<path d="M27.4669 19.4273C24.7477 19.4273 24.0396 18.3797 24.0396 16.1146V7.05406H21.3486V5.77999L24.2378 5.07215L25.0876 2.1275H26.3055V5.27033H30.9791V7.05406H26.3055V17.5869H30.8092V19.4273H27.4669Z" fill="white"/>';
                n=n+'<path d="M43.524 11.9808C43.524 8.15843 41.7962 6.65775 38.7939 6.65775C35.5648 6.65775 34.0352 8.15843 34.0352 11.9808C34.0352 15.8031 35.5648 17.3321 38.7939 17.3321C41.7962 17.3321 43.524 15.8316 43.524 11.9808ZM43.524 5.27037H45.79V19.4558C45.79 23.2214 43.949 25.4015 38.7939 25.4015C34.5734 25.4015 32.3074 23.5612 32.0525 20.3333H34.2901C34.46 22.2021 35.6497 23.6177 38.7939 23.6177C42.1361 23.6177 43.524 22.4568 43.524 19.4273V16.3694C42.5611 18.2098 40.8048 19.116 38.2555 19.116C33.8087 19.116 31.7126 16.3411 31.7126 11.9808C31.7126 7.64877 33.8087 4.87387 38.2555 4.87387C40.8333 4.87387 42.5611 5.89334 43.524 7.70535V5.27037Z" fill="white"/>';
                n=n+'<path d="M56.1287 5.07214V7.30896H55.5338C51.3418 7.16737 50.4354 10.2252 50.4354 14.2176V19.4274H48.1694V5.27032H50.4354V9.0927C51.2852 6.60097 52.9279 5.07214 55.6188 5.07214H56.1287Z" fill="white"/>';
                n=n+'<path d="M58.536 11.1597H67.7133C67.6 7.90355 65.9288 6.54447 63.2946 6.54447C60.6037 6.54447 58.8476 7.81868 58.536 11.1597ZM67.8265 15.067H69.8942C69.6109 17.2188 67.968 19.8802 63.2661 19.8802C58.3943 19.8802 56.2417 16.5958 56.2417 12.3206C56.2417 8.10172 58.5643 4.81732 63.2661 4.81732C67.5149 4.81732 69.9225 7.73366 69.9225 11.8675C69.9225 12.2356 69.9225 12.5187 69.8658 12.8585H58.4794C58.6493 16.7376 60.5188 18.1531 63.3512 18.1531C66.127 18.1531 67.4016 16.8507 67.8265 15.067Z" fill="white"/>';
                n=n+'<path d="M73.7999 11.1597H82.9771C82.8639 7.90355 81.1927 6.54447 78.5584 6.54447C75.8676 6.54447 74.1115 7.81868 73.7999 11.1597ZM83.0905 15.067H85.1582C84.8749 17.2188 83.232 19.8802 78.5301 19.8802C73.6581 19.8802 71.5056 16.5958 71.5056 12.3206C71.5056 8.10172 73.8282 4.81732 78.5301 4.81732C82.7789 4.81732 85.1863 7.73366 85.1863 11.8675C85.1863 12.2356 85.1863 12.5187 85.1297 12.8585H73.7431C73.9131 16.7376 75.7827 18.1531 78.615 18.1531C81.3909 18.1531 82.6655 16.8507 83.0905 15.067Z" fill="white"/>';
                n=n+'<path d="M99.9999 10.3951V19.4274H97.7339V10.65C97.7339 7.62037 96.4026 6.71436 94.3349 6.71436C91.1908 6.71436 89.5196 9.14934 89.5196 14.0193V19.4274H87.2537V5.2704H89.5196V9.00774C90.426 6.28957 92.1823 4.81732 94.9581 4.81732C98.4986 4.81732 99.9999 6.74265 99.9999 10.3951Z" fill="white"/>';
                n=n+'</svg>';
            n=n+'</div>';
            n=n+'<div class="col-8 p-0 d-flex flex-row-reverse align-items-center">';
                n=n+'<span id="go_settings" class="icon-cog text-white"></span>';
                if (currentaccount.length > 0) {
                    n=n+'<div id="current_wallet" class="d-flex align-items-center">';
                        n=n+'<div class="identicon">'+ic+'</div>';
                        n=n+'<div class="info"><span class="desc">'+(accountdescription.length > 14 ? accountdescription.substring(0,14)+'...' : accountdescription)+'</span><span>'+currentaccount.substring(0,16)+'...</span></div>';
                        n=n+'<span class="icon icon-down-arrow"></span>';
                    n=n+'</div>';
                }
            n=n+'</div>';
        n=n+'</div>';
            n=n+'<div class="content row">';
                n=n+'<h1 class="text-center text-white">Get started</h1>';
            n=n+'</div>';
        n=n+'</div>';

    n=n+'<div id="bordered_content">';
        n=n+'<div id="newkeys" class="button-item d-flex align-items-center">';
            n=n+'<span class="icon icon-plus text-center"></span>';
            n=n+'<div class="col"><h3 class="m-0">Create new wallet</h3><p class="text-gray m-0 w-75">Add a new wallet by generating a passphrase.</p></div>';
            n=n+'<span class="icon icon-right-arrow text-center"></span>';
        n=n+'</div>';
        n=n+'<div id="importkeys" class="button-item d-flex align-items-center">';
            n=n+'<span class="icon icon-import text-center"></span>';
            n=n+'<div class="col"><h3 class="m-0">Import Wallet</h3><p class="text-gray m-0 w-75">Import an existing wallet using your passphrase.</p></div>';
            n=n+'<span class="icon icon-right-arrow text-center"></span>';
        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("newkeys").addEventListener("click", function() {
        newkeys()
    });
    document.getElementById("importkeys").addEventListener("click", importkeys);

    anime({
        targets: '#bordered_content',
        duration: 800,
        translateY: [50, 0],
        easing: 'linear',
    });
}
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
function newkeys(obj, error) {
    let k = new keyring.Keyring({type: 'sr25519'});
    if (typeof error == 'undefined') {
        // generate mnemonic 24 words as key
        mnemonic = util_crypto.mnemonicGenerate(24);
        keyspairv = k.addFromUri(mnemonic, {name: ''}, 'sr25519');
        mnemonic_array = mnemonic.split(' ');
    }

    let n = '<div id="full_page">';
        n = n + '<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Create Wallet</h3></div>';
        n = n + '<div class="content">';
            n = n + '<h2>Save your secret phrase</h2>';
            n = n + '<p class="text-gray pb-2">Please carefully store the secret words below in a safe place. They are the keys to your wallet and can be used to recover your wallet on a different device.</p>';
            n = n + '<div class="alert alert-danger d-flex align-items-stretch"><div class="icon d-flex align-items-center"><span class="icon-alert"></span></div><p class="w-100 m-0 p-2">Anyone with access to your secret words can transfer your funds! Store them securely and do not share with untrusted parties.</p></div>';
            n = n + '<div class="row d-flex align-items-center mb-1"><h2 class="col-8 m-0">Secret phrase words</h2><div class="col-4 d-flex flex-row-reverse"><button id="copy_seed" type="button" class="btn btn-sm btn-secondary pe-3 ps-3"><span class="icon icon-left icon-copy"></span> Copy</button></div></div>';
            n = n + '<div class="mnemonics d-block mt-2">';
                mnemonic_array.forEach(function(val, index) {
                    n = n + '<div class="word col-3 d-inline-block"><div class="badge bg-secondary"><span class="index">'+(index+1)+'</span><span class="text col">'+val+'</span></div></div>';
                })
            n = n + '<div class="footer d-flex align-items-sketch align-items-center">';
            n = n + '<div class="col-8 p-0 pt-1 select-none"><p class="d-flex align-items-center text-dark fw-bold"><input id="agree_new_key" type="checkbox" class="me-2"><label for="agree_new_key">I have safely stored my secret phrase<br><span class="text-gray fw-light text-small">You must confirm in order to proceed.</span></label></p></div>';
            n = n + '<div class="col-4 p-0 d-flex flex-row-reverse"><button id="continue_new_key" class="btn btn-sm disabled ps-3 pe-3">Continue <span class="icon icon-right-arrow"></span></button></div>';
            n = n + '</div>';
        n = n + '</div>';
    n = n + '</div>';
    document.getElementById("root").innerHTML = n;
    document.getElementById("copy_seed").addEventListener("click", copy_seed);
    document.getElementById("agree_new_key").addEventListener("change", agree_new_key);
    document.getElementById("continue_new_key").addEventListener("click", confirm_secret_phrase_screen);
    document.getElementById("goback").addEventListener("click", wallet_create);

    anime({
        targets: '.icon-alert',
        scale: [1, 0.8, 1.2, 1],
        easing: 'easeInOutSine',
        duration: 1600,
        delay: 200,
    });

    anime({
        targets: '.mnemonics .word',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 150,
        delay: function(el, i) { return i * 50 },
    });

    sessionStorage.setItem('finish_message', 'created');
}
async function copy_seed() {
    await navigator.clipboard.writeText(mnemonic_array.join(' '));
    alert("Secret phrase copied to your clipboard!");
}
function agree_new_key() {
    let agree = document.getElementById("agree_new_key");
    let continue_new_key = document.getElementById("continue_new_key");

    if(agree.checked === true) {
        continue_new_key.classList.remove('disabled')
        continue_new_key.classList.add('btn-primary')
    } else {
        continue_new_key.classList.add('disabled')
        continue_new_key.classList.remove('btn-primary')
    }
}
function confirm_secret_phrase_screen() {
    shuffled_mnemonic_array = shuffleArray(mnemonic_array);
    user_mnemonic_array = [];
    let n = '<div id="full_page">';
        n = n + '<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Create Wallet</h3></div>';
        n = n + '<div class="content">';
            n = n + '<h2>Confirm secret phrase</h2>';
            n = n + '<p class="text-gray pb-2">Confirm the secret phrase from the previous screen, with each phrase in the correct order.</p>';
            n = n + '<div id="user_mnemonics" class="mnemonics clickable bordered bordered-green select-none d-block"></div>';
            n = n + '<div id="mnemonics_info" class="text-gray d-flex align-items-center">';
                n = n + '<div class="col-6 d-flex align-items-center flex-row-reverse p-0"><span>Click to add/remove</span><span class="icon icon-click-radial"></span></div>';
                n = n + '<div class="col-6 d-flex align-items-center"><span class="icon icon-drag"></span><span>Drag to reorder</span></div>';
            n = n + '</div>';
            n = n + '<div id="shuffled_mnemonics" class="mnemonics clickable select-none d-block mt-2">';
                shuffled_mnemonic_array.forEach(function(val, index) {
                    n = n + '<div class="word col-3 d-inline-block" data-index="'+index+'"><div class="badge bg-secondary"><span class="text col">'+val+'</span></div></div>';
                })
            n = n + '</div>';
            n = n + '<div class="footer d-flex align-items-sketch flex-row-reverse">';
            n = n + '<div class="d-flex"><button id="continue_new_key" class="btn btn-sm disabled ps-3 pe-3">Continue <span class="icon icon-right-arrow"></span></button></div>';
        n = n + '</div>';
    n = n + '</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", wallet_create);
    document.getElementById("shuffled_mnemonics").addEventListener("click", add_word);
    document.getElementById("user_mnemonics").addEventListener("click", remove_user_word);
    document.getElementById("continue_new_key").addEventListener("click", set_password_screen);

    let user_mnemonics_el = document.getElementById("user_mnemonics");
    user_mnemonic_sortable = Sortable.create(user_mnemonics_el, {
        dataIdAttr: 'data-id',
        easing: "cubic-bezier(1, 0, 0, 1)",
        animation: 150,
        invertSwap: true,
        emptyInsertThreshold: 100,
        onUpdate: function (evt) {
            refresh_user_mnemonics()
            check_words()
        },
        onChoose: function (evt) {
            evt.item.classList.add('selected')
            document.getElementById("user_mnemonics").classList.add('dragging')
        },
        onUnchoose: function (evt) {
            evt.item.classList.remove('selected')
            document.getElementById("user_mnemonics").classList.remove('dragging')
        }
    });

    anime({
        targets: '#shuffled_mnemonics .word',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 150,
        delay: function(el, i) { return i * 50 },
    });
}
Array.prototype.swapItems = function(a, b){
    this[a] = this.splice(b, 1, this[a])[0];
    return this;
}
function shuffleArray(array) {
    let cloned_array = [...array];
    for (let i = cloned_array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = cloned_array[i];
        cloned_array[i] = cloned_array[j];
        cloned_array[j] = temp;
    }
    return cloned_array
}
function add_word(e) {
    let word_el = e.target
    let index = word_el.dataset.index
    let word = shuffled_mnemonic_array[index];

    if(!word) {
        return false;
    }

    shuffled_mnemonic_array.splice(shuffled_mnemonic_array.indexOf(shuffled_mnemonic_array[index]), 1)

    refresh_user_mnemonics(word)

    check_words()
}
function refresh_user_mnemonics(word = null, action = 'add') {
    user_mnemonic_array = user_mnemonic_sortable.toArray()
    
    if(word && action === 'add') {
        user_mnemonic_array.push(word)
    } else if(word && action === 'remove') {
        // word is index in this case
        let index = word
        user_mnemonic_array.splice(user_mnemonic_array.indexOf(user_mnemonic_array[index]), 1)
    }

    let user_mnemonics = '';
    user_mnemonic_array.forEach(function(val, index) {
        user_mnemonics = user_mnemonics + '<div class="word col-3 d-inline-block" data-id="'+val+'"><div class="badge bg-secondary"><span class="index">'+(index+1)+'</span><span class="text col">'+val+'</span><span class="remove d-flex align-items-center" data-index="'+index+'"><span class="icon-close"></span></span></div></div>';
    })

    let shuffled_mnemonics = '';
    shuffled_mnemonic_array.forEach(function(val, index) {
        shuffled_mnemonics = shuffled_mnemonics + '<div class="word col-3 d-inline-block" data-index="'+index+'"><div class="badge bg-secondary"><span class="text col">'+val+'</span></div></div>';
    })

    document.getElementById("user_mnemonics").innerHTML = user_mnemonics;
    document.getElementById("shuffled_mnemonics").innerHTML = shuffled_mnemonics;
}
function remove_user_word(e) {
    let word_el = e.target
    let index = word_el.dataset.index
    let word = user_mnemonic_array[index];

    if(!word) {
        return false;
    }

    shuffled_mnemonic_array.push(word)

    refresh_user_mnemonics(index, 'remove');

    check_words()
}
function check_words() {
    if(JSON.stringify(user_mnemonic_array) === JSON.stringify(mnemonic_array)) {
        document.getElementById("continue_new_key").classList.remove('disabled')
        document.getElementById("continue_new_key").classList.add('btn-primary')
    } else {
        document.getElementById("continue_new_key").classList.add('disabled')
        document.getElementById("continue_new_key").classList.remove('btn-primary')
    }
}
function set_password_screen() {
    let n = '<div id="full_page">';
    n = n + '<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Create Wallet</h3></div>';
    n = n + '<div class="content">';
    n = n + '<h2>Set your wallet password</h2>';
    n = n + '<p class="text-gray pb-2">Set a strong password to encrypt the secret words on your computer. This password will allow you to unlock this wallet when you need to use it.</p>';
    n = n + '<label class="label text-dark">Password</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon-password"></span></span><input id="password" type="password" class="form-control" placeholder="strong password"></div></div>';
    n = n + '<div class="info-messages mt-2 mb-4">';
    n = n + '<div class="message d-flex align-items-center"><span id="length_icon"><span class="icon icon-close"></span></span>12 characters or more</div>';
    n = n + '<div class="message d-flex align-items-center"><span id="lowercase_icon"><span class="icon icon-close"></span></span>At least 1 lowercase letter</div>';
    n = n + '<div class="message d-flex align-items-center"><span id="uppercase_icon"><span class="icon icon-close"></span></span>At least 1 uppercase letter</div>';
    n = n + '<div class="message d-flex align-items-center"><span id="digit_icon"><span class="icon icon-close"></span></span>At least 1 digit</div>';
    n = n + '<div class="message d-flex align-items-center"><span id="symbol_icon"><span class="icon icon-close"></span></span>At least 1 special symbol</div>';
    n = n + '</div>';
    n = n + '<label class="label text-dark d-flex align-items-center"><div class="col">Repeat Password</div><div class="col d-flex flex-row-reverse align-items-center">Both match <div id="repeat_icon" class="me-2"><span class="icon icon-close"></span></div></div></label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon-password"></span></span><input id="password_repeat" type="password" class="form-control" placeholder="repeat password"></div></div>';
    n = n + '<div class="footer d-flex align-items-sketch flex-row-reverse">';
    n = n + '<div class="d-flex"><button id="set_password" class="btn btn-sm disabled ps-3 pe-3">Continue <span class="icon icon-right-arrow"></span></button></div>';
    n = n + '</div>';
    n = n + '</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", wallet_create);
    document.getElementById("password").addEventListener("keyup", check_password);
    document.getElementById("password_repeat").addEventListener("keyup", check_password);
    document.getElementById("set_password").addEventListener("click", storekeys);
}
function check_password() {
    let password = document.getElementById('password').value
    let password_repeat = document.getElementById('password_repeat').value
    let success = true;

    if(password.length >= 12) {
        // has 12+ chars
        document.getElementById('length_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.getElementById('length_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password.match(/[a-z]/g)) {
        // has lowercase
        document.getElementById('lowercase_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.getElementById('lowercase_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password.match(/[A-Z]/g)) {
        // has uppercase
        document.getElementById('uppercase_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.getElementById('uppercase_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password.match(/[0-9]/g)) {
        // has digit
        document.getElementById('digit_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.getElementById('digit_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password.match(/[$&+,:;=?@#|'<>.^*()%!-]/g)) {
        // has special char
        document.getElementById('symbol_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.getElementById('symbol_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(password === password_repeat) {
        document.getElementById('repeat_icon').innerHTML = '<span class="icon icon-success icon-check"></span>'
    } else {
        document.getElementById('repeat_icon').innerHTML = '<span class="icon icon-close"></span>'
        success = false;
    }

    if(success) {
        document.getElementById("set_password").classList.remove('disabled')
        document.getElementById("set_password").classList.add('btn-primary')
    } else {
        document.getElementById("set_password").classList.add('disabled')
        document.getElementById("set_password").classList.remove('btn-primary')
    }
}
// import existing keys
function importkeys() {
    import_mnemonic_array = []
    let n = '<div id="full_page">';
    n = n + '<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Import Wallet</h3></div>';
    n = n + '<div class="content">';
    n = n + '<h2>Enter secret phrase</h2>';
    n = n + '<p class="text-gray pb-2">Enter an existing secret phrase to import that wallet. Each phrase must be in the correct sequence.</p>';
    n = n + '<div class="form-group"><div class="input-group"><input id="keyword" type="text" class="form-control ps-3" placeholder="keyword"><span class="input-group-text p-0"><button id="import_word" type="button" class="btn btn-secondary">Add <span class="icon icon-right-arrow"></span></button></span></div></div>';
    n = n + '<div id="mnemonics_info" class="text-gray d-flex align-items-center">';
        n = n + '<div class="col-6 d-flex align-items-center flex-row-reverse"><span>Click to remove</span><span class="icon icon-click-radial"></span></div>';
        n = n + '<div class="col-6 d-flex align-items-center"><span class="icon icon-drag"></span><span>Drag to reorder</span></div>';
    n = n + '</div>';
    n = n + '<div id="import_mnemonics" class="mnemonics clickable bordered bordered-green select-none d-block"></div>';
    n = n + '<div class="footer d-flex align-items-sketch flex-row-reverse">';
    n = n + '<div class="d-flex"><button id="continue_new_key" class="btn btn-sm disabled ps-3 pe-3">Import <span class="icon icon-right-arrow"></span></button></div>';
    n = n + '</div>';
    n = n + '</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", wallet_create);
    document.getElementById("import_word").addEventListener("click", import_word);
    document.getElementById("import_mnemonics").addEventListener("click", remove_imported_word);
    document.getElementById("continue_new_key").addEventListener("click", importkeysvalidation);

    let import_mnemonics_el = document.getElementById("import_mnemonics");
    import_mnemonic_sortable = Sortable.create(import_mnemonics_el, {
        dataIdAttr: 'data-id',
        easing: "cubic-bezier(1, 0, 0, 1)",
        animation: 150,
        invertSwap: true,
        emptyInsertThreshold: 100,
        onUpdate: function (evt) {
            refresh_imported_mnemonics();
            check_mnemonics()
        },
        onChoose: function (evt) {
            evt.item.classList.add('selected')
            document.getElementById("import_mnemonics").classList.add('dragging')
        },
        onUnchoose: function (evt) {
            evt.item.classList.remove('selected')
            document.getElementById("import_mnemonics").classList.remove('dragging')
        }
    });

    anime({
        targets: '#shuffled_mnemonics .word',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 150,
        delay: function(el, i) { return i * 50 },
    });

    sessionStorage.setItem('finish_message', 'imported');
}
function import_word() {
    let input = document.getElementById("keyword").value;
    document.getElementById("keyword").value = ''

    if(!input) {
        return false;
    }

    input.split(',').forEach(function(val, index) {
        val.split(' ').forEach(function(word, index) {
            if(word) {
                // max 24 words
                if(import_mnemonic_array.length >= 24) {
                    return false;
                }
                // maximum word length is 8
                refresh_imported_mnemonics(word.trim().substring(0,8));
            }
        });
    });
    
    check_mnemonics()
}
function remove_imported_word(e) {
    let word_el = e.target
    let index = word_el.dataset.index
    let word = import_mnemonic_array[index];

    if(!word) {
        return false;
    }

    refresh_imported_mnemonics(index, 'remove');

    check_mnemonics()
}
function refresh_imported_mnemonics(word = null, action = 'add') {
    import_mnemonic_array = import_mnemonic_sortable.toArray()

    if(word && action === 'add') {
        import_mnemonic_array.push(word)
    } else if(word && action === 'remove') {
        // word is index in this case
        let index = word
        import_mnemonic_array.splice(import_mnemonic_array.indexOf(import_mnemonic_array[index]), 1)
    }
    
    let import_mnemonics = '';
    import_mnemonic_array.forEach(function(val, index) {
        import_mnemonics = import_mnemonics + '<div class="word col-3 d-inline-block" data-id="'+val+'"><div class="badge bg-secondary"><span class="index">'+(index+1)+'</span><span class="text col">'+val+'</span><span class="remove d-flex align-items-center" data-index="'+index+'"><span class="icon-close"></span></span></div></div>';
    })

    document.getElementById("import_mnemonics").innerHTML = import_mnemonics;
}
function check_mnemonics() {
    let m = ''
    import_mnemonic_array.forEach(function(word, index) {
        m = m + ' ' + word.trim();
    });
    m = m.trim()

    const isValidMnemonic = util_crypto.mnemonicValidate(m);

    if (!isValidMnemonic) {
        document.getElementById("continue_new_key").classList.add('disabled')
        document.getElementById("continue_new_key").classList.remove('btn-primary')
    } else {
        document.getElementById("continue_new_key").classList.remove('disabled')
        document.getElementById("continue_new_key").classList.add('btn-primary')
    }
}
// function to validate the seed phrase and eventually store the imported account
function importkeysvalidation() {
    const m = import_mnemonic_array.join(' ');
    const isValidMnemonic = util_crypto.mnemonicValidate(m);
    if (!isValidMnemonic) {
        importkeys("", "Invalid Mnemonic Seed");
        return;
    } else {
        let k = new keyring.Keyring({type: 'sr25519'});
        keyspairv = k.addFromUri(m, {name: ''}, 'sr25519');
        mnemonic = m;
        set_password_screen()
    }
}
// function to encrypt and store the secret words
function storekeys(obj, callback) {
    // check for password fields
    const pwd = document.getElementById('password').value;
    // let description=document.getElementById('description').value; // TODO: add option to set description
    let description = 'Main Account';
    if (typeof callback === 'undefined') {
        callback = newkeys;
    }
    // get ascii value of first 2 chars
    const vb1 = pwd.charCodeAt(0);
    const vb2 = pwd.charCodeAt(1);
    const p = vb1 * vb2; // position to derive other 3 passwords
    // derive the password used for encryption with an init vector (random string) and 10000 hashes with 3 different algorithms
    let randomstring = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 32; i++) {
        randomstring += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    let dpwd1 = '';
    let dpwd2 = '';
    let dpwd3 = '';
    let h = util_crypto.keccakAsU8a(pwd + randomstring);
    for (let i = 0; i < 100000; i++) {
        h = util_crypto.keccakAsU8a(h);
        if (i == p) {
            dpwd1 = h;
        }
        h = util_crypto.sha512AsU8a(h);
        if (i == p) {
            dpwd2 = h;
        }
        h = util_crypto.blake2AsU8a(h);
        if (i == p) {
            dpwd3 = h;
        }
    }

    // 3 Layers encryption
    // encrypt the secret words in AES256-CFB
    let ivf = '';
    for (let i = 0; i < 16; i++) {
        ivf += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const ivaescfb = aesjs.utils.utf8.toBytes(ivf);
    const keyaescfb = dpwd1.slice(0, 32);
    let aesCfb = new aesjs.ModeOfOperation.cfb(keyaescfb, ivaescfb);
    var mnemonicbytes = aesjs.utils.utf8.toBytes(mnemonic);

    let encryptedaescfb = aesCfb.encrypt(mnemonicbytes);
    // encrypt the outoput of AES256-CFB in AES256-CTR
    let ivs = '';
    for (let i = 0; i < 16; i++) {
        ivs += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const ivaesctr = aesjs.utils.utf8.toBytes(ivs);
    //const keyaes= aesjs.utils.utf8.toBytes(dpwd2.slice(0,32));
    const keyaesctr = dpwd2.slice(0, 32);
    let aesCtr = new aesjs.ModeOfOperation.ctr(keyaesctr, ivaesctr);
    let encryptedaesctr = aesCtr.encrypt(encryptedaescfb);
    // encrypt the outoput of AES256-CTR in AES256-OFB
    let ivso = '';
    for (let i = 0; i < 16; i++) {
        ivso += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const ivaesofb = aesjs.utils.utf8.toBytes(ivso);
    const keyaesofb = dpwd3.slice(0, 32);
    let aesOfb = new aesjs.ModeOfOperation.ofb(keyaesofb, ivaesofb);
    let encryptedaesofb = aesOfb.encrypt(encryptedaesctr);
    let encryptedhex = aesjs.utils.hex.fromBytes(encryptedaesofb);
    //convert to Hex json
    let value = '{"iv":"' + randomstring + '","ivaescfb":"' + util.u8aToHex(ivaescfb) + '","ivaesctr":"' + util.u8aToHex(ivaesctr) + '","ivaesofb":"' + util.u8aToHex(ivaesofb) + '","encrypted":"' + encryptedhex + '"}';
    // get the next available accountid 
    for (i = 1; i <= 99; i++) {
        if (!localStorage.getItem("webwalletaccount" + i)) {
            currentaccountid = i;
            break;
        }
    }
    if (i > 99) {
        alert("Too many accounts already created");
    } else {
        // store encrypted data
        localStorage.setItem("webwallet" + currentaccountid, value);
        // store main account data
        localStorage.setItem("webwalletaccount" + currentaccountid, keyspairv.address);
        if (!description) {
            localStorage.setItem("webwalletdescription" + currentaccountid, keyspairv.address);
        } else {
            localStorage.setItem("webwalletdescription" + currentaccountid, description);
        }
    }

    finish_keys();
}
function finish_keys() {
    let message = 'created'
    if(sessionStorage.getItem('finish_message') === 'imported') {
        message = 'imported';
    }
    sessionStorage.removeItem('finish_message');
    let n = '<div id="full_page">';
    n = n + '<div class="content full-content">';
    n = n + '<div id="success_icon" class="text-center w-100 text-green"><span class="icon-huge icon-success"></span></div>';
    n = n + '<h1 id="heading_text" class="text-center">Successfully '+message+' wallet</h1>';
    n = n + '<p id="message_text" class="text-center text-gray">Congratulations, your new wallet is ready to use.</p>';
    if(message === 'created') {
        n = n + '<p class="text-center"><button id="another_wallet" type="button" class="btn btn-text btn-sm"><span class="icon icon-plus me-2"></span>Create another wallet</button></p>';
    } else {
        n = n + '<p class="text-center"><button id="another_wallet" type="button" class="btn btn-text btn-sm"><span class="icon icon-import me-2"></span>Import another wallet</button></p>';
    }
    n = n + '<p class="text-center"><button id="gotodashboard" type="button" class="btn btn-primary mt-2">View Portfolio</button></p>';
    n = n + '</div>';
    n = n + '</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("another_wallet").addEventListener("click", wallet_create);
    document.getElementById("gotodashboard").addEventListener("click", dashboard);

    anime({
        targets: '#success_icon',
        translateY: [-50, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 900,
        delay: 800,
    });

    anime({
        targets: '#heading_text',
        translateY: [50, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 900,
        delay: 800,
    });

    anime({
        targets: '#message_text',
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 900,
        delay: 1600
    });

    anime({
        targets: '#another_wallet',
        translateX: [-40, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 600,
        delay: 1600,
    });

    anime({
        targets: '#gotodashboard',
        translateX: [-50, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 600,
        delay: 2000,
    });

    refresh_account();
}
// Main Dashboard 
function dashboard(){
    // refresh the identicon
    let ic = jdenticon.toSvg(currentaccount, 30);

    let n='<div id="heading" class="bigger">';
        n=n+'<div id="menu" class="d-flex align-items-center">';
            n=n+'<div class="col-4 p-0">';
            n=n+'<svg id="top_logo" width="100" height="26" viewBox="0 0 100 26" fill="none" xmlns="http://www.w3.org/2000/svg">';
            n=n+'<path d="M10.6455 17.5305H2.35102V13.7836H10.6455C11.6806 13.7836 12.5196 14.6223 12.5196 15.657C12.5196 16.6916 11.6806 17.5305 10.6455 17.5305ZM2.35102 8.13969H10.6455C11.6806 8.13969 12.5196 8.97838 12.5196 10.0131C12.5196 11.0477 11.6806 11.8866 10.6455 11.8866H2.35102V8.13969ZM2.35102 2.49579H10.6455C11.6806 2.49579 12.5196 3.33448 12.5196 4.36923C12.5196 5.40382 11.6806 6.24266 10.6455 6.24266H2.35102V2.49579ZM14.984 4.36923C14.984 2.28687 13.2953 0.598755 11.2121 0.598755H0V6.24266V8.13969V11.8866V13.7836V19.4275H11.2121C13.2953 19.4275 14.984 17.7394 14.984 15.657C14.984 14.5338 14.492 13.5258 13.7125 12.8351C14.492 12.1443 14.984 11.1364 14.984 10.0131C14.984 8.88989 14.492 7.88192 13.7125 7.19118C14.492 6.50044 14.984 5.49247 14.984 4.36923Z" fill="white"/>';
            n=n+'<path d="M17.5196 5.27044H19.7856V19.4274H17.5196V5.27044ZM17.208 0.598511H20.1255V2.94862H17.208V0.598511Z" fill="white"/>';
            n=n+'<path d="M27.4669 19.4273C24.7477 19.4273 24.0396 18.3797 24.0396 16.1146V7.05406H21.3486V5.77999L24.2378 5.07215L25.0876 2.1275H26.3055V5.27033H30.9791V7.05406H26.3055V17.5869H30.8092V19.4273H27.4669Z" fill="white"/>';
            n=n+'<path d="M43.524 11.9808C43.524 8.15843 41.7962 6.65775 38.7939 6.65775C35.5648 6.65775 34.0352 8.15843 34.0352 11.9808C34.0352 15.8031 35.5648 17.3321 38.7939 17.3321C41.7962 17.3321 43.524 15.8316 43.524 11.9808ZM43.524 5.27037H45.79V19.4558C45.79 23.2214 43.949 25.4015 38.7939 25.4015C34.5734 25.4015 32.3074 23.5612 32.0525 20.3333H34.2901C34.46 22.2021 35.6497 23.6177 38.7939 23.6177C42.1361 23.6177 43.524 22.4568 43.524 19.4273V16.3694C42.5611 18.2098 40.8048 19.116 38.2555 19.116C33.8087 19.116 31.7126 16.3411 31.7126 11.9808C31.7126 7.64877 33.8087 4.87387 38.2555 4.87387C40.8333 4.87387 42.5611 5.89334 43.524 7.70535V5.27037Z" fill="white"/>';
            n=n+'<path d="M56.1287 5.07214V7.30896H55.5338C51.3418 7.16737 50.4354 10.2252 50.4354 14.2176V19.4274H48.1694V5.27032H50.4354V9.0927C51.2852 6.60097 52.9279 5.07214 55.6188 5.07214H56.1287Z" fill="white"/>';
            n=n+'<path d="M58.536 11.1597H67.7133C67.6 7.90355 65.9288 6.54447 63.2946 6.54447C60.6037 6.54447 58.8476 7.81868 58.536 11.1597ZM67.8265 15.067H69.8942C69.6109 17.2188 67.968 19.8802 63.2661 19.8802C58.3943 19.8802 56.2417 16.5958 56.2417 12.3206C56.2417 8.10172 58.5643 4.81732 63.2661 4.81732C67.5149 4.81732 69.9225 7.73366 69.9225 11.8675C69.9225 12.2356 69.9225 12.5187 69.8658 12.8585H58.4794C58.6493 16.7376 60.5188 18.1531 63.3512 18.1531C66.127 18.1531 67.4016 16.8507 67.8265 15.067Z" fill="white"/>';
            n=n+'<path d="M73.7999 11.1597H82.9771C82.8639 7.90355 81.1927 6.54447 78.5584 6.54447C75.8676 6.54447 74.1115 7.81868 73.7999 11.1597ZM83.0905 15.067H85.1582C84.8749 17.2188 83.232 19.8802 78.5301 19.8802C73.6581 19.8802 71.5056 16.5958 71.5056 12.3206C71.5056 8.10172 73.8282 4.81732 78.5301 4.81732C82.7789 4.81732 85.1863 7.73366 85.1863 11.8675C85.1863 12.2356 85.1863 12.5187 85.1297 12.8585H73.7431C73.9131 16.7376 75.7827 18.1531 78.615 18.1531C81.3909 18.1531 82.6655 16.8507 83.0905 15.067Z" fill="white"/>';
            n=n+'<path d="M99.9999 10.3951V19.4274H97.7339V10.65C97.7339 7.62037 96.4026 6.71436 94.3349 6.71436C91.1908 6.71436 89.5196 9.14934 89.5196 14.0193V19.4274H87.2537V5.2704H89.5196V9.00774C90.426 6.28957 92.1823 4.81732 94.9581 4.81732C98.4986 4.81732 99.9999 6.74265 99.9999 10.3951Z" fill="white"/>';
            n=n+'</svg>';
            n=n+'</div>';
            n=n+'<div class="col-8 p-0 d-flex flex-row-reverse align-items-center">';
                n=n+'<span id="go_settings" class="icon-cog text-white"></span>';
                n=n+'<div id="current_wallet" class="d-flex align-items-center">';
                    n=n+'<div class="identicon">'+ic+'</div>';
                    n=n+'<div class="info"><span class="desc">'+(accountdescription.length > 14 ? accountdescription.substring(0,14)+'...' : accountdescription)+'</span><span>'+currentaccount.substring(0,16)+'...</span></div>';
                    n=n+'<span class="icon icon-down-arrow"></span>';
                n=n+'</div>';
            n=n+'</div>';
        n=n+'</div>';
    n=n+'<div id="portfolio" class="d-flex align-items-center">';
        n=n+'<div class="col-6">';
            n=n+'<img src="assets/demo-portfolio.png">';
        n=n+'</div>';
        n=n+'<div class="col-6 info">';
            n=n+'<h1 class="text-white">Portfolio</h1>';
            n=n+'<p><span class="icon icon-circle" style="color: #9ECC00"></span> BBB Token</p>';
            n=n+'<p><span class="icon icon-circle" style="color: #02A238"></span> Impact Bonds</p>';
            n=n+'<p><span class="icon icon-circle" style="color: #026AA2"></span> Nature Based Credits</p>';
            n=n+'<p><span class="icon icon-circle" style="color: #D5D6DA"></span> Other</p>';
        n=n+'</div>';
    n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content" class="smaller">';
        n=n+'<div id="top_items" class="row">';
        n=n+'<div class="col-6 p-0 d-flex flex-row-reverse"><div class=""><button type="button" class="btn btn-primary me-2">Send <span class="icon icon-right-up-arrow ms-2"></span></button></div></div>';
        n=n+'<div class="col-6 p-0 d-flex"><button type="button" class="btn btn-primary ms-2"><span class="icon icon-left-down-arrow me-2"></span> Receive</button></div>';
        n=n+'</div>';
        n=n+'<div class="row">';
            n=n+'<div class="col-4 pe-1">';
                n=n+'<div id="bbb_token" class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-b"></span>';
                n=n+'<div class="title">BBB TOKEN</div>';
                n=n+'</div>';
            n=n+'</div>';
            n=n+'<div class="col-4 ps-1 pe-1">';
                n=n+'<div id="bbb_token" class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-carbon" style="color: #9ECC00;"></span>';
                n=n+'<div class="title">CARBON CREDITS</div>';
                n=n+'</div>';
            n=n+'</div>';
            n=n+'<div class="col-4 ps-1">';
                n=n+'<div id="bbb_token" class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-retired" style="color: #9ECC00;"></span>';
                n=n+'<div class="title">RETIRED CREDITS</div>';
                n=n+'</div>';
            n=n+'</div>';
        n=n+'</div>';
        n=n+'<div class="row">';
            n=n+'<div class="col-4 pe-1">';
                n=n+'<div id="bbb_token" class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-impact" style="color: #026AA2;"></span>';
                n=n+'<div class="title">IMPACT BONDS</div>';
                n=n+'</div>';
            n=n+'</div>';
            n=n+'<div class="col-4 ps-1 pe-1">';
                n=n+'<div id="bbb_token" class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-other" style="color: #D5D6DA;"></span>';
                n=n+'<div class="title">OTHER</div>';
                n=n+'</div>';
            n=n+'</div>';
        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;

    anime({
        targets: '#bordered_content',
        duration: 800,
        translateY: [50, 0],
        easing: 'linear',
        delay: 800
    });

    anime({
        targets: '#bordered_content #top_items button',
        duration: 400,
        translateX: [20, 0],
        opacity: [0, 1],
        easing: 'linear',
        delay: function(el, i) { return i * 300 + 1400 },
    });

    anime({
        targets: '#bordered_content .button-item',
        easing: 'easeInOutSine',
        translateX: [-20, 0],
        opacity: [0, 1],
        // duration: 300,
        duration: function(el, i) { return 600 - i * 100 },
        delay: function(el, i) { return i * 200 + 800 },
    });

    try {
        // TODO: remove/replace
        document.getElementById("buy").addEventListener("click", buy);
        document.getElementById("send").addEventListener("click", send);
        document.getElementById("staking").addEventListener("click", staking);
        document.getElementById("copyaccount").addEventListener("click", clipboard_copy_account);
        document.getElementById("idicon").addEventListener("click", manageaccounts);
    } catch(e){
        console.log("No identicon available",e);
    }
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
    // refresh the identicon
    let ic = jdenticon.toSvg(currentaccount, 30);

    let n='<div id="heading">';
    n=n+'<div id="menu" class="d-flex align-items-center">';
        n=n+'<div class="col-4 p-0">';
            n=n+'<svg id="top_logo" width="100" height="26" viewBox="0 0 100 26" fill="none" xmlns="http://www.w3.org/2000/svg">';
            n=n+'<path d="M10.6455 17.5305H2.35102V13.7836H10.6455C11.6806 13.7836 12.5196 14.6223 12.5196 15.657C12.5196 16.6916 11.6806 17.5305 10.6455 17.5305ZM2.35102 8.13969H10.6455C11.6806 8.13969 12.5196 8.97838 12.5196 10.0131C12.5196 11.0477 11.6806 11.8866 10.6455 11.8866H2.35102V8.13969ZM2.35102 2.49579H10.6455C11.6806 2.49579 12.5196 3.33448 12.5196 4.36923C12.5196 5.40382 11.6806 6.24266 10.6455 6.24266H2.35102V2.49579ZM14.984 4.36923C14.984 2.28687 13.2953 0.598755 11.2121 0.598755H0V6.24266V8.13969V11.8866V13.7836V19.4275H11.2121C13.2953 19.4275 14.984 17.7394 14.984 15.657C14.984 14.5338 14.492 13.5258 13.7125 12.8351C14.492 12.1443 14.984 11.1364 14.984 10.0131C14.984 8.88989 14.492 7.88192 13.7125 7.19118C14.492 6.50044 14.984 5.49247 14.984 4.36923Z" fill="white"/>';
            n=n+'<path d="M17.5196 5.27044H19.7856V19.4274H17.5196V5.27044ZM17.208 0.598511H20.1255V2.94862H17.208V0.598511Z" fill="white"/>';
            n=n+'<path d="M27.4669 19.4273C24.7477 19.4273 24.0396 18.3797 24.0396 16.1146V7.05406H21.3486V5.77999L24.2378 5.07215L25.0876 2.1275H26.3055V5.27033H30.9791V7.05406H26.3055V17.5869H30.8092V19.4273H27.4669Z" fill="white"/>';
            n=n+'<path d="M43.524 11.9808C43.524 8.15843 41.7962 6.65775 38.7939 6.65775C35.5648 6.65775 34.0352 8.15843 34.0352 11.9808C34.0352 15.8031 35.5648 17.3321 38.7939 17.3321C41.7962 17.3321 43.524 15.8316 43.524 11.9808ZM43.524 5.27037H45.79V19.4558C45.79 23.2214 43.949 25.4015 38.7939 25.4015C34.5734 25.4015 32.3074 23.5612 32.0525 20.3333H34.2901C34.46 22.2021 35.6497 23.6177 38.7939 23.6177C42.1361 23.6177 43.524 22.4568 43.524 19.4273V16.3694C42.5611 18.2098 40.8048 19.116 38.2555 19.116C33.8087 19.116 31.7126 16.3411 31.7126 11.9808C31.7126 7.64877 33.8087 4.87387 38.2555 4.87387C40.8333 4.87387 42.5611 5.89334 43.524 7.70535V5.27037Z" fill="white"/>';
            n=n+'<path d="M56.1287 5.07214V7.30896H55.5338C51.3418 7.16737 50.4354 10.2252 50.4354 14.2176V19.4274H48.1694V5.27032H50.4354V9.0927C51.2852 6.60097 52.9279 5.07214 55.6188 5.07214H56.1287Z" fill="white"/>';
            n=n+'<path d="M58.536 11.1597H67.7133C67.6 7.90355 65.9288 6.54447 63.2946 6.54447C60.6037 6.54447 58.8476 7.81868 58.536 11.1597ZM67.8265 15.067H69.8942C69.6109 17.2188 67.968 19.8802 63.2661 19.8802C58.3943 19.8802 56.2417 16.5958 56.2417 12.3206C56.2417 8.10172 58.5643 4.81732 63.2661 4.81732C67.5149 4.81732 69.9225 7.73366 69.9225 11.8675C69.9225 12.2356 69.9225 12.5187 69.8658 12.8585H58.4794C58.6493 16.7376 60.5188 18.1531 63.3512 18.1531C66.127 18.1531 67.4016 16.8507 67.8265 15.067Z" fill="white"/>';
            n=n+'<path d="M73.7999 11.1597H82.9771C82.8639 7.90355 81.1927 6.54447 78.5584 6.54447C75.8676 6.54447 74.1115 7.81868 73.7999 11.1597ZM83.0905 15.067H85.1582C84.8749 17.2188 83.232 19.8802 78.5301 19.8802C73.6581 19.8802 71.5056 16.5958 71.5056 12.3206C71.5056 8.10172 73.8282 4.81732 78.5301 4.81732C82.7789 4.81732 85.1863 7.73366 85.1863 11.8675C85.1863 12.2356 85.1863 12.5187 85.1297 12.8585H73.7431C73.9131 16.7376 75.7827 18.1531 78.615 18.1531C81.3909 18.1531 82.6655 16.8507 83.0905 15.067Z" fill="white"/>';
            n=n+'<path d="M99.9999 10.3951V19.4274H97.7339V10.65C97.7339 7.62037 96.4026 6.71436 94.3349 6.71436C91.1908 6.71436 89.5196 9.14934 89.5196 14.0193V19.4274H87.2537V5.2704H89.5196V9.00774C90.426 6.28957 92.1823 4.81732 94.9581 4.81732C98.4986 4.81732 99.9999 6.74265 99.9999 10.3951Z" fill="white"/>';
            n=n+'</svg>';
        n=n+'</div>';
        n=n+'<div class="col-8 p-0 d-flex flex-row-reverse align-items-center">';
            n=n+'<span id="go_settings" class="icon-cog text-white"></span>';
            n=n+'<div id="current_wallet" class="d-flex align-items-center">';
                n=n+'<div class="identicon">'+ic+'</div>';
                n=n+'<div class="info"><span class="desc">'+(accountdescription.length > 14 ? accountdescription.substring(0,14)+'...' : accountdescription)+'</span><span>'+currentaccount.substring(0,16)+'...</span></div>';
                n=n+'<span class="icon icon-down-arrow"></span>';
            n=n+'</div>';
        n=n+'</div>';
    n=n+'</div>';
    n=n+'<div class="content row">';
    n=n+'<h1 class="text-center text-white">Sign in request</h1>';
    n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content">';
        n=n+'<div id="app_info" class="d-flex align-items-center">';
            n=n+'<div class="left align-items-center">';
                n=n+'<span class="icon icon-known"></span>';
                n=n+'<div class="message">Known App</div>';
            n=n+'</div>';
            n=n+'<div class="middle">';
                n=n+'<span class="icon-carbon"></span>';
            n=n+'</div>';
            n=n+'<div class="right align-items-center">';
                n=n+'<div class="app-name"><h3>Ecosystem Services Marketplace</h3></div>';
                n=n+'<p class="app-name">'+domain+'<input id="domain" type="hidden" value="'+domain+'"></p>';
            n=n+'</div>';
        n=n+'</div>';
        n=n+'<div class="info-messages bigger mt-2 mb-4">';
            n=n+'<div class="message d-flex align-items-center"><span id="length_icon"><span class="icon icon-check"></span></span>View your wallet address</div>';
            n=n+'<div class="message d-flex align-items-center"><span id="length_icon"><span class="icon icon-check"></span></span>View account balances</div>';
            n=n+'<div class="message d-flex align-items-center"><span id="length_icon"><span class="icon icon-check"></span></span>View your activity</div>';
            n=n+'<div class="message d-flex align-items-center"><span id="length_icon"><span class="icon icon-check"></span></span>Suggest future transactions</div>';
            n=n+'<div class="message d-flex align-items-center"><span id="length_icon"><span class="icon icon-close icon-error"></span></span>Not allowed to transfer assets</div>';
        n=n+'</div>';
        n = n + '<label class="label text-dark">Enter your password to approve this request</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon-password"></span></span><input id="password" type="password" class="form-control" placeholder="wallet password"><span class="input-group-text p-0"><button id="signin" type="button" class="btn btn-primary">Approve <span class="icon icon-right-arrow"></span></button></span></div></div>';
        n = n + '<div class="w-100 text-center"><button id="backmain" type="button" class="btn btn-error"><span class="icon icon-close"></span> Deny request</button></div>';
    n=n+'</div>';

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
  let password=document.getElementById("password").value;
  let domain=document.getElementById("domain").value;
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet"+currentaccountid)){
    encrypted=localStorage.getItem("webwallet"+currentaccountid);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  } else if(password.length==0) {
      alert("Password is wrong!");
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
