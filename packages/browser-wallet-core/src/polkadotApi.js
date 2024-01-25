import { ApiPromise, WsProvider } from '@polkadot/api'
import { NetworkStore } from "./stores/index.js";
import { isIOs } from "@bitgreen/browser-wallet-utils";
import { getChainMetaData, getInflationAmount, getKycAddresses } from "./cache.js";
import DatabaseService from "./services/databaseService.js";

let ws_provider_url = undefined;
let ws_provider = undefined;
let api = undefined

const initPolkadotApi = async(force = false) => {
    const db = new DatabaseService()

    return new Promise(async(resolve) => {
        const networks_store = new NetworkStore()
        const current_network = await networks_store.current()

        if(force) {
            if(ws_provider?.isConnected) ws_provider.disconnect()
            ws_provider = null
        }

        if(!ws_provider?.isConnected) {
            try {
                ws_provider_url = current_network.url
                ws_provider = new WsProvider(ws_provider_url, false)

                await ws_provider.connect()
            } catch (e) {
                api = null
                console.log('Error connecting to WS provider.', e)
            }
        }

        if (ws_provider) {
            ws_provider.on('connected', async (e) => {
                const api_promise = await ApiPromise.create({
                    provider: ws_provider, types:
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
                await api_promise.isReady

                api = api_promise

                resolve(api)

                // cache data we need
                getChainMetaData(api_promise, db).then()
                getInflationAmount(api_promise, db).then()
                getKycAddresses(api_promise, db).then()
            })

            ws_provider.on('error', async (e) => {
                api = undefined

                console.warn('Polkadot WS provider error: ', e)

                if (current_network.id !== 'mainnet' && current_network.id !== 'testnet') {
                    await networks_store.asyncSet('current', 'mainnet') // reset to mainnet
                }

                resolve(api)
            });

            ws_provider.on('disconnected', async (e) => {
                api = undefined

                console.warn('Polkadot WS provider disconnected.')
            })
        }
    });
}

const polkadotApi = async(force = false) => {
    if(!api || force || !ws_provider?.isConnected || isIOs()) {
        const success = await initPolkadotApi(force)
        if(!success) {
            setTimeout(() => {
                initPolkadotApi(force)
            }, 1000)
            return undefined
        }
    }

    return api
}

export {
    polkadotApi
}