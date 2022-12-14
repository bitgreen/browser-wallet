// program to query the state of the chain
window.api = polkadotApi
window.util = polkadotUtil;
window.util_crypto = polkadotUtilCrypto;
window.keyring = polkadotKeyring;
let current_browser=''
let apiv='';
// call the main loop that is async to use "await"
mainloop();

// main body
async function mainloop(){
    // check parameters
    const params = new URLSearchParams(window.location.search)
    if ( params.has("pallet") && params.has("call") && params.has("parameters")) {
        // purify parameters from hacking attempts
        const pallet=DOMPurify.sanitize(params.get("pallet"));
        const call=DOMPurify.sanitize(params.get("call"));
        const parameters=JSON.parse(params.get("parameters"));
        // used for browser runtime
        const browsertype= await get_browser();
        if(browsertype === 'chrome') {
            current_browser = chrome
        } else {
            current_browser = browser
        }
        // connect to the remote node:
        await set_network();
        // execute the query required
        let answer='';
        try{
            answer= await apiv.query[pallet][call](...parameters);    
        } catch(err){
            answer=JSON.stringify({"error":err.message});
        }
        // send back the answer for content.js
        current_browser.runtime.sendMessage({
            type: "BROWSER-WALLET",
            command: "querypalletanswer",
            message: JSON.stringify(answer)
            }, (response) => {
                // TODO debugging, to be removed
                console.log('QueryPallet - Sent ', JSON.stringify(answer));
                window.close();
        });    
    }    
}

// TODO move this function to a common library to be used from both wallet.js and query.js without duplications
// function to open connection to network
async function set_network() {
    let network = localStorage.getItem("selected_network");
    if(!network) {
        network = 'testnet'
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
}

// to be moved in common library to avoid duplication
async function get_browser() {
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