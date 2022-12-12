//TODO:  change account description, remove account, copy account without hidden field, improve support link
// TODO set a red light and switch to green when connected
// evaluate the encryption of account description and account code (better privacy)
// ask for access password initially to decrypt the data above and keep it open for the session till the browser is open

window.api = polkadotApi
window.util = polkadotUtil;
window.util_crypto = polkadotUtilCrypto;
window.keyring = polkadotKeyring;

let current_browser
// used for browser runtime
if(get_browser() === 'chrome') {
    current_browser = chrome
} else {
    current_browser = browser
}

let keyspairv='';
let keyringv=false;
let mnemonic='';
let mnemonic_array=[];
let shuffled_mnemonic_array=[];
let user_mnemonic_array=[];
let user_mnemonic_sortable = [];
let import_mnemonic_array=[];
let import_mnemonic_sortable=[];
let apiv='';
let balancev=0;
let balancevf='0.00';

let notification = null;

let main_account = null;
let current_account_id = 0;
let current_account = null;
let current_account_transactions = [];
let total_accounts = 0;
let current_extrinsic_id = null;

let skip_intro = false;
let command="";

if(localStorage.getItem("skip_intro")){
    skip_intro=localStorage.getItem("skip_intro");
}


async function refresh_account() {
    // get last used account id
    if (localStorage.getItem("current_account_id")) {
        current_account_id = parseInt(localStorage.getItem("current_account_id"));
        if (!localStorage.getItem("account_" + current_account_id)) {
            current_account_id = 0;
        }
    }

    // get web wallet account
    if (localStorage.getItem("account_" + current_account_id) && localStorage.getItem("wallet_data")) {
        current_account = JSON.parse(localStorage.getItem("account_" + current_account_id));
    }

    // get account transactions
    if (localStorage.getItem("account_transactions_" + current_account_id)) {
        current_account_transactions = JSON.parse(localStorage.getItem("account_transactions_" + current_account_id));
    }

    total_accounts = 0;
    for(let i = 0; i <= 99; i++) {
        if (localStorage.getItem("account_" + i)) {
            total_accounts++;
        }
    }
}

// add listeners for events (you cannot use onclick event in the extension)
document.addEventListener('DOMContentLoaded', async function () {
    hide_header();
    hide_footer();

    await refresh_account();

    // open connection
    await set_network();
    command="";

    // if at the least one account is available, we show it
    if (current_account) {
        if(!keyspairv.address) {
            let success = await load_account();
            if(!success) {
                show_login(true);
            } else {
                await refresh_password();
                hide_init()
                hide_login(true)
            }
        }

        const params = new URLSearchParams(window.location.search)
        // evaluate possible actions
        if (params.has("command")) {
            command = params.get('command');
            // transfer of funds
            if (command == "transfer" && params.has("recipient") && params.has("amount") && params.get("domain")) {
                const recipient=DOMPurify.sanitize(params.get("recipient"));
                const amount=DOMPurify.sanitize(params.get("amount"));
                const domain=DOMPurify.sanitize(params.get("domain"));
                await send(recipient, amount, domain);
                hide_login(true);
            }
            // sign-in
            if (command == "signin" && params.get("domain")) {
                const domain=DOMPurify.sanitize(params.get("domain"));
                signin(domain);
                hide_login(true);
            }
            // tx command to submit any kind of extrinsic
            if (command == "tx"  && params.has("pallet") && params.has("call") && params.has("parameters") && params.get("domain")) {
                const pallet=DOMPurify.sanitize(params.get("pallet"));
                const call=DOMPurify.sanitize(params.get("call"));
                const parameters=DOMPurify.sanitize(params.get("parameters"));
                const domain=DOMPurify.sanitize(params.get("domain"));
                const id=DOMPurify.sanitize(params.get("id"));
                await extrinsic(pallet, call, parameters, domain, id);
                hide_login(true);
            }
            // portfolio
            if (command == "portfolio") {
                await dashboard(true);
            }
        } else {
            // main dashboard
            await dashboard(true);
        }
        //otherwise we let to create a new account
    } else {
        // set new/import keys screen
        if (!skip_intro) {
            welcome_screen();
            hide_login();
        } else {
            await wallet_create();
            hide_init();
            hide_login();
        }
    }

    // if (skip_intro) {
    //     hide_init()
    // }
});
function welcome_screen() {
    hide_footer();

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

    let n='<svg class="bitgreen-svg" width="220" height="55" stroke="#FFFFFF" stroke-width="1" viewBox="0 0 400 100" fill="none" fill-opacity="0" xmlns="http://www.w3.org/2000/svg">';
        n=n+'<path d="M60.6852 16.2542C60.6852 7.90071 53.9055 1.18158 45.6125 1.18158H0.757812V76.5448H45.6125C53.966 76.5448 60.6852 69.7651 60.6852 61.4721C60.6852 57.1743 58.8087 53.0581 55.6004 50.1525C58.8087 47.3075 60.6852 43.1913 60.6852 38.8329C60.6852 34.5351 58.8087 30.4189 55.6004 27.5738C58.8692 24.6683 60.6852 20.6126 60.6852 16.2542ZM10.1404 8.74817H43.3123C47.4285 8.6271 50.8789 11.8959 50.9999 16.0121C51.121 20.1283 47.8522 23.5787 43.736 23.6997C43.615 23.6997 43.4334 23.6997 43.3123 23.6997H10.1404V8.74817ZM10.1404 31.3269H43.3123C47.4285 31.2058 50.8789 34.4746 50.9999 38.5908C51.121 42.707 47.8522 46.1574 43.736 46.2784C43.615 46.2784 43.4334 46.2784 43.3123 46.2784H10.1404V31.3269ZM43.3123 68.9177H10.1404V53.9661H43.3123C47.4285 53.9661 50.8183 57.2954 50.8183 61.4721C50.8183 65.5884 47.4891 68.9177 43.3123 68.9177Z" fill="white"/>';
        n=n+'<path d="M70.8545 10.9879V1.60535H80.116V10.9274H70.8545V10.9879ZM70.8545 76.5448V20.2494H80.116V76.5448H70.8545Z" fill="white" fill-opacity="0"/>';
        n=n+'<path d="M110.382 76.5448C99.3049 76.5448 96.3993 72.3681 96.3993 63.3487V27.2712H85.4429V20.1889H97.4283L97.6099 1.60535H105.6V20.1889H124.668V27.2712H105.6V69.1598H123.942V76.4843L110.382 76.5448Z" fill="white" fill-opacity="0"/>';
        n=n+'<path d="M174.85 19.8862H183.93V76.6659C183.93 91.7385 176.545 100.455 155.964 100.455C139.075 100.455 129.995 93.0702 129.027 80.1768H137.985C138.651 87.6828 143.433 93.3123 156.024 93.3123C169.402 93.3123 174.971 88.6513 174.971 76.5448V64.3172C171.097 71.7022 164.075 75.3341 153.906 75.3341C136.109 75.3341 127.755 64.2567 127.755 46.7627C127.755 29.4504 136.169 18.3123 153.906 18.3123C164.196 18.3123 171.157 22.368 174.971 29.632L174.85 19.8862ZM174.85 46.7022C174.85 31.3874 167.949 25.3947 155.903 25.3947C143.01 25.3947 136.896 31.4479 136.896 46.7022C136.896 61.9564 143.01 68.1308 155.903 68.1308C167.949 68.1308 174.85 62.138 174.85 46.7022Z" fill="white" fill-opacity="0"/>';
        n=n+'<path d="M225.274 19.0993V28.0581H222.913C206.145 27.5133 202.513 39.7409 202.513 55.7216V76.5448H193.434V19.8862H202.513V35.201C205.903 25.2131 212.501 19.0993 223.276 19.0993H225.274Z" fill="white" fill-opacity="0"/>';
        n=n+'<path d="M272.065 59.0509H280.358C279.208 67.6465 272.671 78.3003 253.845 78.3003C234.353 78.3003 225.758 65.1647 225.758 48.0339C225.758 31.1453 235.08 18.0097 253.845 18.0097C270.855 18.0097 280.479 29.6925 280.479 46.2179C280.54 47.5497 280.419 48.8814 280.237 50.2131H234.656C235.322 65.7095 242.828 71.3995 254.148 71.3995C265.286 71.3995 270.37 66.1937 272.065 59.0509ZM234.898 43.4334H271.581C271.157 30.4189 264.438 24.971 253.906 24.971C243.191 24.971 236.169 30.0557 234.898 43.4334Z" fill="white" fill-opacity="0"/>';
        n=n+'<path d="M333.082 59.0509H341.375C340.225 67.6465 333.688 78.3003 314.862 78.3003C295.371 78.3003 286.775 65.1647 286.775 48.0339C286.775 31.1453 296.097 18.0097 314.862 18.0097C331.872 18.0097 341.496 29.6925 341.496 46.2179C341.557 47.5497 341.436 48.8814 341.254 50.2131H295.734C296.4 65.7095 303.906 71.3995 315.225 71.3995C326.303 71.3995 331.387 66.1937 333.082 59.0509ZM295.976 43.4334H332.659C332.235 30.4189 325.516 24.971 314.983 24.971C304.208 24.971 297.187 30.0557 295.976 43.4334Z" fill="white" fill-opacity="0"/>';
        n=n+'<path d="M400.758 40.4068V76.5448H391.678V41.4358C391.678 29.3293 386.351 25.6973 378.058 25.6973C365.468 25.6973 358.809 35.4431 358.809 54.9346V76.5448H349.729V19.8862H358.809V34.8378C362.441 23.9419 369.463 18.0702 380.54 18.0702C394.765 18.0702 400.758 25.7579 400.758 40.4068Z" fill="white" fill-opacity="0"/>';
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
        delay: 4400,
        translateY: [40, 0],
        opacity: [0, 1]
    });

    localStorage.removeItem("wallet_data");
}
function hide_init() {
    setTimeout(function() {
        document.getElementById("init_screen").classList.add("fade-out");
    }, 300);
    setTimeout(function() {
        document.getElementById("init_screen").classList.add("inactive")
        document.getElementById("init_screen").classList.remove("fade-out")
    }, 600)
}
async function wallet_create() {
    if(current_account) {
        await dashboard();
        return;
    }

    await show_header('wallet_create');
    show_footer();

    localStorage.setItem("skip_intro", true);

    let n='<div id="heading">';
        n=n+'<div class="content row">';
            n=n+'<h1 class="text-center text-white">Get started</h1>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content">';
        n=n+'<div id="newkeys" class="button-item d-flex align-items-center">';
            n=n+'<span class="icon icon-plus text-center"></span>';
            n=n+'<div class="col"><h3 class="m-0">Create new wallet</h3><p class="text-gray m-0 w-100">Add a new wallet by generating a passphrase.</p></div>';
            n=n+'<span class="icon icon-right-arrow text-center"></span>';
        n=n+'</div>';
        n=n+'<div id="importkeys" class="button-item d-flex align-items-center">';
            n=n+'<span class="icon icon-import text-center"></span>';
            n=n+'<div class="col"><h3 class="m-0">Import Wallet</h3><p class="text-gray m-0 w-100">Import an existing wallet using your passphrase.</p></div>';
            n=n+'<span class="icon icon-right-arrow text-center"></span>';
        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("newkeys").addEventListener("click", newkeys);
    document.getElementById("importkeys").addEventListener("click", importkeys);

    anime({
        targets: '#bordered_content',
        duration: 800,
        translateY: [50, 0],
        easing: 'linear',
    });
}
// function to change network
async function change_network() {
    let network;
    if (document.getElementById("change_network")) {
        network = DOMPurify.sanitize(document.getElementById("change_network").value);
    }

    localStorage.setItem("selected_network", network);

    await set_network();
}
// function to open connection to network
async function set_network() {
    // TODO set a red light and switch to green when connected
    let network = localStorage.getItem("selected_network");
    if(!network) {
        network = 'testnet' // default endpoint TODO: update once we go live
        localStorage.setItem("selected_network", network);
    }
    let ws_provider;

    if (network === 'mainnet') {
        ws_provider = 'wss://mainnet.bitgreen.org';
    } else if (network === 'testnet') {
        ws_provider = 'wss://testnet.bitgreen.org';
    } else {
        let custom_network = JSON.parse(localStorage.getItem(network));
        ws_provider = custom_network.url;
    }

    let error = false;
    const wsProvider = new api.WsProvider(ws_provider);
    wsProvider.on('error',async function(e) {
        // if(count > 5) {
        //     // after 5 tries, load default
        //     localStorage.removeItem("selected_network")
        //     window.top.location.reload();
        // }
        error = true;
        await wsProvider.disconnect()

        // return await set_network();
    });

    apiv = await api.ApiPromise.create({
        provider: wsProvider, types:
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
                    "min_balance": "Balance",
                    "zombies": "u32",
                    "accounts": "u32",
                    "is_frozen": "bool"
                },
                "AssetMetadata": {
                    "deposit": "DepositBalance",
                    "name": "Vec<u8>",
                    "symbol": "Vec<u8>",
                    "decimals": "u8"
                },
                "AssetBalance": {
                    "balance": "Balance",
                    "is_frozen": "bool",
                    "is_zombie": "bool"
                },
                "AssetId": "u32",
                "BalanceOf": "Balance",
                "VCU": {
                    "serial_number": "i32",
                    "project": "Vec<u8>",
                    "amount_co2": "Balance",
                    "ipfs_hash": "Vec<u8>"
                }
            }
    });

    await get_balances();
}
async function get_balances() {
    if(!current_account) {
        return;
    }

    // TODO set a green light
    // get balance and show it
    let {nonce, data: balance} = await apiv.query.system.account(current_account.address);
    if (parseInt(balance.free.toString()) > 0) {
        balancev = parseInt(balance.free.toString()) / 1000000000000000000;
        balancevf = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        }).format(balancev);
    } else {
        balancev = 0;
        balancevf = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        }).format(balancev);
    }
}
// generate keys pair
async function newkeys(obj, error) {
    hide_header();
    hide_footer();

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
            n = n + '</div>';
            n = n + '<div class="footer d-flex align-items-sketch align-items-center">';
            n = n + '<div class="col-8 p-0 pt-1 select-none"><p class="d-flex align-items-center text-dark fw-bold"><input id="agree_new_key" type="checkbox" class="me-2"><label for="agree_new_key" class="text-small">I have safely stored my secret phrase<br><span class="text-gray fw-light">You must confirm in order to proceed.</span></label></p></div>';
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
function backup_wallet() {
    hide_header();
    hide_footer();

    let n='<div id="full_page">';
        n=n+'<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Backup Wallet</h3></div>';
        n=n+'<div class="content">';
            n=n+'<h2>Backup your secret phrase</h2>';
            n=n+'<div class="alert alert-danger d-flex align-items-stretch"><div class="icon d-flex align-items-center"><span class="icon-alert"></span></div><p class="w-100 m-0 p-2">Anyone with access to your secret words can transfer your funds! Store them securely and do not share with untrusted parties.</p></div>';
            n=n+'<p class="text-gray pb-2">Please carefully store the secret words below in a safe place. They are the keys to your wallet and can be used to recover your wallet on a different device.</p>';
            n=n+'<div class="row d-flex align-items-center mb-1"><h2 class="col-8 m-0">Secret phrase words</h2><div class="col-4 d-flex flex-row-reverse"><button id="copy_seed" type="button" class="btn btn-sm btn-secondary btn-hidden pe-3 ps-3" style="opacity: 0;"><span class="icon icon-left icon-copy"></span> Copy</button></div></div>';
            n=n+'<div id="backup_mnemonics" class="mnemonics mnemonics-hidden d-block mt-2">';
                Array(24).fill().forEach(function(val, index) {
                    n=n+'<div class="word col-3 d-inline-block"><div class="badge bg-secondary"><span class="index">'+(index+1)+'</span><span class="text col">'+random_string(Math.floor(Math.random() * 4) + 3)+'</span></div></div>';
                })
            n=n+'</div>';
            n=n+'<div id="password_input" class="footer d-flex align-items-sketch flex-row-reverse">';
                n=n+'<div class="w-100"><label class="label text-dark">Enter your password to reveal secret phrase</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon icon-password"></span></span><input id="password" type="password" class="form-control" placeholder="Wallet Password"><span class="input-group-text p-0"><button id="reveal_mnemonics" type="button" class="btn btn-primary">Reveal <span class="icon icon-right-arrow"></span></button></span></div></div></div>';
            n=n+'</div>';
        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", settings);
    document.getElementById("reveal_mnemonics").addEventListener("click", reveal_mnemonics);
    document.getElementById("copy_seed").addEventListener("click", copy_seed);
    document.getElementById("password").addEventListener("keypress", async function(e) {
        if (e.key === "Enter") {
            await reveal_mnemonics();
        }
    });
}
function random_string(len) {
    let text = "";

    let charset = "abcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}
async function reveal_mnemonics() {
    let notification_message = null;
    let password = DOMPurify.sanitize(document.getElementById("password").value);

    let encrypted = '';
    // read the encrypted storage
    if (localStorage.getItem("webwallet")) {
        encrypted = localStorage.getItem("webwallet");
    }

    // try to decrypt and get mnemonic
    let mnemonics = await decrypt_wallet(password, true);
    if(mnemonics) {
        mnemonic_array = mnemonics.split(' ');
        let n = '';
        mnemonic_array.forEach(function(val, index) {
            n=n+'<div class="word col-3 d-inline-block"><div class="badge bg-secondary"><span class="index">'+(index+1)+'</span><span class="text col">'+val+'</span></div></div>';
        })
        document.getElementById("backup_mnemonics").innerHTML = n;
        document.getElementById("backup_mnemonics").classList.remove('mnemonics-hidden');
        document.getElementById("copy_seed").classList.remove('btn-hidden');

        anime({
            targets: '#password_input',
            duration: 300,
            translateY: [0, 60],
            opacity: [1, 0],
            easing: 'linear',
            delay: 0
        });

        anime({
            targets: '#copy_seed',
            duration: 300,
            opacity: [0, 1],
            easing: 'linear',
            delay: 1200
        });

        anime({
            targets: '#backup_mnemonics .badge .text',
            opacity: [0, 1],
            easing: 'easeInOutSine',
            duration: 250,
            delay: function(el, i) { return i * 50 + 1200 },
        });
    } else {
        notification_message = 'Password is wrong!';
    }

    if(notification_message) {
        if(notification) {
            notification.hideToast()
        }
        notification = Toastify({
            text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon icon-alert"></span></div><div class="col-10">'+notification_message+'</div></div>',
            offset: {
                y: 50
            },
            duration: 3000,
            className: 'notification notification-error',
            close: false,
            stopOnFocus: false,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            escapeMarkup: false,
            onClick: function(){
                notification.hideToast()
            }
        }).showToast();
    }
}
async function copy_seed() {
    await navigator.clipboard.writeText(mnemonic_array.join(' '));

    if(notification) {
        notification.hideToast()
    }
    notification = Toastify({
        text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon icon-alert"></span></div><div class="col-10">Secret phrase copied to your clipboard! Keep it safe!</div></div>',
        offset: {
          y: 40
        },
        duration: 3000,
        className: 'notification notification-info',
        close: false,
        stopOnFocus: false,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        escapeMarkup: false,
        onClick: function(){
            notification.hideToast()
        }
    }).showToast();
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
    hide_header();
    hide_footer();

    shuffled_mnemonic_array = shuffleArray(mnemonic_array);
    user_mnemonic_array = [];
    let n = '<div id="full_page">';
        n = n + '<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Create Wallet</h3></div>';
        n = n + '<div class="content">';
            n = n + '<h2>Confirm secret phrase</h2>';
            n = n + '<p class="text-gray pb-2">Confirm the secret phrase from the previous screen, with each phrase in the correct order.</p>';
            n = n + '<div id="user_mnemonics" class="mnemonics clickable bordered bordered-green select-none d-block animated hidden"></div>';
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

    if(user_mnemonic_array.length > 0) {
        document.getElementById("user_mnemonics").classList.remove('hidden')
    } else {
        document.getElementById("user_mnemonics").classList.add('hidden')
    }

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
    hide_header();
    hide_footer();

    let n = '<div id="full_page">';
    n = n + '<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Create Wallet</h3></div>';
    n = n + '<div class="content">';
    n = n + '<h2>Set your wallet password</h2>';
    n = n + '<p class="text-gray pb-2">Set a strong password to encrypt the secret words on your computer. This password will allow you to unlock this wallet when you need to use it.</p>';
    n = n + '<label class="label text-dark">Password</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon icon-password"></span></span><input id="password" type="password" class="form-control" placeholder="Strong Password"></div></div>';
    n = n + '<div class="info-messages mt-2 mb-4">';
    n = n + '<div class="message d-flex align-items-center"><span id="length_icon"><span class="icon icon-close"></span></span>12 characters or more</div>';
    n = n + '<div class="message d-flex align-items-center"><span id="lowercase_icon"><span class="icon icon-close"></span></span>At least 1 lowercase letter</div>';
    n = n + '<div class="message d-flex align-items-center"><span id="uppercase_icon"><span class="icon icon-close"></span></span>At least 1 uppercase letter</div>';
    n = n + '<div class="message d-flex align-items-center"><span id="digit_icon"><span class="icon icon-close"></span></span>At least 1 digit</div>';
    n = n + '<div class="message d-flex align-items-center"><span id="symbol_icon"><span class="icon icon-close"></span></span>At least 1 special symbol</div>';
    n = n + '</div>';
    n = n + '<label class="label text-dark d-flex align-items-center"><div class="col">Repeat Password</div><div class="col d-flex flex-row-reverse align-items-center">Both match <div id="repeat_icon" class="me-2"><span class="icon icon-close"></span></div></div></label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon icon-password"></span></span><input id="password_repeat" type="password" class="form-control" placeholder="Repeat Password"></div></div>';
    n = n + '<label class="label text-dark mt-3">Name</label><div class="form-group"><div class="input-group"><span class="input-group-text bigger"><span class="icon icon-pen"></span></span><input id="wallet_name" type="text" class="form-control" placeholder="Wallet Name"></div></div>';
    n = n + '<div class="footer d-flex align-items-sketch flex-row-reverse">';
    n = n + '<div class="d-flex"><button id="set_password" class="btn btn-sm disabled ps-3 pe-3">Continue <span class="icon icon-right-arrow"></span></button></div>';
    n = n + '</div>';
    n = n + '</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", wallet_create);
    document.getElementById("password").addEventListener("input", check_password);
    document.getElementById("password_repeat").addEventListener("input", check_password);
    document.getElementById("wallet_name").addEventListener("input", check_password);
    document.getElementById("set_password").addEventListener("click", store_keys);
}
function check_password() {
    let password = DOMPurify.sanitize(document.getElementById('password').value);
    let password_repeat = DOMPurify.sanitize(document.getElementById('password_repeat').value);
    let wallet_name = DOMPurify.sanitize(document.getElementById('wallet_name').value);
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

    if(wallet_name.length === 0) {
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
async function importkeys() {
    hide_header();
    hide_footer();

    import_mnemonic_array = []
    let n = '<div id="full_page">';
    n = n + '<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Import Wallet</h3></div>';
    n = n + '<div class="content">';
    n = n + '<h2>Enter secret phrase</h2>';
    n = n + '<p class="text-gray pb-2">Enter an existing secret phrase to import that wallet. Each phrase must be in the correct sequence.</p>';
    n = n + '<div class="form-group"><div class="input-group"><input id="keyword" type="text" class="form-control ps-3" placeholder="keyword"><span class="input-group-text p-0"><button id="import_word" type="button" class="btn btn-secondary">Add <span class="icon icon-right-arrow"></span></button></span></div></div>';
    n = n + '<div id="mnemonics_info" class="text-gray d-flex align-items-center animated hidden">';
        n = n + '<div class="col-6 d-flex align-items-center flex-row-reverse"><span>Click to remove</span><span class="icon icon-click-radial"></span></div>';
        n = n + '<div class="col-6 d-flex align-items-center"><span class="icon icon-drag"></span><span>Drag to reorder</span></div>';
    n = n + '</div>';
    n = n + '<div id="import_mnemonics" class="mnemonics clickable bordered bordered-green select-none d-block animated hidden"></div>';
    n = n + '<div class="footer d-flex align-items-sketch flex-row-reverse">';
    n = n + '<div class="d-flex"><button id="continue_new_key" class="btn btn-sm disabled ps-3 pe-3">Import <span class="icon icon-right-arrow"></span></button></div>';
    n = n + '</div>';
    n = n + '</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", wallet_create);
    document.getElementById("import_word").addEventListener("click", import_word);
    document.getElementById("import_mnemonics").addEventListener("click", remove_imported_word);
    document.getElementById("continue_new_key").addEventListener("click", importkeysvalidation);
    document.getElementById("keyword").addEventListener("keypress", async function(e) {
        if (e.key === "Enter") {
            import_word()
        }
    });

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
}
function import_word() {
    let input = DOMPurify.sanitize(document.getElementById("keyword").value);
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

    if(import_mnemonic_array.length > 0) {
        document.getElementById("mnemonics_info").classList.remove('hidden')
        document.getElementById("import_mnemonics").classList.remove('hidden')
    } else {
        document.getElementById("mnemonics_info").classList.add('hidden')
        document.getElementById("import_mnemonics").classList.add('hidden')
    }

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

    sessionStorage.setItem('finish_message', 'imported');
}
// function to encrypt and store the secret words
async function store_keys() {
    const pwd = DOMPurify.sanitize(document.getElementById('password').value);
    const name = DOMPurify.sanitize(document.getElementById('wallet_name').value);

    const encrypted_data = await encrypt_wallet(pwd);

    // store encrypted data
    localStorage.setItem("wallet_data", JSON.stringify(encrypted_data));
    localStorage.setItem("account_0", JSON.stringify({
        "address": keyspairv.address,
        "name": name
    }));

    finish_keys();
}
function finish_keys() {
    hide_header();
    hide_footer();

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
        n = n + '<p class="text-center"><button id="new_account" type="button" class="btn btn-text btn-sm"><span class="icon icon-plus me-2"></span>Create another account</button></p>';
    }
    n = n + '<p class="text-center"><button id="gotodashboard" type="button" class="btn btn-primary mt-2">View Portfolio</button></p>';
    n = n + '</div>';
    n = n + '</div>';

    document.getElementById("root").innerHTML = n;
    if(message === 'created') {
        document.getElementById("new_account").addEventListener("click", new_account);
    }
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
        delay: 1400
    });

    anime({
        targets: '#new_account',
        translateX: [-40, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 600,
        delay: 1400,
    });

    anime({
        targets: '#gotodashboard',
        translateX: [-50, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 600,
        delay: 1800,
    });

    refresh_account().then(get_balances);
}
// Main Dashboard
async function dashboard(extend_delay = false) {
    if(!current_account) {
        await wallet_create();
        return;
    }

    if(!keyringv) {
        show_login(true);
    }

    await show_header('dashboard');
    show_footer('dashboard', extend_delay);

    extend_delay = (typeof extend_delay === 'boolean' ? extend_delay : false)

    let n='<div id="heading" class="bigger">';
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
        n=n+'<div class="col-6 p-0 d-flex flex-row-reverse"><div class=""><button id="send" type="button" class="btn btn-primary me-2">Send <span class="icon icon-right-up-arrow ms-2"></span></button></div></div>';
        n=n+'<div class="col-6 p-0 d-flex"><button id="receive" type="button" class="btn btn-primary ms-2"><span class="icon icon-left-down-arrow me-2"></span> Receive</button></div>';
        n=n+'</div>';
        n=n+'<div class="row" style="margin-top: -6px;">';
            n=n+'<div class="col-4 pe-2">';
                n=n+'<div class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-b-circle"></span>';
                n=n+'<div class="title d-flex align-items-center"><span class="w-100">BBB TOKEN</span></div>';
                n=n+'</div>';
            n=n+'</div>';
            n=n+'<div id="nature_based_credits" class="col-4 ps-1 pe-1">';
                n=n+'<div class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-co2-circle" style="color: #9ECC00;"></span>';
                n=n+'<div class="title d-flex align-items-center"><span class="w-100">NATURE-BASED CREDITS</span></div>';
                n=n+'</div>';
            n=n+'</div>';
            n=n+'<div id="retired_credits" class="col-4 ps-2">';
                n=n+'<div class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-retired-outline" style="color: #D5D6DA;"></span>';
                n=n+'<div class="title d-flex align-items-center"><span class="w-100">RETIRED CREDITS</span></div>';
                n=n+'</div>';
            n=n+'</div>';
        n=n+'</div>';
        n=n+'<div class="row">';
            n=n+'<div class="col-4 pe-2">';
                n=n+'<div class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-impact-outline" style="color: #026AA2;"></span>';
                n=n+'<div class="title d-flex align-items-center"><span class="w-100">IMPACT BONDS</span></div>';
                n=n+'</div>';
            n=n+'</div>';
            n=n+'<div class="col-4 ps-1 pe-1">';
                n=n+'<div class="button-item button-gray tab-item">';
                n=n+'<span class="icon icon-other" style="color: #D5D6DA;"></span>';
                n=n+'<div class="title d-flex align-items-center"><span class="w-100">OTHER</span></div>';
                n=n+'</div>';
            n=n+'</div>';
        n=n+'</div>';
    n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;

    anime({
        targets: '#portfolio .info h1',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 300,
        delay: extend_delay ? 1000 : 200
    });

    anime({
        targets: '#portfolio .info p',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 300,
        delay: function(el, i) { return i * 200 + (extend_delay ? 1200 : 400) },
    });

    anime({
        targets: '#portfolio .info p .icon',
        translateX: [20, 0],
        scale: [1.5, 1],
        easing: 'easeInOutSine',
        duration: 300,
        delay: function(el, i) { return i * 200 + (extend_delay ? 1200 : 400) },
    });

    anime({
        targets: '#bordered_content',
        duration: 800,
        translateY: [50, 0],
        easing: 'linear',
        delay: extend_delay ? 800 : 0
    });

    anime({
        targets: '#bordered_content #top_items button',
        duration: 400,
        translateX: [20, 0],
        opacity: [0, 1],
        easing: 'linear',
        delay: function(el, i) { return i * 300 + (extend_delay ? 1400 : 600) },
    });

    anime({
        targets: '#bordered_content .button-item',
        easing: 'easeInOutSine',
        translateX: [-20, 0],
        opacity: [0, 1],
        // duration: 300,
        duration: function(el, i) { return (extend_delay ? 600 : 400) - i * (extend_delay ? 100 : 50) },
        delay: function(el, i) { return i * 200 + (extend_delay ? 800 : 200) },
    });

    document.getElementById("send").addEventListener("click", send);
    document.getElementById("receive").addEventListener("click", receive);
    document.getElementById("nature_based_credits").addEventListener("click", nature_based_credits);
    document.getElementById("retired_credits").addEventListener("click", retired_credits);
}
async function nature_based_credits() {
    hide_header();
    show_footer();

    let n='<div id="heading" class="custom-header medium">';
        n=n+'<div class="heading d-flex align-items-center">';
            n=n+'<span id="goback" class="icon icon-left-arrow click"><span class="text">Portfolio</span></span>';
        n=n+'</div>';
        n=n+'<div class="content row pt-0">';
            n=n+'<h2 class="text-center text-white amount-wrapper"><span class="dollar">$</span><span class="amount">0</span><span class="decimals">.00</span></h2>';
            n=n+'<h2 class="text-center text-white fixed-title">Nature-Based Credits</h2>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content" class="medium">';
        n=n+'<div id="loading_content">';
            n=n+'<svg class="icon" width="50" height="60" viewBox="0 0 103 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M72.7507 115.104H16.0667V89.6321H72.7507C79.8249 89.6321 85.5586 95.3336 85.5586 102.368C85.5586 109.401 79.8249 115.104 72.7507 115.104ZM16.0667 51.2642H72.7507C79.8249 51.2642 85.5586 56.9657 85.5586 64C85.5586 71.0333 79.8249 76.7358 72.7507 76.7358H16.0667V51.2642ZM16.0667 12.8963H72.7507C79.8249 12.8963 85.5586 18.5978 85.5586 25.6321C85.5586 32.6654 79.8249 38.3679 72.7507 38.3679H16.0667V12.8963ZM102.4 25.6321C102.4 11.476 90.8591 0 76.6229 0H0V38.3679V51.2642V76.7358V89.6321V128H76.6229C90.8591 128 102.4 116.524 102.4 102.368C102.4 94.732 99.0377 87.8797 93.7104 83.1839C99.0377 78.4882 102.4 71.6359 102.4 64C102.4 56.3641 99.0377 49.5118 93.7104 44.816C99.0377 40.1203 102.4 33.268 102.4 25.6321Z"></svg>';
            n=n+'<div class="text">Under construction</div>';
        n=n+'</div>';
        n=n+'<div id="transactions" class="smaller"></div>';
        n=n+'<div id="transactions_end"></div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", dashboard);
}
async function retired_credits() {
    hide_header();
    show_footer();

    let n='<div id="heading" class="custom-header medium">';
        n=n+'<div class="heading d-flex align-items-center">';
            n=n+'<span id="goback" class="icon icon-left-arrow click"><span class="text">Portfolio</span></span>';
        n=n+'</div>';
        n=n+'<div class="content row pt-0">';
            n=n+'<h2 class="text-center text-white fixed-title">Retired Credits</h2>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content" class="medium">';
        n=n+'<div id="loading_content">';
            n=n+'<svg class="icon" width="50" height="60" viewBox="0 0 103 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M72.7507 115.104H16.0667V89.6321H72.7507C79.8249 89.6321 85.5586 95.3336 85.5586 102.368C85.5586 109.401 79.8249 115.104 72.7507 115.104ZM16.0667 51.2642H72.7507C79.8249 51.2642 85.5586 56.9657 85.5586 64C85.5586 71.0333 79.8249 76.7358 72.7507 76.7358H16.0667V51.2642ZM16.0667 12.8963H72.7507C79.8249 12.8963 85.5586 18.5978 85.5586 25.6321C85.5586 32.6654 79.8249 38.3679 72.7507 38.3679H16.0667V12.8963ZM102.4 25.6321C102.4 11.476 90.8591 0 76.6229 0H0V38.3679V51.2642V76.7358V89.6321V128H76.6229C90.8591 128 102.4 116.524 102.4 102.368C102.4 94.732 99.0377 87.8797 93.7104 83.1839C99.0377 78.4882 102.4 71.6359 102.4 64C102.4 56.3641 99.0377 49.5118 93.7104 44.816C99.0377 40.1203 102.4 33.268 102.4 25.6321Z"></svg>';
            n=n+'<div class="text">Under construction</div>';
        n=n+'</div>';
        n=n+'<div id="transactions" class="smaller"></div>';
        n=n+'<div id="transactions_end"></div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", dashboard);

}
async function transactions_history() {
    await show_header('transactions_history');
    show_footer('transactions_history');

    if(!keyringv) {
        show_login(true);
    }

    let n='<div id="heading">';
        n=n+'<div class="content row">';
            n=n+'<h1 class="text-center text-white">Transaction History</h1>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content">';
        n=n+'<div id="loading_content">';
            n=n+'<svg class="icon" width="50" height="60" viewBox="0 0 103 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M72.7507 115.104H16.0667V89.6321H72.7507C79.8249 89.6321 85.5586 95.3336 85.5586 102.368C85.5586 109.401 79.8249 115.104 72.7507 115.104ZM16.0667 51.2642H72.7507C79.8249 51.2642 85.5586 56.9657 85.5586 64C85.5586 71.0333 79.8249 76.7358 72.7507 76.7358H16.0667V51.2642ZM16.0667 12.8963H72.7507C79.8249 12.8963 85.5586 18.5978 85.5586 25.6321C85.5586 32.6654 79.8249 38.3679 72.7507 38.3679H16.0667V12.8963ZM102.4 25.6321C102.4 11.476 90.8591 0 76.6229 0H0V38.3679V51.2642V76.7358V89.6321V128H76.6229C90.8591 128 102.4 116.524 102.4 102.368C102.4 94.732 99.0377 87.8797 93.7104 83.1839C99.0377 78.4882 102.4 71.6359 102.4 64C102.4 56.3641 99.0377 49.5118 93.7104 44.816C99.0377 40.1203 102.4 33.268 102.4 25.6321Z"></svg>';
            n=n+'<div class="text">Loading</div>';
        n=n+'</div>';
        n=n+'<div id="transactions"></div>';
        n=n+'<div id="transactions_end"></div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;

    let transactions = await get_transactions();

    n='';
    if(transactions.length > 0) {
        for(let r in transactions) {
            let transaction = transactions[r];
            let created_at = Date.parse(transaction['created_at']);
            created_at = new Date(created_at)
            let amount = transaction['amount']/1000000000000000000;
            amount = new Intl.NumberFormat('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4}).format(amount);
            let formatted_amount = amount.split('.')
            let transfer_element = '';
            let amount_element = '';

            if(transaction.sender.toLowerCase() === current_account.address.toLowerCase()) {
                amount_element = '<div class="token-amount align-items-center"><span class="d-flex align-items-center justify-content-center w-100 amount token-amount">-'+formatted_amount[0]+'<span class="d-inline-block digits text-gray">.'+formatted_amount[1]+'</span></span><span class="desc d-block w-100">TOKENS</span></div>';
                transfer_element = '<div class="col align-items-center"><span class="d-block w-100 icon icon-right-up-arrow icon-error"></span><span class="desc d-block w-100 text-gray">SENT</span></div>';
            } else {
                amount_element = '<div class="token-amount align-items-center"><span class="d-flex align-items-center justify-content-center w-100 amount token-amount">+'+formatted_amount[0]+'<span class="d-inline-block digits text-gray">.'+formatted_amount[1]+'</span></span><span class="desc d-block w-100">TOKENS</span></div>';
                transfer_element = '<div class="col align-items-center"><span class="d-block w-100 icon icon-left-down-arrow icon-success"></span><span class="desc d-block w-100 text-gray">RECEIVED</span></div>';
            }

            // backup design (text: transfer; icon: arrows)
            // amount_element = '<div class="token-amount align-items-center"><span class="d-flex align-items-center justify-content-center w-100 amount token-amount">'+formatted_amount[0]+'<span class="d-inline-block digits text-gray">.'+formatted_amount[1]+'</span></span><span class="desc d-block w-100">TOKENS</span></div>';
            // transfer_element = '<div class="col align-items-center"><span class="d-block w-100 icon icon-arrows icon-success"></span><span class="desc d-block w-100 text-gray">RECEIVED</span></div>';

            n=n+'<div class="button-item d-flex align-items-center" data-hash="'+transaction.hash+'">';
            n=n+'<div class="transaction-info d-flex align-items-center">';
                n=n+'<div class="col align-items-center"><span class="d-block w-100 amount">'+created_at.getDate()+'</span><span class="desc d-block w-100">'+created_at.toLocaleString('default', { month: 'short' })+'</span></div>';
                n=n+transfer_element;
                n=n+'<div class="col align-items-center"><span class="d-block w-100 icon icon-cicircle"></span><span class="desc d-block w-100 text-gray">BBB</span></div>';
                n=n+amount_element;
            n=n+'</div>';
            n=n+'<span class="icon icon-small icon-arrow-right-2 text-center"></span>';
            n=n+'</div>';
        }
    } else {
        n='<h3>No transactions yet.</h3>'
    }

    document.getElementById("transactions").innerHTML = n;
    document.getElementById("loading_content").classList.add('loaded');
    document.querySelectorAll("#transactions .button-item").forEach(t => {
        t.addEventListener("click", transaction)
    })

    anime({
        targets: '#transactions .button-item',
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeInOutSine',
        duration: 250,
        delay: function(el, i) { return (i * 150) > 1200 ? 1200 : (i * 150) },
    });
}
async function get_transactions() {
    let dt = new Date();
    let dtm=dt.toISOString().slice(0, 19).replace('T', '+');
    let url= 'http://157.90.126.46:3000/transactions?account='+current_account.address+'&date_start=2022-05-01&date_end='+dtm;

    current_account_transactions = []

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            for(let r in data.transactions) {
                let transaction = data['transactions'][r];

                current_account_transactions.push(transaction)
            }

            localStorage.setItem("account_transactions_" + current_account_id, JSON.stringify(current_account_transactions));

            return current_account_transactions;
        }).catch(function() {
            return false;
        });
}
function transaction(e) {
    hide_header();
    hide_footer();

    let transaction_hash = this.dataset.hash
    let transaction = current_account_transactions.find(({ hash }) => hash === transaction_hash)
    let transaction_amount = transaction.amount/1000000000000000000;

    let formatted_amount = new Intl.NumberFormat('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4}).format(transaction_amount).split('.')
    let total_value = new Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(transaction_amount*2.67).split('.')
    let estimated_fees = new Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(transaction_amount*2.65*0.046).split('.')

    let created_at = Date.parse(transaction.created_at);
    created_at = new Date(created_at)

    let n = '<div id="full_page">';
    n = n + '<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Transaction detail</h3></div>';
    n = n + '<div class="content">';
        n = n + '<div id="review_transaction" class="d-flex">';
            n = n + '<div class="token col-4 align-items-center justify-content-center">';
                n = n + '<div class="w-100 d-flex align-items-center justify-content-center"><span class="amount">'+formatted_amount[0]+'</span><span class="decimals">.'+formatted_amount[1]+'</span></div>';
                n = n + '<div class="title w-100 text-center">BBB</div>';
            n = n + '</div>';
            n = n + '<div class="col-4 align-items-center justify-content-center">';
                n = n + '<div class="w-100 d-flex align-items-center justify-content-center"><span class="dollar">$</span><span class="amount">'+total_value[0]+'</span><span class="decimals">.'+total_value[1]+'</span></div>';
                n = n + '<div class="title w-100 text-center">TOTAL VALUE</div>';
            n = n + '</div>';
            n = n + '<div class="estimated_fees col-4 align-items-center justify-content-center">';
                n = n + '<div class="w-100 d-flex align-items-center justify-content-center"><span class="dollar">$</span><span class="amount">'+estimated_fees[0]+'</span><span class="decimals">.'+estimated_fees[1]+'</span></div>';
                n = n + '<div class="title w-100 text-center">EST. FEES</div>';
            n = n + '</div>';
        n = n + '</div>';
        n = n + '<p class="text-center mb-2"><a href="https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftestnet.bitgreen.org#/explorer/query/'+transaction.block_number+'" class="btn btn-text" target="_blank">View in explorer <span class="icon icon-right-up-arrow ms-2"></span></a></p>';
        n = n + '<p class="text-grotesk text-center text-bold text-gray mb-2">'+created_at.toLocaleString('default', { weekday: 'long' })+', '+created_at.getDate()+' '+created_at.toLocaleString('default', { month: 'long' })+' '+created_at.getFullYear()+' ('+timeSince(created_at)+')</p>';
        n = n + '<div id="transaction_info">';
            n = n + '<div class="wallet w-100 d-flex align-items-center">';
                n = n + '<div class="col-1 d-flex justify-content-center"><span class="dot"></span></div>';
                n = n + '<div class="right col-11">';
                    // n = n + '<h3 class="mb-1">From ('+(accountdescription.length > 14 ? accountdescription.substring(0,14)+'...' : accountdescription)+')</h3>';
                    n = n + '<h3 class="mb-1">From</h3>'; // TODO: read account name from storage
                    n = n + '<span class="address text-gray">'+transaction.sender+'</span>';
                n = n + '</div>';
            n = n + '</div>';
            n = n + '<div class="wallet w-100 d-flex align-items-center">';
                n = n + '<div class="col-1 d-flex justify-content-center"><span class="dot dot-green"><span class="dot-line"></span></span></div>';
                n = n + '<div class="right col-11">';
                    n = n + '<h3 class="mb-1">Recipient</h3>'; // TODO: or read here, depending if send or receive
                    n = n + '<span class="address text-gray">'+transaction.recipient+'</span>';
                n = n + '</div>';
            n = n + '</div>';
        n = n + '</div>';
    n = n + '</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", transactions_history);
}
function timeSince(date) {
    let seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1 && interval < 2) {
        return "last year";
    }
    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1 && interval < 2) {
        return "last month";
    }
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1 && interval < 2) {
        return "yesterday";
    }
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1 && interval < 2) {
        return "hour ago";
    }
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1 && interval < 2) {
        return "minute ago";
    }
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return "moment ago";
}
function settings(go_back = '', data = {}) {
    hide_header(go_back);
    show_footer();

    let n='<div id="full_page">';
    n=n+'<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Settings</h3></div>';
        n=n+'<div class="content">';
            n=n+'<div class="button-item settings-item d-flex align-items-center">';
                n=n+'<div class="col-7"><h4 class="m-0">Preferred display currency</h4><p class="text-gray m-0">Your preferred base currency.</p></div>';
                n=n+'<div class="col-5 d-flex flex-row-reverse"><select class="form-select"><option value="usd">USD</option></select></div>';
            n=n+'</div>';
            n=n+'<div class="button-item settings-item d-flex align-items-center">';
                n=n+'<div class="col-7"><h4 class="m-0">Network</h4><p class="text-gray m-0">Choose which network this wallet connects to.</p></div>';
                n=n+'<div class="col-5 d-flex flex-row-reverse">';
                n=n+'<select id="change_network" class="form-select">';
                    n=n+'<option value="mainnet" '+ ((localStorage.getItem("selected_network") === "mainnet" || !localStorage.getItem("selected_network")) ? "selected" : "") +'>Mainnet</option>';
                    n=n+'<option value="testnet" '+ (localStorage.getItem("selected_network") === "testnet" ? "selected" : "") +'>Testnet</option>';
                    for(let i = 1; i <= 99; i++) {
                        let network = JSON.parse(localStorage.getItem("custom_rpc_network_"+i));
                        if(network) {
                            n=n+'<option value="custom_rpc_network_'+i+'" '+ (localStorage.getItem("selected_network") === "custom_rpc_network_"+i ? "selected" : "") +'>'+network.name+'</option>';
                        }
                    }
                n=n+'</select>';
                n=n+'</div>';
            n=n+'</div>';
            n=n+'<div id="manage_networks" class="button-item settings-item d-flex align-items-center click">';
                n=n+'<div class="col"><h4 class="m-0">Manage Custom Networks</h4><p class="text-gray m-0">Add or remove other trusted networks.</p></div>';
                n=n+'<span class="icon icon-arrow-right-2 text-center"></span>';
            n=n+'</div>';
            n=n+'<div class="separator-line"></div>';

            if(current_account) {
                n=n+'<div id="manage_accounts" class="button-item settings-item d-flex align-items-center click">';
                    n=n+'<div class="col"><h4 class="m-0">Manage Accounts</h4><p class="text-gray m-0">Manage multiple accounts that you own.</p></div>';
                    n=n+'<span class="icon icon-arrow-right-2 text-center"></span>';
                n=n+'</div>';
                n=n+'<div id="backup_wallet" class="button-item settings-item d-flex align-items-center click">';
                    n=n+'<div class="col pe-3"><h4 class="m-0">Backup your wallet</h4><p class="text-gray m-0">Display your secret phrase, so you can back it up securely.</p></div>';
                    n=n+'<span class="icon icon-arrow-right-2 text-center"></span>';
                n=n+'</div>';
            } else {
                n=n+'<div id="go_import" class="button-item settings-item d-flex align-items-center click">';
                    n=n+'<div class="col"><h4 class="m-0">Restore a wallet</h4><p class="text-gray m-0">Import a wallet using an existing secret phrase.</p></div>';
                    n=n+'<span class="icon icon-arrow-right-2 text-center"></span>';
                n=n+'</div>';
            }

            n=n+'<div class="separator-line"></div>';

            n=n+'<div class="form-check form-switch d-flex align-items-center">';
                n=n+'<input class="form-check-input" type="checkbox" role="switch" id="dark_theme">';
                n=n+'<label class="form-check-label" for="dark_theme"><h4 class="m-0">Enable dark theme</h4></label>';
            n=n+'</div>';

            if(current_account) {
                n=n+'<div class="form-check form-switch d-flex align-items-center">';
                    n=n+'<input class="form-check-input" type="checkbox" role="switch" id="keep_me_signed_in" '+(localStorage.getItem("keep_me_signed_in") === 'true' ? 'checked="checked"' : '')+'>';
                    n=n+'<label class="form-check-label" for="keep_me_signed_in"><h4 class="m-0">Keep me signed in</h4><p class="text-gray m-0">Don’t ask me to sign in each time.</p></label>';
                n=n+'</div>';
            }

        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", async function() {
        if(go_back === 'transactions_history') {
            await transactions_history()
        } else if(go_back === 'send') {
            await send(data.recipient, data.amount)
        } else if(go_back === 'receive') {
            await receive()
        } else if(go_back === 'signin') {
            await signin(data.domain)
        } else if(go_back === 'extrinsic') {
            await extrinsic(data.pallet, data.call, data.parameters, data.domain, data.id)
        } else {
            await dashboard();
        }
    });
    document.getElementById("change_network").addEventListener("change", change_network);
    document.getElementById("manage_networks").addEventListener("click", manage_networks);
    if(current_account) {
        document.getElementById("manage_accounts").addEventListener("click", manage_accounts);
        document.getElementById("backup_wallet").addEventListener("click", backup_wallet);

        document.getElementById("keep_me_signed_in").addEventListener("change", function() {
            localStorage.setItem("keep_me_signed_in", document.getElementById("keep_me_signed_in").checked);
        });
    } else {
        document.getElementById("go_import").addEventListener("click", importkeys);
    }
}
// Manage accounts
function manage_accounts(){
    hide_header();
    show_footer();

    if(!keyringv) {
        show_login(true);
    }

    let n='<div id="heading" class="custom-header">';
        n=n+'<div class="heading d-flex align-items-center">';
            n=n+'<span id="goback" class="icon icon-left-arrow click"></span>';
            n=n+'<div class="col w-100 d-flex flex-row-reverse"><button id="new_account" type="button" class="btn btn-primary btn-sm ps-2 pe-3"><span class="icon icon-plus me-2"></span> New</button></div>';
        n=n+'</div>';
        n=n+'<div class="content row">';
            n=n+'<h1 class="text-center text-white">Manage Accounts</h1>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content">';
        if(total_accounts > 0) {
            n=n+'<div id="wallet_list">';
            for(let i = 0; i <= 99; i++) {
                if (localStorage.getItem("account_" + i)) {
                    let account = JSON.parse(localStorage.getItem("account_" + i));
                    let is_active = current_account_id === i;
                    let is_main = i === 0;

                    n = n + '<div class="button-item d-flex align-items-center" data-id="' + i + '">';
                    n = n + jdenticon.toSvg(account.address, 56);
                    n = n + '<div class="col"><h4 class="m-0 d-flex align-items-center">' + ((account.name && account.name.length > 10) ? account.name.substring(0,10)+'...' : account.name) + (is_main ? '<span class="badge badge-rounded badge-primary ms-1">Primary</span>' : '') +  (is_active ? '<span class="badge badge-rounded badge-secondary ms-1">Current</span>' : '') + '</h4><p class="text-gray text-small m-0 w-75"><span class="icon-wallet-outline me-1"></span>' + account.address.substring(0,12)+'...'+account.address.substring(account.address.length-8) + '</p></div>';
                    n = n + '<span class="icon icon-right-arrow text-center"></span>';
                    n = n + '</div>';
                }
            }
            n=n+'</div>';
        } else {
            n=n+'<h3>No wallets created yet.</h3>';
        }
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", settings);
    document.getElementById("new_account").addEventListener("click", new_account);
    document.querySelectorAll("#bordered_content .button-item").forEach(w => {
        w.addEventListener("click", function () {
            manage_account(this.dataset.id);
        }, false)
    })
}
function manage_account(id) {
    id = parseInt(id);

    hide_header();
    hide_footer();

    let account = JSON.parse(localStorage.getItem("account_"+id));

    let n='<div id="full_page">';
        n=n+'<div class="heading equal-padding d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Manage Account</h3>';
            if(id !== 0) {
                n=n+'<button id="delete_wallet" type="button" class="btn btn-sm btn-danger"><span class="icon icon-trash m-0 me-1 ms-1"></span></span></button>';
            }
        n=n+'</div>';
        n=n+'<div class="content">';
            n=n+'<h2>'+account.name+'</h2>';
            n=n+'<p class="text-gray text-small">'+account.address+'</p>';
            n=n+'<label class="label text-dark mt-3">Name</label><div class="form-group"><div class="input-group"><span class="input-group-text bigger"><span class="icon icon-pen"></span></span><input id="wallet_name" type="text" class="form-control" placeholder="Wallet Name" value="'+account.name+'"></div></div>';
            n=n+'<div class="footer d-flex align-items-sketch flex-row-reverse"><div class="d-flex"><button id="save_wallet" class="btn btn-sm btn-primary ps-3 pe-3 d-flex align-items-center" data-id="'+id+'"><span class="icon icon-left icon-large icon-save"></span> Save</button></div></div>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="modal" class="modal">';
        n=n+'<div class="modal-dialog">';
            n=n+'<div class="modal-content">';
                n=n+'<div class="modal-header modal-header-danger"><h3 class="modal-title w-100 text-white text-center">Are you sure?</h3></div>';
                n=n+'<div class="modal-body">';
                    n=n+'<h4 class="text-center">'+account.name+'</h4>';
                    n=n+'<p class="text-center text-gray text-small mb-4">'+account.address+'</p>';
                    n=n+'<p class="text-center text-gray text-small">This action cannot be undone. Ensure you have the secret phrase for this wallet backed up securely.</p>';
                n=n+'</div>';
                n=n+'<div class="modal-footer justify-content-center">';
                    n=n+'<button id="confirm_delete_wallet" type="button" class="btn btn-sm btn-danger d-flex align-items-center" data-id="'+id+'"><span class="icon icon-left icon-trash icon-large"></span> Yes, delete</button>';
                    n=n+'<button id="hide_modal" type="button" class="btn btn-sm btn-text btn-bordered">Cancel</button>';
                n=n+'</div>';
            n=n+'</div>';
        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", manage_accounts);
    document.getElementById("wallet_name").addEventListener("input", function() {
        if(document.getElementById("wallet_name").value.length === 0) {
            document.getElementById("save_wallet").classList.add('disabled')
            document.getElementById("save_wallet").classList.remove('btn-primary')
        } else {
            document.getElementById("save_wallet").classList.add('btn-primary')
            document.getElementById("save_wallet").classList.remove('disabled')
        }
    });
    document.getElementById("save_wallet").addEventListener("click", function() {
        let id = this.dataset.id;
        let name = DOMPurify.sanitize(document.getElementById("wallet_name").value);

        let account_data = JSON.parse(localStorage.getItem("account_" + id));
        account_data.name = name;

        localStorage.setItem("account_" + id, JSON.stringify(account_data));

        manage_account(id)
    });
    if(id !== 0) {
        document.getElementById("delete_wallet").addEventListener("click", function () {
            document.getElementById("modal").classList.add('fade')
            document.getElementById("modal").classList.add('show')
        });
    }
    document.getElementById("hide_modal").addEventListener("click", function() {
        document.getElementById("modal").classList.remove('fade')
        document.getElementById("modal").classList.remove('show')
    });
    document.getElementById("confirm_delete_wallet").addEventListener("click", async function() {
        let id = this.dataset.id;

        localStorage.removeItem("account_"+id)
        localStorage.removeItem("account_transactions_"+id)

        await refresh_account()

        manage_accounts();
    })
}
function new_account() {
    hide_header();
    hide_footer();

    let n='<div id="full_page">';
        n=n+'<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Create Account</h3></div>';
        n=n+'<div class="content">';
            n=n+'<h2>Set up your new account</h2>';
            n=n+'<p class="text-gray pb-2">Confirm your wallet password in order to create new account.</p>';
            n=n+'<label class="label text-dark">Password</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon icon-password"></span></span><input id="password" type="password" class="form-control" placeholder="Wallet Password"></div></div>';
            n=n+'<label class="label text-dark mt-3">Name</label><div class="form-group"><div class="input-group"><span class="input-group-text bigger"><span class="icon icon-pen"></span></span><input id="wallet_name" type="text" class="form-control" placeholder="Account Name"></div></div>';
            n=n+'<div class="footer d-flex align-items-sketch flex-row-reverse">';
                n=n+'<div class="d-flex"><button id="store_account" class="btn btn-sm btn-primary ps-3 pe-3">Continue <span class="icon icon-right-arrow"></span></button></div>';
            n=n+'</div>';
        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", manage_accounts);
    document.getElementById("store_account").addEventListener("click", store_account);
}
async function store_account() {
    const password = DOMPurify.sanitize(document.getElementById("password").value);
    const name = DOMPurify.sanitize(document.getElementById("wallet_name").value);

    // first decrypt main account
    let mnemonic = await decrypt_wallet(password, true);
    if(mnemonic) {
        let k = new keyring.Keyring({type: 'sr25519'});

        for(let i = 1; i <= 99; i++) {
            if (!localStorage.getItem("account_" + i)) {
                current_account_id = i;
                break;
            }
        }

        keyspairv = k.addFromUri(mnemonic + '//' + current_account_id, {name: ''}, 'sr25519');

        // store encrypted data
        localStorage.setItem("account_" + current_account_id, JSON.stringify({
            "address": keyspairv.address,
            "name": name
        }));

        await set_account(current_account_id);

        finish_keys();
    } else {
        if(notification) {
            notification.hideToast()
        }
        notification = Toastify({
            text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon icon-alert"></span></div><div class="col-10">Password is wrong!</div></div>',
            offset: {
                y: 50
            },
            duration: 3000,
            className: 'notification notification-error',
            close: false,
            stopOnFocus: false,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            escapeMarkup: false,
            onClick: function(){
                notification.hideToast()
            }
        }).showToast();
    }
}
async function load_account(password = false) {
    let stored_password = await get_password();

    password = password !== false ? password : stored_password;

    if(!password) {
        return false;
    }

    let mnemonic = await decrypt_wallet(password, true);
    if(mnemonic) {
        if(current_account_id > 0) {
            mnemonic = mnemonic + '//' + current_account_id;
        }

        keyringv = new keyring.Keyring({type: 'sr25519'});
        try {
            keyspairv = keyringv.addFromUri(mnemonic, {name: ''}, 'sr25519');
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    } else {
        keyringv = false;
        keyspairv = '';

        return false;
    }
}
// Manage custom networks
function manage_networks(){
    hide_header();
    show_footer();

    let n='<div id="heading" class="custom-header">';
        n=n+'<div class="heading d-flex align-items-center">';
            n=n+'<span id="goback" class="icon icon-left-arrow click"></span>';
            n=n+'<div class="col w-100 d-flex flex-row-reverse"><button id="add_custom_rpc_network" type="button" class="btn btn-primary btn-sm ps-2 pe-3"><span class="icon icon-plus me-2"></span> New</button></div>';
        n=n+'</div>';
        n=n+'<div class="content row">';
            n=n+'<h1 class="text-center text-white">Manage custom networks</h1>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content">';
        n=n+'<div id="wallet_list">';
            let total_found = 0
            for(let i = 1; i <= 99; i++) {
                let network = JSON.parse(localStorage.getItem("custom_rpc_network_"+i));
                if(network) {
                    total_found++;

                    n=n+'<div class="button-item d-flex align-items-center" data-id="'+i+'">';
                        n=n+'<span class="icon icon-network text-center"></span>';
                        n=n+'<div class="col"><h4 class="m-0">'+network.name+'</h4><p class="text-gray m-0 w-75">'+network.url+'</p></div>';
                        n=n+'<span class="icon icon-right-arrow text-center"></span>';
                    n=n+'</div>';
                }
            }
            if(total_found === 0) {
                n=n+'<h3>No custom networks created.</h3>'
            }
        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", settings);
    document.getElementById("add_custom_rpc_network").addEventListener("click", manage_network);
    document.querySelectorAll("#bordered_content .button-item").forEach(w => {
        w.addEventListener("click", function(e) {
            manage_network(e, this.dataset.id);
        }, false)
    })
}
function manage_network(e, network_id = null) {
    hide_header();
    hide_footer();

    let network = {
        name: '',
        url: ''
    };

    if(network_id) {
        network = JSON.parse(localStorage.getItem("custom_rpc_network_"+network_id));
    }

    let n='<div id="full_page">';
        n=n+'<div class="heading equal-padding d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>'+(network_id ? "Edit Custom Network" : "Add Custom Network")+'</h3><button id="delete_network" type="button" class="btn btn-sm btn-danger '+(network_id ? "" : "opacity-0 disabled")+'"><span class="icon icon-trash m-0 me-1 ms-1"></span></span></button></div>';
        n=n+'<div class="content">';
            n=n+'<div class="alert alert-danger d-flex align-items-stretch"><div class="icon d-flex align-items-center"><span class="icon-alert"></span></div><p class="w-100 m-0 p-2">Some networks are malicious and may be deceitful about the state of the blockchain, whilst also tracking your activity. Only add networks that you trust.</p></div>';
            n=n+'<label class="label text-dark mt-3">Network name</label><div class="form-group"><div class="input-group"><span class="input-group-text bigger"><span class="icon icon-network"></span></span><input id="network_name" type="text" class="form-control" placeholder="Name" value="'+network.name+'"></div></div>';
            n=n+'<label class="label text-dark mt-3">RPC URL</label><div class="form-group"><div class="input-group"><span class="input-group-text bigger"><span class="icon icon-globe"></span></span><input id="network_url" type="text" class="form-control" placeholder="URL" value="'+network.url+'"></div></div>';
            if(!network_id) {
                n=n+'<div class="form-check form-switch d-flex align-items-center">';
                    n=n+'<input class="form-check-input" type="checkbox" role="switch" id="switch_to_this" checked="checked">';
                    n=n+'<label class="form-check-label d-flex align-items-center" for="switch_to_this"><h5 class="m-0">Switch to this network upon saving</h5></label>';
                n=n+'</div>';
            } else {
                n=n+'<input type="hidden" id="switch_to_this" value="off">';
            }
            n=n+'<div class="footer d-flex align-items-sketch flex-row-reverse"><div class="d-flex"><button id="save_network" class="btn btn-sm disabled ps-3 pe-3 d-flex align-items-center">Save network <span class="icon icon-large icon-right-arrow"></span></button></div></div>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="modal" class="modal">';
        n=n+'<div class="modal-dialog">';
            n=n+'<div class="modal-content">';
                n=n+'<div class="modal-header modal-header-danger"><h3 class="modal-title w-100 text-white text-center">Are you sure?</h3></div>';
                n=n+'<div class="modal-body">';
                    n=n+'<h4 class="text-center">'+network.name+'</h4>';
                    n=n+'<p class="text-center text-gray text-small mb-4">'+network.url+'</p>';
                    n=n+'<p class="text-center text-gray text-small">This action cannot be undone.</p>';
                n=n+'</div>';
                n=n+'<div class="modal-footer justify-content-center">';
                    n=n+'<button id="confirm_delete_network" type="button" class="btn btn-sm btn-danger d-flex align-items-center" data-id="'+network_id+'"><span class="icon icon-left icon-trash icon-large"></span> Yes, delete</button>';
                    n=n+'<button id="hide_modal" type="button" class="btn btn-sm btn-text btn-bordered">Cancel</button>';
                n=n+'</div>';
            n=n+'</div>';
        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;

    check_network();

    document.getElementById("goback").addEventListener("click", manage_networks);
    document.getElementById("network_name").addEventListener("input", check_network);
    document.getElementById("network_url").addEventListener("input", check_network);
    document.getElementById("save_network").addEventListener("click", async function() {
        if(!network_id) {
            for (let i = 1; i <= 99; i++) {
                if (!localStorage.getItem("custom_rpc_network_" + i)) {
                    network_id = i;
                    break;
                }
            }
        }
        network.name = DOMPurify.sanitize(document.getElementById("network_name").value)
        network.url = DOMPurify.sanitize(document.getElementById("network_url").value)

        localStorage.setItem("custom_rpc_network_" + network_id, JSON.stringify(network));

        if(document.getElementById("switch_to_this").value === 'on') {
            localStorage.setItem("selected_network", "custom_rpc_network_"+network_id);

            await set_network();
        }

        manage_networks();
    });
    document.getElementById("delete_network").addEventListener("click", function() {
        document.getElementById("modal").classList.add('fade')
        document.getElementById("modal").classList.add('show')
    });
    document.getElementById("hide_modal").addEventListener("click", function() {
        document.getElementById("modal").classList.remove('fade')
        document.getElementById("modal").classList.remove('show')
    });
    document.getElementById("confirm_delete_network").addEventListener("click", function() {
        let network_id = this.dataset.id;

        localStorage.removeItem("custom_rpc_network_"+network_id)

        manage_networks();
    })

    anime({
        targets: '.icon-alert',
        scale: [1, 0.8, 1.2, 1],
        easing: 'easeInOutSine',
        duration: 1600,
        delay: 200,
    });
}
function check_network() {
    if(document.getElementById("network_name").value.length === 0 || document.getElementById("network_url").value.length === 0 || !isValidWssUrl(document.getElementById("network_url").value)) {
        document.getElementById("save_network").classList.add('disabled')
        document.getElementById("save_network").classList.remove('btn-primary')
    } else {
        document.getElementById("save_network").classList.add('btn-primary')
        document.getElementById("save_network").classList.remove('disabled')
    }
}
function isValidWssUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "ws:" || url.protocol === "wss:";
}
// function to open a new tab to contact the support
function contactsupport(){
  window.open("https://bitgreen.org/contact");
}
// function to set new account and return to dashboard
async function set_account(account_id, show_next = '', data = {}){
    localStorage.setItem("current_account_id", account_id);

    current_account_id = account_id;

    await load_account()

    await refresh_account();
    await get_balances();

    if(show_next === 'transactions_history') {
        await transactions_history()
    } else if(show_next === 'send') {
        await send(data.recipient, data.amount)
    } else if(show_next === 'receive') {
        await receive()
    } else if(show_next === 'signin') {
        await signin(data.domain)
    } else {
        await dashboard();
    }
}
// function to show the form for sending funds (init)
let transaction_amount = 0
let transaction_recipient = ''
async function send(recipient = '', amount = 0) {
    await show_header('send', {
        recipient: recipient,
        amount: amount,
    });
    show_footer('send');

    if(typeof recipient !== 'string') {
        recipient = ''
        amount = 0
    }

    if(!keyringv && recipient === '' && amount === 0) {
        show_login(true);
    }

    amount = new Intl.NumberFormat('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4}).format(amount);

    transaction_amount = amount
    transaction_recipient = recipient

    let n='<div id="heading">';
        n=n+'<div class="content row">';
            n=n+'<h1 class="text-center text-white">Send</h1>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content">';
        n=n+'<h4 class="mb-0">From ('+((current_account.name && current_account.name.length > 14) ? current_account.name.substring(0,14)+'...' : current_account.name)+')</h4>';
        n=n+'<p class="text-gray" style="font-size: 13px;">'+current_account.address+'</p>';
        n = n + '<div id="choose_token" class="d-flex align-items-sketch"><span class="icon icon-b-circle"></span><div class="col d-flex align-items-center"><span class="name">BBB Token</span></div></div>';
        n = n + '<label class="label text-dark">Amount</label><div id="choose_quantity" class="d-flex mb-3"><div class="col-4"><div class="form-group"><input id="amount" type="number" class="form-control" value="'+amount+'"></div></div><div class="col-8"><div class="w-100 text-gray d-flex flex-row-reverse"><span>'+balancevf+' Available</span></div><input id="range" type="range" min="0" max="'+balancev+'" step="0.0001" value="'+amount+'"></div></div>';
        n = n + '<label class="label text-dark">Recipient</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon icon-wallet" style="font-size: 18px;"></span></span><input id="recipient" type="text" class="form-control" placeholder="Address" value="'+recipient+'"><span class="input-group-text p-0"><button id="paste" type="button" class="btn btn-secondary"><span class="icon icon-copy m-0"></span></button></span></div></div>';
        n = n + '<div class="footer double-footer d-flex align-items-sketch flex-row-reverse">';
            n = n + '<div class="d-flex"><button id="go_review_transaction" class="btn disabled ps-3 pe-3">Review <span class="icon icon-right-arrow"></span></button></div>';
        n = n + '</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("range").addEventListener("input", sync_amount);
    document.getElementById("amount").addEventListener("input", sync_amount);
    document.getElementById("recipient").addEventListener("input", check_address);
    document.getElementById("paste").addEventListener("click", paste_recipient);
    document.getElementById("go_review_transaction").addEventListener("click", review_transaction);

    check_address();
    sync_amount();
}
function sync_amount(e) {
    let amount = 0;
    let range_el = document.getElementById("range")
    let amount_el = document.getElementById("amount")

    if(e && e.path[0].id === 'range') {
        amount = new Intl.NumberFormat('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4}).format(range_el.value);
        amount_el.value = amount.replace(',', '')
    } else {
        amount = new Intl.NumberFormat('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4}).format(amount_el.value);
        range_el.value = amount
    }

    if(parseFloat(amount) > balancev) {
        amount = new Intl.NumberFormat('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4}).format(balancev);
        amount_el.value = amount
        range_el.value = amount
    }

    // update color
    let value = (range_el.value-range_el.min)/(parseFloat(range_el.max.replace(',', ''))-range_el.min)*100
    range_el.style.background = 'linear-gradient(to right, #C0FF00 0%, #C0FF00 ' + value + '%, #F8F8F9 ' + value + '%, #F8F8F9 100%)'

    check_address()
}
function check_address() {
    let amount_el = document.getElementById("amount")

    if(parseFloat(amount_el.value) > 0) {
        let address = document.getElementById("recipient").value
        try {
            keyring.encodeAddress(
                util.isHex(address)
                    ? util.hexToU8a(address)
                    : keyring.decodeAddress(address)
            );

            transaction_recipient = address
            transaction_amount = amount_el.value

            document.getElementById("go_review_transaction").classList.remove('disabled')
            document.getElementById("go_review_transaction").classList.add('btn-primary')
            return true;
        } catch (error) {
            document.getElementById("go_review_transaction").classList.remove('btn-primary')
            document.getElementById("go_review_transaction").classList.add('disabled')
            return false;
        }
    } else {
        document.getElementById("go_review_transaction").classList.remove('btn-primary')
        document.getElementById("go_review_transaction").classList.add('disabled')
    }


}
async function paste_recipient() {
    let address = await navigator.clipboard.readText()
    let notification_class = 'notification notification-success'
    let notification_icon = 'icon-success'
    let notification_text = 'Recipient\'s address pasted successfully.'

    try {
        keyring.encodeAddress(
            util.isHex(address)
                ? util.hexToU8a(address)
                : keyring.decodeAddress(address)
        );

        document.getElementById("recipient").value = DOMPurify.sanitize(address)
    } catch (error) {
        notification_class = 'notification notification-error'
        notification_icon = 'icon-alert'
        notification_text = 'Please enter a valid recipient address.'
    }

    check_address();

    if(notification) {
        notification.hideToast()
    }
    notification = Toastify({
        text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon '+notification_icon+'"></span></div><div class="col-10">'+notification_text+'</div></div>',
        offset: {
            y: 40
        },
        duration: 3000,
        className: notification_class,
        close: false,
        stopOnFocus: false,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        escapeMarkup: false,
        onClick: function(){
            notification.hideToast()
        }
    }).showToast();
}
// function to preview the form for sending funds
function review_transaction() {
    hide_header();
    hide_footer();

    let formatted_amount = new Intl.NumberFormat('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4}).format(transaction_amount).split('.')
    let total_value = new Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(transaction_amount*2.67).split('.')
    let estimated_fees = new Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(transaction_amount*2.65*0.046).split('.')

    let n = '<div id="full_page">';
    n = n + '<div class="heading d-flex align-items-center"><span id="goback" class="icon icon-left-arrow click"></span><h3>Review transaction</h3></div>';
    n = n + '<div class="content">';
    n = n + '<div id="review_transaction" class="d-flex">';
        n = n + '<div class="token col-4 align-items-center justify-content-center">';
            n = n + '<div class="w-100 d-flex align-items-center justify-content-center"><span class="amount">'+formatted_amount[0]+'</span><span class="decimals">.'+formatted_amount[1]+'</span></div>';
            n = n + '<div class="title w-100 text-center">BBB</div>';
        n = n + '</div>';
        n = n + '<div class="col-4 align-items-center justify-content-center">';
            n = n + '<div class="w-100 d-flex align-items-center justify-content-center"><span class="dollar">$</span><span class="amount">'+total_value[0]+'</span><span class="decimals">.'+total_value[1]+'</span></div>';
            n = n + '<div class="title w-100 text-center">TOTAL VALUE</div>';
        n = n + '</div>';
        n = n + '<div class="estimated_fees col-4 align-items-center justify-content-center">';
            n = n + '<div class="w-100 d-flex align-items-center justify-content-center"><span class="dollar">$</span><span class="amount">'+estimated_fees[0]+'</span><span class="decimals">.'+estimated_fees[1]+'</span></div>';
            n = n + '<div class="title w-100 text-center">EST. FEES</div>';
        n = n + '</div>';
    n = n + '</div>';
    n = n + '<div id="transaction_info">';
        n = n + '<div class="wallet w-100 d-flex align-items-center">';
            n = n + '<div class="col-1 d-flex justify-content-center"><span class="dot dot-green"></span></div>';
            n = n + '<div class="right col-11">';
                n = n + '<h3 class="mb-1">From ('+(current_account.name.length > 14 ? current_account.name.substring(0,14)+'...' : current_account.name)+')</h3>';
                n = n + '<span class="address text-gray">'+current_account.address+'</span>';
            n = n + '</div>';
        n = n + '</div>';
        n = n + '<div class="wallet w-100 d-flex align-items-center">';
            n = n + '<div class="col-1 d-flex justify-content-center"><span class="dot"><span class="dot-line"></span></span></div>';
            n = n + '<div class="right col-11">';
                n = n + '<h3 class="mb-1">Recipient</h3>';
                n = n + '<span class="address text-gray">'+transaction_recipient+'</span>';
            n = n + '</div>';
        n = n + '</div>';
    n = n + '</div>';
    n = n + '<div class="footer d-flex align-items-sketch flex-row-reverse">';
        n = n + '<div class="w-100"><label class="label text-dark">Enter your password to approve this transaction</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon icon-password"></span></span><input id="password" type="password" class="form-control" placeholder="Wallet Password"><span class="input-group-text p-0"><button id="approve_transaction" type="button" class="btn btn-primary">Approve <span class="icon icon-right-arrow"></span></button></span></div></div></div>';
    n = n + '</div>';
    n = n + '</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("goback").addEventListener("click", async function() {
        await send(transaction_recipient, transaction_amount)
    });
    document.getElementById("approve_transaction").addEventListener("click", transferfunds);
    document.getElementById("password").addEventListener("keypress", async function(e) {
        if (e.key === "Enter") {
            await transferfunds()
        }
    });
}
async function receive() {
    await show_header('receive');
    show_footer('receive');

    let n='<div id="heading">';
        n=n+'<div class="content row">';
            n=n+'<h1 class="text-center text-white">Receive or deposit</h1>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content">';
        n=n+'<div class="d-flex align-items-center justify-content-center">';
            n=n+'<div id="qrcode"></div>';
            n=n+'<div class="col text-center">';
                n=n+'<button id="copy_qrcode" class="btn btn-text"><span class="icon icon-left icon-copy"></span> Copy QR</button>';
            n=n+'</div>';
        n=n+'</div>';
        n = n + '<label class="label text-dark">Wallet Address</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon icon-wallet" style="font-size: 18px;"></span></span><input type="text" class="form-control" value="'+current_account.address+'" disabled><span class="input-group-text p-0"><button id="copy_address" type="button" class="btn btn-secondary"><span class="icon icon-copy m-0"></span></button></span></div></div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;

    document.getElementById("copy_qrcode").addEventListener("click", copy_address);
    document.getElementById("copy_address").addEventListener("click", copy_address);

    new QRCode(document.getElementById("qrcode"), {
        text: current_account.address,
        width: 160,
        height: 160,
        colorDark : "#061C00",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
}
async function copy_address() {
    await navigator.clipboard.writeText(current_account.address);

    if(notification) {
        notification.hideToast()
    }
    notification = Toastify({
        text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon icon-alert"></span></div><div class="col-10">Account copied to clipboard.</div></div>',
        offset: {
            y: 40
        },
        duration: 3000,
        className: 'notification notification-info',
        close: false,
        stopOnFocus: false,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        escapeMarkup: false,
        onClick: function(){
            notification.hideToast()
        }
    }).showToast();
}
// function to show the form to sign-in
function signin(domain) {
    show_header('signin', {
        domain: domain
    });
    hide_footer();

    let n='<div id="heading">';
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
        n=n+'<div class="footer flex-row-reverse">';
            n=n+'<div class="w-100"><label class="label text-dark">Enter your password to approve this transaction</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon icon-password"></span></span><input id="password" type="password" class="form-control" placeholder="Wallet Password"><span class="input-group-text p-0"><button id="execute_sign_in" type="button" class="btn btn-sm btn-primary">Approve <span class="icon icon-right-arrow"></span></button></span></div></div></div>';
            n=n+'<div class="w-100"><div class="w-100 text-center"><button id="deny_sign_in" type="button" class="btn btn-sm btn-error"><span class="icon icon-close"></span> Deny request</button></div></div>';
        n=n+'</div>';
    n=n+'</div>';

    document.getElementById("root").innerHTML = n;
    document.getElementById("execute_sign_in").addEventListener("click", signinexecute);
    document.getElementById("deny_sign_in").addEventListener("click", dashboard);
    document.getElementById("password").addEventListener("keypress", async function(e) {
        if (e.key === "Enter") {
            await signinexecute()
        }
    });
}
// function to show the form to submit an extrinsic
async function extrinsic(pallet, call, parameters, domain, id) {
    let parameters_hex = await stringToHex(parameters);

    await show_header('extrinsic', {
        pallet: pallet,
        call: call,
        parameters: parameters,
        domain: domain,
        id: id
    });
    hide_footer();

    let n='<div id="heading">';
        n=n+'<div class="content row">';
            n=n+'<h1 class="text-center text-white">Confirm Transaction</h1>';
        n=n+'</div>';
    n=n+'</div>';

    n=n+'<div id="bordered_content">';
        n=n+'<div id="app_info" class="d-flex align-items-center">';
            n=n+'<div class="left align-items-center">';
                n=n+'<span class="icon icon-known"></span>';
                n=n+'<div class="message">Known App</div>';
            n=n+'</div>';
            n=n+'<div class="right align-items-center">';
                n=n+'<div class="app-name"><h3>Ecosystem Services Marketplace</h3></div>';
                n=n+'<p class="app-name">'+domain+'<input id="domain" type="hidden" value="'+domain+'"></p>';
            n=n+'</div>';
        n=n+'</div>';
        n=n+'<div class="button-item transaction-item" data-id="1">';
            n=n+'<div class="d-flex align-items-center">';
                n=n+'<span class="status">1</span>';
                n=n+'<div class="transaction-info d-flex align-items-center">';
                    n=n+'<div class="col align-items-center"><span class="d-block w-100 icon icon-cog"></span><span class="desc d-block w-100">'+pallet+'</span></div>';
                    n=n+'<div class="col align-items-center"><span class="d-block w-100 icon icon-add-plus"></span><span class="desc d-block w-100">'+call+'</span></div>';
                    // n=n+'<div class="col align-items-center"><span class="d-block w-100 amount">1</span><span class="desc d-block w-100">Project</span></div>';
                n=n+'</div>';
                n=n+'<span class="icon icon-right icon-down-arrow"></span>';
            n=n+'</div>';
            n=n+'<div class="transaction-details d-block w-100">';
                n=n+'<h4>'+call+'</h4>';
                n=n+'<p class="text-gray mt-2 mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quam massa consectetur elementum nullam morbi phasellus.</p>';
                // n=n+'<div class="element d-flex align-items-center"><div class="col-2 pe-3 text-center"><span class="icon icon-cog"></span></div><div class="col-7"><h4>Contract Interaction</h4></div></div>';
                n=n+'<div class="element d-flex align-items-center"><div class="col-2 pe-3 text-center"><span class="icon icon-code"></span></div><div class="col-7"><h4>Raw Request</h4></div></div>';
                n=n+'<div class="parameters d-flex text-gray text-small"><div class="col-2"></div><div class="col-10">'+parameters.substring(0,150)+'...</div></div>';
            n=n+'</div>';
            // n=n+'<div class="col"><h4 class="m-0">Hello</h4><p class="text-gray m-0 w-75">there</p></div>';
        n=n+'</div>';
        n=n+'<div class="footer flex-row-reverse pt-0 pb-0">';
            n=n+'<div class="alert alert-warning d-flex align-items-stretch mb-0"><div class="icon d-flex align-items-center"><span class="icon-warning"></span></div><p class="w-100 m-0 p-2">Review all queued transactions carefully as they will be executed automatically and sequentially.</p></div>';
            n=n+'<div class="w-100"><label class="label text-dark">Enter your password to approve this transaction</label><div class="form-group"><div class="input-group"><span class="input-group-text"><span class="icon icon-password"></span></span><input id="password" type="password" class="form-control" placeholder="Wallet Password"><span class="input-group-text p-0"><button id="approve_extrinsic" type="button" class="btn btn-sm btn-primary">Approve <span class="icon icon-right-arrow"></span></button></span></div></div></div>';
            n=n+'<div class="w-100"><div class="w-100 text-center"><button id="deny_extrinsic" type="button" class="btn btn-sm btn-error"><span class="icon icon-close"></span> Cancel</button></div></div>';
        n=n+'</div>';
    n=n+'</div>';

    current_extrinsic_id = id
    await refresh_extrinsic_status()

    document.getElementById("root").innerHTML = n;

    document.querySelectorAll("#bordered_content .transaction-item .transaction-info").forEach(t => {
        t.addEventListener("click", function(e) {
            if(t.parentElement.parentElement.classList.contains('active')) {
                t.parentElement.parentElement.classList.remove('active')
            } else {
                t.parentElement.parentElement.classList.add('active')
            }
        })
    })

    document.getElementById("approve_extrinsic").addEventListener("click", async function(e) {
        await approve_extrinsic(pallet, call, parameters);
    });
    document.getElementById("deny_extrinsic").addEventListener("click", async function(e) {
        await deny_extrinsic('denied');
        await dashboard();
    });
    document.getElementById("password").addEventListener("keypress", async function(e) {
        if (e.key === "Enter") {
            await approve_extrinsic(pallet, call, parameters);
        }
    });
}
// function to submit the extrinsic
async function approve_extrinsic(pallet, call, parameters) {
    const password = DOMPurify.sanitize(document.getElementById("password").value);
    parameters = JSON.parse(parameters);
    // try to decrypt and get keypairsv with the keys pair
    let r = await load_account(password);
    if(r === true) {
        if(command=="tx"){
            apiv.tx[pallet][call](...parameters).signAndSend(keyspairv, ({ status, events,dispatchError }) => {
                    console.log('Transaction status:', status.type);
                    if (status.isInBlock) {
                        // send answer back to the web app.
                        current_browser.runtime.sendMessage({
                            type: "BROWSER-WALLET",
                            command: "txpalletanswer",
                            message: JSON.stringify(status)
                        }, (response) => {
                            console.log('Txpallet - Sent Status', status);
                            //window.close();
                        });
                        console.log('Txpallet - Included at block hash', status.asInBlock.toHex());
                        console.log('Txpallet -Events:');
                        events.forEach(({ event: { data, method, section }, phase }) => {
                        console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                      });
                    } else if (status.isFinalized) {
                        console.log('Txpallet - Finalized block hash', status.asFinalized.toHex());
                    }
                    if (dispatchError) {
                        let err="";
                        const decoded = apiv.registry.findMetaError(dispatchError.asModule);
                        const { docs, name, section } = decoded;
                        if (dispatchError.isModule) {
                            err=`${section}.${name}: ${docs.join(' ')}`;
                        }
                        else{
                            err={"txerror": dispatchError.toString()};
                        }
                        // send answer back to the web app.
                        current_browser.runtime.sendMessage({
                            type: "BROWSER-WALLET",
                            command: "txpalletanswer",
                            message: JSON.stringify({"errror":err})
                        }, (response) => {
                            console.log('Received web page data', response);
                            //window.close();
                        });
                        
                    }
                  });
                  alert("The Transactions has been submitted to the blockchain, please check the result in the transaction history.");
                  await dashboard();    
        }
        else{
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
            await current_browser.runtime.sendMessage({
                type: "BROWSER-WALLET",
                command: "refresh_extrinsic",
                id: current_extrinsic_id,
                status: 'submitted'
            });
            current_extrinsic_id = null

            alert("The Transactions has been submitted to the blockchain, please check the result in the transaction history.");
            await dashboard();
        }
    } else {
        if(notification) {
            notification.hideToast()
        }
        notification = Toastify({
            text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon icon-alert"></span></div><div class="col-10">Password is wrong!</div></div>',            offset: {
                y: 40
            },
            duration: 3000,
            className: 'notification notification-error',
            close: false,
            stopOnFocus: false,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            escapeMarkup: false,
            onClick: function(){
                notification.hideToast()
            }
        }).showToast();
    }
}
async function refresh_extrinsic_status() {
    if(!current_extrinsic_id) {
        return false;
    }

    const result = await current_browser.runtime.sendMessage({
        type: "BROWSER-WALLET",
        command: "refresh_extrinsic",
        id: current_extrinsic_id
    });

    if(result) {
        setTimeout(async function() {
            await refresh_extrinsic_status()
        }, 350);
    }
}
async function deny_extrinsic(status = 'expired') {
    if(current_extrinsic_id) {
        await current_browser.runtime.sendMessage({
            type: "BROWSER-WALLET",
            command: "refresh_extrinsic",
            id: current_extrinsic_id,
            status: status
        });
    }

    window.close();
}
// function to manage the staking of funds
async function staking(){
  let n='<br><center><h3>Main Account</h3>'+current_account.address.substring(0,4)+"..."+current_account.address.substring(current_account.length-4)+'<br>';
  n=n+'<hr>'
  n=n+'<div id="balance"><h1>'+balancevf+' BBB</h1></div>';
  n=n+"<hr>";
  //n=n+"<h3>Staking</h3>"
  // get amount bonded
  let bondamount= await get_amount_bonded(current_account);
  let nominator='';
  if(bondamount>0){
    nominator= await get_nominator(current_account);
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
  if(localStorage.getItem("webwallet"+current_account_id)){
    encrypted=localStorage.getItem("webwallet"+current_account_id);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=decrypt_wallet(encrypted,password);
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
        await dashboard();
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
  let amount= await get_amount_bonded(current_account);
  let password=document.getElementById("inputPassword").value;
  let encrypted='';
  // read the encrypted storage
  if(localStorage.getItem("webwallet"+current_account_id)){
    encrypted=localStorage.getItem("webwallet"+current_account_id);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=decrypt_wallet(encrypted,password);
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
        await dashboard();
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
  if(localStorage.getItem("webwallet"+current_account_id)){
    encrypted=localStorage.getItem("webwallet"+current_account_id);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=decrypt_wallet(encrypted,password);
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
        await dashboard();
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
  if(localStorage.getItem("webwallet"+current_account_id)){
    encrypted=localStorage.getItem("webwallet"+current_account_id);
  }
  if(encrypted.length==0){
    alert("The account has not a valid storage, please remove the extension and re-install it.");
  }else{
    // try to decrypt and get keypairsv with the keys pair
    let r=decrypt_wallet(encrypted,password);
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
        await dashboard();
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
async function transferfunds() {
    hide_header();
    hide_footer();

    let notification_message = null;
    let accountrecipient = transaction_recipient
    let amount = transaction_amount
    let password = DOMPurify.sanitize(document.getElementById("password").value);

    let n = '<div id="full_page">';
    n = n + '<div class="content full-content">';
    n = n + '<div id="success_icon" class="text-center w-100 text-green mt-3"><span class="icon-huge icon-success"></span></div>';
    n = n + '<h1 id="heading_text" class="text-center">Successfully sent</h1>';
    n = n + '<p id="message_text" class="text-center text-gray mb-5">Your transaction has been sent to the network.</p>';
    n = n + '<div id="transaction_info">';
        n = n + '<div class="wallet w-100 d-flex align-items-center">';
            n = n + '<div class="col-1 d-flex justify-content-center"><span class="dot"></span></div>';
            n = n + '<div class="right col-11">';
                n = n + '<h3 class="mb-1">From ('+(current_account.name.length > 14 ? current_account.name.substring(0,14)+'...' : current_account.name)+')</h3>';
                n = n + '<span class="address text-gray">'+current_account.address+'</span>';
            n = n + '</div>';
        n = n + '</div>';
        n = n + '<div class="wallet w-100 d-flex align-items-center">';
            n = n + '<div class="col-1 d-flex justify-content-center"><span class="dot dot-green"><span class="dot-line"></span></span></div>';
            n = n + '<div class="right col-11">';
                n = n + '<h3 class="mb-1">Recipient</h3>';
                n = n + '<span class="address text-gray">'+transaction_recipient+'</span>';
            n = n + '</div>';
        n = n + '</div>';
    n = n + '</div>';
    n = n + '<p class="text-center mt-5"><button id="another_transaction" type="button" class="btn btn-secondary me-2">New transaction</button><button id="gotodashboard" type="button" class="btn btn-primary">Finish</button></p>';
    n = n + '</div>';
    n = n + '</div>';

    // try to decrypt and get keypairsv with the keys pair
    let r = await load_account(password);
    if(r === true) {
        const amountb = BigInt(parseInt(parseFloat(amount)*10000))*100000000000000n;
        let txhash="";
        /*
        if(command=="transfer"){
            txhash= await apiv.tx.balances.transfer(accountrecipient, amountb)
            .signAndSend(keyspairv, { nonce: -1 });
            // send message back to the background.js
            // send txhash back to the caller
            current_browser.runtime.sendMessage({
                type: "BROWSER-WALLET",
                command: "transferanswer",
                message: '{"txhash":"'+txhash+'"}',
            }, (response) => {
                console.log('Received web page data', response);
                //window.close();
            });
        }*/
        if(command=="transfer"){
            txhash= await apiv.tx.balances.transfer(accountrecipient, amountb)
            .signAndSend(keyspairv, { nonce: -1 }, ({ events = [], status }) => {
                    console.log('Transaction status:', status.type);
                    if (status.isInBlock) {
                        // send answer back to the web app.
                        current_browser.runtime.sendMessage({
                            type: "BROWSER-WALLET",
                            command: "transferanswer",
                            message: JSON.stringify(status)
                        }, (response) => {
                            console.log('Received web page data', response);
                            //window.close();
                        });
                      console.log('Included at block hash', status.asInBlock.toHex());
                      console.log('Events:');
                      events.forEach(({ event: { data, method, section }, phase }) => {
                        console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                      });
                    } else if (status.isFinalized) {
                        console.log('Finalized block hash', status.asFinalized.toHex());
                        
                    }
                  });         
        }
        else{
            apiv.tx.balances.transfer(accountrecipient, amountb)
                .signAndSend(keyspairv, ({ status, events }) => {
                    if (status.isInBlock || status.isFinalized) {
                        events
                        // find/filter for failed events
                        .filter(({ event }) =>
                            apiv.events.system.ExtrinsicFailed.is(event)
                        )
                        // we know that data for system.ExtrinsicFailed is
                        .forEach(({ event: { data: [error, info] } }) => {
                            if (error.isModule) {
                                // for module errors, we have the section indexed, lookup
                                const decoded = apiv.registry.findMetaError(error.asModule);
                                const { docs, method, section } = decoded;

                                notification_message = `Error in transaction: ${section}.${method}: ${docs.join(' ')}`;
                            } else {
                                // Other, CannotLookup, BadOrigin, no extra info
                                notification_message = 'Error in transaction:'+error.toString();
                            }
                        });
                    }
                }
            );
        }
        
        

        // unloads account if password not saved
        await load_account();

        if(notification_message) {
            // something went wrong, display error and skip success screen
            return;
        }

        document.getElementById("root").innerHTML = n;
        document.getElementById("another_transaction").addEventListener("click", send);
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
            duration: 1000,
            delay: 1200
        });

        anime({
            targets: '#transaction_info',
            scale: [0.5, 1],
            opacity: [0, 1],
            easing: 'easeInOutSine',
            duration: 600,
            delay: 1600,
        });

        anime({
            targets: '#another_transaction',
            translateX: [-40, 0],
            opacity: [0, 1],
            easing: 'easeInOutSine',
            duration: 600,
            delay: 1600,
        });

        anime({
            targets: '#gotodashboard',
            translateX: [30, 0],
            opacity: [0, 1],
            easing: 'easeInOutSine',
            duration: 600,
            delay: 2000,
        });
    } else {
        notification_message = 'Password is wrong!';
    }

    if(notification_message) {
        if(notification) {
            notification.hideToast()
        }
        notification = Toastify({
            text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon icon-alert"></span></div><div class="col-10">'+notification_message+'</div></div>',
            offset: {
                y: 40
            },
            duration: 3000,
            className: 'notification notification-error',
            close: false,
            stopOnFocus: false,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            escapeMarkup: false,
            onClick: function(){
                notification.hideToast()
            }
        }).showToast();
    }
}
// function to execute the signin
async function signinexecute() {
    let notification_message = null;
    let password = DOMPurify.sanitize(document.getElementById("password").value);
    let domain = DOMPurify.sanitize(document.getElementById("domain").value);

    // try to decrypt and get keypairsv with the keys pair
    let r = await load_account(password);
    if (r === true) {
        // get current epoch time
        let dt = new Date();
        let timestamp = dt.getTime()
        let message = timestamp.toString() + "#" + domain;
        const signature = keyspairv.sign(util.stringToU8a(message));
        //const isValid = keyspairv.verify(util.stringToU8a(message), signature, keyspairv.publicKey);
        //const isValid=util_crypto.signatureVerify(util.stringToU8a(message), signature,keyspairv.address);
        //const hexsignature=util.u8aToHex(signature);
        //console.log(`signature ${util.u8aToHex(signature)} is ${isValid ? 'valid' : 'invalid'}`);
        // return connection token
        let cdt = new Date();
        cdt.setMonth(cdt.getMonth() + 1);
        let asw = {
            "message": message,
            "signature": util.u8aToHex(signature),
            "address": keyspairv.address,
            "publickey": util.u8aToHex(keyspairv.publicKey)
        };
        //console.log("keypairv.address: ",keyspairv.address);
        let asws = JSON.stringify(asw);
        //console.log("asws: ",asws);
        // Target the original caller

        current_browser.runtime.sendMessage({
            type: "BROWSER-WALLET",
            command: "signinanswer",
            message: asws
        }, (response) => {
            console.log('Received web page data', response);
            window.close();
        });
    } else {
        notification_message = 'Password is wrong!';
    }

    if(notification_message) {
        if(notification) {
            notification.hideToast()
        }
        notification = Toastify({
            text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon icon-alert"></span></div><div class="col-10">'+notification_message+'</div></div>',
            offset: {
                y: 40
            },
            duration: 3000,
            className: 'notification notification-error',
            close: false,
            stopOnFocus: false,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            escapeMarkup: false,
            onClick: function(){
                notification.hideToast()
            }
        }).showToast();
    }
}
async function encrypt_wallet(pwd) {
    // get ascii value of first 2 chars
    const vb1 = pwd.charCodeAt(0);
    const vb2 = pwd.charCodeAt(1);

    // position to derive other 3 passwords
    const p = vb1 * vb2;

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
        if (i === p) {
            dpwd1 = h;
        }
        h = util_crypto.sha512AsU8a(h);
        if (i === p) {
            dpwd2 = h;
        }
        h = util_crypto.blake2AsU8a(h);
        if (i === p) {
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
    let mnemonicbytes = aesjs.utils.utf8.toBytes(mnemonic);

    let encryptedaescfb = aesCfb.encrypt(mnemonicbytes);

    // encrypt the output of AES256-CFB in AES256-CTR
    let ivs = '';
    for (let i = 0; i < 16; i++) {
        ivs += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    const ivaesctr = aesjs.utils.utf8.toBytes(ivs);
    //const keyaes= aesjs.utils.utf8.toBytes(dpwd2.slice(0,32));
    const keyaesctr = dpwd2.slice(0, 32);
    let aesCtr = new aesjs.ModeOfOperation.ctr(keyaesctr, ivaesctr);
    let encryptedaesctr = aesCtr.encrypt(encryptedaescfb);

    // encrypt the output of AES256-CTR in AES256-OFB
    let ivso = '';
    for (let i = 0; i < 16; i++) {
        ivso += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const ivaesofb = aesjs.utils.utf8.toBytes(ivso);
    const keyaesofb = dpwd3.slice(0, 32);
    let aesOfb = new aesjs.ModeOfOperation.ofb(keyaesofb, ivaesofb);
    let encryptedaesofb = aesOfb.encrypt(encryptedaesctr);
    let encryptedhex = aesjs.utils.hex.fromBytes(encryptedaesofb);

    // convert to Hex json
    return {
        "iv": randomstring,
        "ivaescfb": util.u8aToHex(ivaescfb),
        "ivaesctr": util.u8aToHex(ivaesctr),
        "ivaesofb": util.u8aToHex(ivaesofb),
        "encrypted": encryptedhex
    };
}
// function to decrypt the web wallet and return a key pair
async function decrypt_wallet(pwd, mnemonic_only = false) {
    if (pwd.length < 2 || !pwd) {
        return false;
    }

    let encrypted = '';
    if(localStorage.getItem("wallet_data")) {
        encrypted = localStorage.getItem("wallet_data");
    } else {
        return false;
    }

    // get ascii value of first 2 chars
    const vb1 = pwd.charCodeAt(0);
    const vb2 = pwd.charCodeAt(1);

    // position to derive other 3 passwords
    const p = vb1 * vb2;

    // derive the password used for encryption with an init vector (random string) and 10000 hashes with 3 different algorithms
    const enc = JSON.parse(encrypted);
    let randomstring = enc.iv;
    let dpwd1 = '';
    let dpwd2 = '';
    let dpwd3 = '';
    let h = util_crypto.keccakAsU8a(pwd + randomstring);
    for (let i = 0; i < 100000; i++) {
        h = util_crypto.keccakAsU8a(h);
        if (i === p) {
            dpwd1 = h;
        }
        h = util_crypto.sha512AsU8a(h);
        if (i === p) {
            dpwd2 = h;
        }
        h = util_crypto.blake2AsU8a(h);
        if (i === p) {
            dpwd3 = h;
        }
    }

    // decrypt AES-OFB
    const ivaesofb = util.hexToU8a(enc.ivaesofb);
    const keyaesofb = dpwd3.slice(0, 32);
    let aesOfb = new aesjs.ModeOfOperation.ofb(keyaesofb, ivaesofb);
    const encryptedhex = enc.encrypted;
    const encryptedaesofb = aesjs.utils.hex.toBytes(encryptedhex);
    let encryptedaesctr = aesOfb.decrypt(encryptedaesofb);

    // decrypt AES-CTR
    const ivaesctr = util.hexToU8a(enc.ivaesctr);
    const keyaesctr = dpwd2.slice(0, 32);
    let aesCtr = new aesjs.ModeOfOperation.ctr(keyaesctr, ivaesctr);
    let encryptedaescfb = aesCtr.decrypt(encryptedaesctr);

    // decrypt AES-CFB
    const ivaescfb = util.hexToU8a(enc.ivaescfb);
    const keyaescfb = dpwd1.slice(0, 32);
    let aesCfb = new aesjs.ModeOfOperation.cfb(keyaescfb, ivaescfb);
    let decrypted = aesCfb.decrypt(encryptedaescfb);
    let decrypted_mnemonic = aesjs.utils.utf8.fromBytes(decrypted);

    if (!decrypted_mnemonic) {
        return false;
    } else {
        if(!util_crypto.mnemonicValidate(decrypted_mnemonic)) {
            return false;
        }

        if(mnemonic_only) {
            return decrypted_mnemonic;
        }

        return true;
    }
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
async function show_header(active = '', data = {}) {
    remove_notifications();
    await refresh_account();

    let header_el = document.getElementById("header");
    let accounts_modal_el = document.getElementById("accounts_modal");

    current_extrinsic_id = null

    let n=''
    n=n+'<div class="col-4 p-0">';
        n=n+'<svg id="top_logo" class="click" width="110" height="30" viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">';
            n=n+'<path d="M60.6852 16.2542C60.6852 7.90071 53.9055 1.18158 45.6125 1.18158H0.757812V76.5448H45.6125C53.966 76.5448 60.6852 69.7651 60.6852 61.4721C60.6852 57.1743 58.8087 53.0581 55.6004 50.1525C58.8087 47.3075 60.6852 43.1913 60.6852 38.8329C60.6852 34.5351 58.8087 30.4189 55.6004 27.5738C58.8692 24.6683 60.6852 20.6126 60.6852 16.2542ZM10.1404 8.74817H43.3123C47.4285 8.6271 50.8789 11.8959 50.9999 16.0121C51.121 20.1283 47.8522 23.5787 43.736 23.6997C43.615 23.6997 43.4334 23.6997 43.3123 23.6997H10.1404V8.74817ZM10.1404 31.3269H43.3123C47.4285 31.2058 50.8789 34.4746 50.9999 38.5908C51.121 42.707 47.8522 46.1574 43.736 46.2784C43.615 46.2784 43.4334 46.2784 43.3123 46.2784H10.1404V31.3269ZM43.3123 68.9177H10.1404V53.9661H43.3123C47.4285 53.9661 50.8183 57.2954 50.8183 61.4721C50.8183 65.5884 47.4891 68.9177 43.3123 68.9177Z" fill="white"/>';
            n=n+'<path d="M174.85 19.8862H183.93V76.6659C183.93 91.7385 176.545 100.455 155.964 100.455C139.075 100.455 129.995 93.0702 129.027 80.1768H137.985C138.651 87.6828 143.433 93.3123 156.024 93.3123C169.402 93.3123 174.971 88.6513 174.971 76.5448V64.3172C171.097 71.7022 164.075 75.3341 153.906 75.3341C136.109 75.3341 127.755 64.2567 127.755 46.7627C127.755 29.4504 136.169 18.3123 153.906 18.3123C164.196 18.3123 171.157 22.368 174.971 29.632L174.85 19.8862ZM174.85 46.7022C174.85 31.3874 167.949 25.3947 155.903 25.3947C143.01 25.3947 136.896 31.4479 136.896 46.7022C136.896 61.9564 143.01 68.1308 155.903 68.1308C167.949 68.1308 174.85 62.138 174.85 46.7022Z" fill="white"/>';
            n=n+'<path d="M225.274 19.0993V28.0581H222.913C206.145 27.5133 202.513 39.7409 202.513 55.7216V76.5448H193.434V19.8862H202.513V35.201C205.903 25.2131 212.501 19.0993 223.276 19.0993H225.274Z" fill="white"/>';
            n=n+'<path d="M272.065 59.0509H280.358C279.208 67.6465 272.671 78.3003 253.845 78.3003C234.353 78.3003 225.758 65.1647 225.758 48.0339C225.758 31.1453 235.08 18.0097 253.845 18.0097C270.855 18.0097 280.479 29.6925 280.479 46.2179C280.54 47.5497 280.419 48.8814 280.237 50.2131H234.656C235.322 65.7095 242.828 71.3995 254.148 71.3995C265.286 71.3995 270.37 66.1937 272.065 59.0509ZM234.898 43.4334H271.581C271.157 30.4189 264.438 24.971 253.906 24.971C243.191 24.971 236.169 30.0557 234.898 43.4334Z" fill="white"/>';
            n=n+'<path d="M333.082 59.0509H341.375C340.225 67.6465 333.688 78.3003 314.862 78.3003C295.371 78.3003 286.775 65.1647 286.775 48.0339C286.775 31.1453 296.097 18.0097 314.862 18.0097C331.872 18.0097 341.496 29.6925 341.496 46.2179C341.557 47.5497 341.436 48.8814 341.254 50.2131H295.734C296.4 65.7095 303.906 71.3995 315.225 71.3995C326.303 71.3995 331.387 66.1937 333.082 59.0509ZM295.976 43.4334H332.659C332.235 30.4189 325.516 24.971 314.983 24.971C304.208 24.971 297.187 30.0557 295.976 43.4334Z" fill="white"/>';
            n=n+'<path d="M400.758 40.4068V76.5448H391.678V41.4358C391.678 29.3293 386.351 25.6973 378.058 25.6973C365.468 25.6973 358.809 35.4431 358.809 54.9346V76.5448H349.729V19.8862H358.809V34.8378C362.441 23.9419 369.463 18.0702 380.54 18.0702C394.765 18.0702 400.758 25.7579 400.758 40.4068Z" fill="white"/>';
            n=n+'<path d="M70.8545 10.9879V1.60535H80.116V10.9274H70.8545V10.9879ZM70.8545 76.5448V20.2494H80.116V76.5448H70.8545Z" fill="white"/>';
            n=n+'<path d="M110.382 76.5448C99.3049 76.5448 96.3993 72.3681 96.3993 63.3487V27.2712H85.4429V20.1889H97.4283L97.6099 1.60535H105.6V20.1889H124.668V27.2712H105.6V69.1598H123.942V76.4843L110.382 76.5448Z" fill="white"/>';
        n=n+'</svg>';

    n=n+'</div>';
    n=n+'<div class="col-8 p-0 d-flex flex-row-reverse align-items-center">';
        n=n+'<span id="go_settings" class="icon-cog text-white click"></span>';
        if(current_account) {
            n=n+'<div id="current_wallet" class="d-flex align-items-center">';
                n=n+'<div class="identicon">'+jdenticon.toSvg(current_account.address, 30)+'</div>';
                n=n+'<div class="info"><span class="desc d-flex align-items-center">'+((current_account.name && current_account.name.length) > 14 ? current_account.name.substring(0,14)+'...' : current_account.name)+'</span><span><span class="icon-wallet-outline me-1"></span>'+current_account.address.substring(0,8)+'...'+current_account.address.substring(current_account.address.length-8)+'</span></div>';
                if(total_accounts > 1) {
                    n=n+'<span class="icon icon-down-arrow"></span>';
                }
            n=n+'</div>';
        }
    n=n+'</div>';

    let m = '';
    if(current_account && total_accounts > 1) {
        m=m+'<div class="modal-dialog">';
            m=m+'<div class="modal-content">';
                m=m+'<div class="modal-header modal-header-primary equal-padding">';
                    m=m+'<h2 class="modal-title w-100 text-white text-center">Change account</h2>';
                    m=m+'<button id="hide_accounts_modal" class="btn btn-text"><span class="icon-close"></span></button>';
                m=m+'</div>';
                m=m+'<div class="current-wallet modal-body modal-body-primary small-padding">';
                    m=m+'<h4 class="modal-title w-100 text-white text-center">'+((current_account.name && current_account.name.length > 14) ? current_account.name.substring(0,14)+'...' : current_account.name)+(current_account_id === 0 ? '<span class="badge badge-rounded badge-primary ms-2">Primary</span>' : '')+'</h4>';
                    m=m+'<p class="address w-100 text-white text-center m-0 mt-2"><span class="icon icon-wallet-outline me-2"></span>'+current_account.address.substring(0,12)+'...'+current_account.address.substring(current_account.address.length-8)+'<button id="c_copy_address" class="btn btn-text text-white p-0"><span class="icon icon-copy ms-2"></span></button></p>';
                m=m+'</div>';
                m=m+'<div class="modal-body">';
                    m=m+'<div id="wallet_list">';
                    for(let i = 0; i <= 99; i++) {
                        if(localStorage.getItem("account_"+i)) {
                            let account = JSON.parse(localStorage.getItem("account_"+i));
                            let is_main = i === 0;
                            let is_active = current_account_id === i;

                            m=m+'<div class="wallet button-item d-flex align-items-center" data-id="'+i+'">';
                                m=m+jdenticon.toSvg(account.address, 56);
                                m=m+'<div class="col"><h4 class="d-flex align-items-center mb-0">'+((account.name && account.name.length > 10) ? account.name.substring(0,10)+'...' : account.name)+(is_main ? '<span class="badge badge-rounded badge-primary ms-1">Primary</span>' : '')+(is_active ? '<span class="badge badge-rounded badge-secondary ms-1">Current</span>' : '')+'</h4><span class="d-block mt-1 text-gray text-small"><span class="icon-wallet-outline me-1"></span>'+account.address.substring(0,12)+'...'+account.address.substring(account.address.length-8)+'</span></div>';
                                m=m+'<span class="icon icon-arrow-right-2 text-center"></span>';
                            m=m+'</div>';
                        }
                    }
                    m=m+'</div>';
                m=m+'</div>';
                m=m+'<div class="modal-footer justify-content-center">';
                    m=m+'<button id="c_lock_wallet" type="button" class="btn btn-sm btn-primary">Lock wallet <span class="icon icon-password"></span></button>';
                    m=m+'<button id="c_manage_accounts" type="button" class="btn btn-sm btn-text">Manage accounts <span class="icon icon-right-arrow"></span></button>';
                m=m+'</div>';
            m=m+'</div>';
        m=m+'</div>';
    }

    header_el.innerHTML = n;
    accounts_modal_el.innerHTML = m;

    if(!header_el.classList.contains('visible')) {
        anime({
            targets: '#header',
            duration: 300,
            translateY: [-60, 0],
            opacity: 1,
            easing: 'linear',
            delay: !header_el.classList.contains('init') ? 800 : 0
        });
    }

    document.getElementById("go_settings").addEventListener("click", function() {
        settings(active, data);
    })

    if(active !== 'dashboard' && active !== 'wallet_create') {
        document.getElementById("top_logo").addEventListener("click", dashboard)
    }

    if(document.getElementById("current_wallet") && total_accounts > 1) {
        document.getElementById("current_wallet").addEventListener("click", function(e) {
            e.stopPropagation();
            if(document.getElementById("current_wallet").classList.contains('active')) {
                document.getElementById("current_wallet").classList.remove('active')

                accounts_modal_el.classList.remove('fade')
                accounts_modal_el.classList.remove('show')
            } else {
                if(total_accounts > 1) {
                    document.getElementById("current_wallet").classList.add('active')

                    accounts_modal_el.classList.add('fade')
                    accounts_modal_el.classList.add('show')
                }
            }
        })
        document.getElementById("hide_accounts_modal").addEventListener("click", function() {
            document.getElementById("current_wallet").classList.remove('active')

            accounts_modal_el.classList.remove('fade')
            accounts_modal_el.classList.remove('show')
        });
        document.getElementById("accounts_modal").addEventListener("click", function(e) {
            e.stopPropagation();
        });
        document.getElementById("c_manage_accounts").addEventListener("click", function() {
            document.getElementById("current_wallet").classList.remove('active')

            accounts_modal_el.classList.remove('fade')
            accounts_modal_el.classList.remove('show')

            manage_accounts();
        });
        document.getElementById("c_lock_wallet").addEventListener("click", async function() {
            document.getElementById("current_wallet").classList.remove('active')

            accounts_modal_el.classList.remove('fade')
            accounts_modal_el.classList.remove('show')

            show_login();
            setTimeout(dashboard, 800)

            keyringv = false;
            keyspairv = '';

            await current_browser.runtime.sendMessage({
                type: "BROWSER-WALLET",
                command: "lock_wallet"
            });
        });
        document.querySelectorAll("#accounts_modal .wallet").forEach(w => {
            w.addEventListener("click", function(e) {
                e.stopPropagation();
                set_account(this.dataset.id, active, data);
                document.getElementById("current_wallet").classList.remove('active')

                accounts_modal_el.classList.remove('fade')
                accounts_modal_el.classList.remove('show')
            }, false)
        })
        document.getElementById("c_copy_address").addEventListener("click", copy_address);
    }

    header_el.classList.add('visible')
    header_el.classList.add('init')
}
function hide_header(active = '') {
    remove_notifications();

    if(active !== 'extrinsic') {
        current_extrinsic_id = null
    }

    let header_el = document.getElementById("header");

    if(header_el.classList.contains('visible')) {
        anime({
            targets: '#header',
            duration: 300,
            translateY: [0, -60],
            opacity: [1, 0],
            easing: 'linear',
            delay: 0
        });
    }

    header_el.classList.remove('visible')
}
function show_footer(active = '', extend_delay = false) {
    remove_notifications();

    let footer_el = document.getElementById("main_footer");

    // hide footer if there is no account yet
    if(!current_account) {
        hide_footer();
        return;
    }

    let n='<div id="footer_go_dashboard" class="item d-flex align-items-center justify-content-center '+ (active === "dashboard" ? "active" : '') +'"><span class="icon icon-b"></span></div>';
        n=n+'<div id="footer_go_transactions" class="item d-flex align-items-center justify-content-center ms-2 me-2 '+ ((active === "send" || active === "receive") ? "active" : null) +'"><span class="icon icon-arrows"></span></div>';
        n=n+'<div id="footer_go_history" class="item d-flex align-items-center justify-content-center '+ (active === "transactions_history" ? "active" : '') +'"><span class="icon icon-history"></span></div>';

    footer_el.innerHTML = n;

    if(active !== 'dashboard') {
        document.getElementById("footer_go_dashboard").addEventListener("click", dashboard);
    }
    if(active !== 'transactions_history') {
        document.getElementById("footer_go_history").addEventListener("click", transactions_history);
    }
    if(active !== 'send' && active !== 'receive') {
        document.getElementById("footer_go_transactions").addEventListener("click", send);
    }

    if(!footer_el.classList.contains('visible')) {
        anime({
            targets: '#main_footer',
            duration: 300,
            translateY: [60, 0],
            opacity: 1,
            easing: 'linear',
            delay: extend_delay ? 800 : 0
        });
    }

    footer_el.classList.add('visible')
}
function hide_footer() {
    remove_notifications();

    let footer_el = document.getElementById("main_footer");

    if(footer_el.classList.contains('visible')) {
        anime({
            targets: '#main_footer',
            duration: 300,
            translateY: [0, 120],
            opacity: [1, 0],
            easing: 'linear',
            delay: 0
        });
    }

    footer_el.classList.remove('visible')
}
function remove_notifications() {
    if(notification) {
        notification.hideToast()
    }
}
let login_init = false;
function show_login(instant = false) {
    hide_init();

    if(!login_init) {
        let n='<svg class="bitgreen-svg" width="220" height="55" viewBox="0 0 400 100" fill="white" xmlns="http://www.w3.org/2000/svg">';
        n=n+'<path d="M60.6852 16.2542C60.6852 7.90071 53.9055 1.18158 45.6125 1.18158H0.757812V76.5448H45.6125C53.966 76.5448 60.6852 69.7651 60.6852 61.4721C60.6852 57.1743 58.8087 53.0581 55.6004 50.1525C58.8087 47.3075 60.6852 43.1913 60.6852 38.8329C60.6852 34.5351 58.8087 30.4189 55.6004 27.5738C58.8692 24.6683 60.6852 20.6126 60.6852 16.2542ZM10.1404 8.74817H43.3123C47.4285 8.6271 50.8789 11.8959 50.9999 16.0121C51.121 20.1283 47.8522 23.5787 43.736 23.6997C43.615 23.6997 43.4334 23.6997 43.3123 23.6997H10.1404V8.74817ZM10.1404 31.3269H43.3123C47.4285 31.2058 50.8789 34.4746 50.9999 38.5908C51.121 42.707 47.8522 46.1574 43.736 46.2784C43.615 46.2784 43.4334 46.2784 43.3123 46.2784H10.1404V31.3269ZM43.3123 68.9177H10.1404V53.9661H43.3123C47.4285 53.9661 50.8183 57.2954 50.8183 61.4721C50.8183 65.5884 47.4891 68.9177 43.3123 68.9177Z" fill="white"/>';
        n=n+'<path d="M70.8545 10.9879V1.60535H80.116V10.9274H70.8545V10.9879ZM70.8545 76.5448V20.2494H80.116V76.5448H70.8545Z" fill="white"/>';
        n=n+'<path d="M110.382 76.5448C99.3049 76.5448 96.3993 72.3681 96.3993 63.3487V27.2712H85.4429V20.1889H97.4283L97.6099 1.60535H105.6V20.1889H124.668V27.2712H105.6V69.1598H123.942V76.4843L110.382 76.5448Z" fill="white"/>';
        n=n+'<path d="M174.85 19.8862H183.93V76.6659C183.93 91.7385 176.545 100.455 155.964 100.455C139.075 100.455 129.995 93.0702 129.027 80.1768H137.985C138.651 87.6828 143.433 93.3123 156.024 93.3123C169.402 93.3123 174.971 88.6513 174.971 76.5448V64.3172C171.097 71.7022 164.075 75.3341 153.906 75.3341C136.109 75.3341 127.755 64.2567 127.755 46.7627C127.755 29.4504 136.169 18.3123 153.906 18.3123C164.196 18.3123 171.157 22.368 174.971 29.632L174.85 19.8862ZM174.85 46.7022C174.85 31.3874 167.949 25.3947 155.903 25.3947C143.01 25.3947 136.896 31.4479 136.896 46.7022C136.896 61.9564 143.01 68.1308 155.903 68.1308C167.949 68.1308 174.85 62.138 174.85 46.7022Z" fill="white"/>';
        n=n+'<path d="M225.274 19.0993V28.0581H222.913C206.145 27.5133 202.513 39.7409 202.513 55.7216V76.5448H193.434V19.8862H202.513V35.201C205.903 25.2131 212.501 19.0993 223.276 19.0993H225.274Z" fill="white"/>';
        n=n+'<path d="M272.065 59.0509H280.358C279.208 67.6465 272.671 78.3003 253.845 78.3003C234.353 78.3003 225.758 65.1647 225.758 48.0339C225.758 31.1453 235.08 18.0097 253.845 18.0097C270.855 18.0097 280.479 29.6925 280.479 46.2179C280.54 47.5497 280.419 48.8814 280.237 50.2131H234.656C235.322 65.7095 242.828 71.3995 254.148 71.3995C265.286 71.3995 270.37 66.1937 272.065 59.0509ZM234.898 43.4334H271.581C271.157 30.4189 264.438 24.971 253.906 24.971C243.191 24.971 236.169 30.0557 234.898 43.4334Z" fill="white"/>';
        n=n+'<path d="M333.082 59.0509H341.375C340.225 67.6465 333.688 78.3003 314.862 78.3003C295.371 78.3003 286.775 65.1647 286.775 48.0339C286.775 31.1453 296.097 18.0097 314.862 18.0097C331.872 18.0097 341.496 29.6925 341.496 46.2179C341.557 47.5497 341.436 48.8814 341.254 50.2131H295.734C296.4 65.7095 303.906 71.3995 315.225 71.3995C326.303 71.3995 331.387 66.1937 333.082 59.0509ZM295.976 43.4334H332.659C332.235 30.4189 325.516 24.971 314.983 24.971C304.208 24.971 297.187 30.0557 295.976 43.4334Z" fill="white"/>';
        n=n+'<path d="M400.758 40.4068V76.5448H391.678V41.4358C391.678 29.3293 386.351 25.6973 378.058 25.6973C365.468 25.6973 358.809 35.4431 358.809 54.9346V76.5448H349.729V19.8862H358.809V34.8378C362.441 23.9419 369.463 18.0702 380.54 18.0702C394.765 18.0702 400.758 25.7579 400.758 40.4068Z" fill="white"/>';
        n=n+'</svg>';
        n=n+'<div class="separator"></div>';
        n=n+'<div class="browser-wallet">BROWSER WALLET</div>';

        n=n+'<div class="footer-only">';
            n=n+'<div class="footer">';
                n=n+'<div class="w-100"><div class="form-group border-0"><div class="input-group"><span class="input-group-text"><span class="icon icon-password"></span></span><input id="login_password" type="password" class="form-control form-control-sm" placeholder="Wallet Password"><span class="input-group-text p-0"><button id="login_do_login" type="button" class="btn btn-sm btn-primary">Sign in <span class="icon icon-right-arrow"></span></button></span></div></div></div>';
                n=n+'<div id="login_option" class="w-100 form-check form-switch d-flex align-items-center justify-content-center mb-0">';
                    n=n+'<input class="form-check-input darker" type="checkbox" role="switch" id="login_keep_me_signed_in" '+(localStorage.getItem("keep_me_signed_in") === 'true' ? 'checked="checked"' : '')+'>';
                    n=n+'<label class="form-check-label d-flex align-items-center" for="login_keep_me_signed_in"><h5 class="m-0 text-white fw-light">Keep me signed in</h5></label>';
                n=n+'</div>';
            n=n+'</div>';
            n=n+'</div>';
        n=n+'</div>';
        document.getElementById("login_screen").innerHTML = n;
    }

    document.getElementById("login_screen").classList.remove('inactive');
    document.getElementById("login_screen").removeAttribute('style');
    document.getElementById("login_do_login").addEventListener("click", do_login);
    document.getElementById("login_password").addEventListener("keypress",  async function(e) {
        if (e.key === "Enter") {
            await do_login();
        }
    });

    // focus to password input field
    setTimeout(function() {
        document.getElementById("login_password").focus();
    }, 500)

    if(!instant) {
        anime({
            targets: '#login_screen',
            easing: 'linear',
            duration: 400,
            delay: 300,
            opacity: [0, 1]
        });
    }

    if(!login_init) {
        anime({
            targets: '.separator',
            easing: 'linear',
            duration: 300,
            delay: 300,
            translateY: [20, 0],
            opacity: [0, 1]
        });

        anime({
            targets: '.browser-wallet',
            easing: 'linear',
            duration: 300,
            delay: 400,
            translateX: [-30, 0],
            opacity: [0, 1]
        });

        anime({
            targets: '.footer-only',
            easing: 'linear',
            duration: 400,
            delay: 500,
            opacity: [0, 1]
        });

        anime({
            targets: '#login_option',
            easing: 'linear',
            duration: 300,
            delay: 600,
            translateY: [-20, 0],
            opacity: [0, 1]
        });
    }

    login_init = true;
}
async function do_login() {
    const password = DOMPurify.sanitize(document.getElementById("login_password").value);
    const keep_me_signed_in = document.getElementById("login_keep_me_signed_in").checked;

    localStorage.setItem("keep_me_signed_in", keep_me_signed_in);

    if(await load_account(password)) {
        hide_login();
        if(keep_me_signed_in) {
            await save_password(password);
        }

        localStorage.setItem("keep_me_signed_in", keep_me_signed_in); // save this option for future logins
    } else {
        if(notification) {
            notification.hideToast()
        }
        notification = Toastify({
            text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="icon icon-alert"></span></div><div class="col-10">Password is wrong!</div></div>',
            offset: {
                // y: 5
            },
            duration: 3000,
            className: 'notification notification-error',
            close: false,
            stopOnFocus: false,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            escapeMarkup: false,
            onClick: function(){
                notification.hideToast()
            }
        }).showToast();
    }
}
function hide_login(instant = false) {
    remove_notifications();

    if(!instant) {
        setTimeout(function() {
            document.getElementById("login_screen").classList.add("fade-out");
        }, 500);

        setTimeout(function() {
            try {
                document.getElementById("login_screen").classList.add("inactive")
                document.getElementById("login_screen").classList.remove("fade-out")
                document.getElementById("login_password").value = ''; // remove password from a field
            } catch (e) {

            }
        }, 800)
    } else {
        try {
            document.getElementById("login_password").value = ''; // remove password from a field
        } catch (e) {

        }
        document.getElementById("login_screen").classList.add("inactive")
    }
}
async function save_password(password) {
    await current_browser.runtime.sendMessage({
        type: "BROWSER-WALLET",
        command: "save_password",
        password: password
    });
}
async function get_password() {
    return await current_browser.runtime.sendMessage({
        type: "BROWSER-WALLET",
        command: "request_password"
    });
}
async function refresh_password() {
    return await current_browser.runtime.sendMessage({
        type: "BROWSER-WALLET",
        command: "refresh_password"
    });
}
function get_browser() {
    let userAgent = navigator.userAgent;
    let browserName = '';

    if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "firefox";
    } else if (userAgent.match(/safari/i)) {
        browserName = "safari";
    } else if (userAgent.match(/opr\//i)) {
        browserName = "opera";
    } else if (userAgent.match(/edg/i)) {
        browserName = "edge";
    }

    return browserName;
}