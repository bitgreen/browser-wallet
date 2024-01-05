import aesjs from 'aes-js'
import {hexToU8a, stringToU8a, u8aToHex} from '@polkadot/util'
import {
    blake2AsU8a,
    cryptoWaitReady,
    keccakAsU8a,
    mnemonicGenerate,
    mnemonicValidate,
    sha512AsU8a
} from '@polkadot/util-crypto'
import {
    AccountStore,
    AssetStore, CacheStore,
    NetworkStore,
    SettingsStore,
    TokenStore,
    TransactionStore,
    WalletStore
} from "../stores/index.js"
import {Keyring} from "@polkadot/keyring"
import {polkadotApi} from "../polkadotApi.js";
import {addressValid, balanceToHuman, humanToBalance} from "@bitgreen/browser-wallet-utils";

import {bbbTokenPrice, passwordTimeout} from "../constants.js";
import {showPopup} from "./index.js";
import BigNumber from "bignumber.js";

class Extension {
    #password

    constructor() {
        this.accounts_store = new AccountStore()
        this.networks_store = new NetworkStore()
        this.wallets_store = new WalletStore()
        this.settings_store = new SettingsStore()
        this.#password = null
        this.password_timer = null

        this.init().then()
    }

    async init() {
        this.cache_store = new CacheStore(await this.networks_store.current())
    }

    async handle(data, from, port) {
        await this.refreshPassword(data.command)

        switch(data.command) {
            case 'new_wallet_screen':
                return await this.newWalletScreen()
            case 'new_wallet':
                return await this.newWallet(data?.params)
            case 'save_wallet':
                return await this.saveWallet(data?.params)
            case 'unlock_wallet':
                return await this.unlockWallet(data?.params)
            case 'lock_wallet':
                return await this.lockWallet()
            case 'new_account':
                return await this.newAccount(data?.params)
            case 'save_network':
                return await this.saveNetwork(data?.params)
            case 'change_network':
                return await this.changeNetwork(data?.params)
            case 'get_last_block':
                return await this.getLastBlock()
            case 'get_balance':
                return await this.getBalance()
            case 'get_all_balances':
                return await this.getAllBalances()
            case 'get_vesting_contract':
                return await this.getVestingContract()
            case 'get_transactions':
                return await this.getTransactions()
            case 'get_asset_transactions':
                return await this.getAssetTransactions()
            case 'get_token_transactions':
                return await this.getTokenTransactions()
            case 'reveal_mnemonic':
                return await this.revealMnemonic(data?.params)
            case 'check_login':
                return await this.checkLogin()
            case 'fast_check_login':
                return await this.fastCheckLogin()
            case 'sign_in':
                return await this.signIn(data?.id, data?.params)
            case 'transfer':
                return await this.transfer(data?.id, data?.params)
            case 'extrinsic':
                return await this.submitExtrinsic(data?.id, data?.params)
            case 'change_setting':
                return await this.changeSetting(data?.params)
            case 'get_collators':
                return await this.getCollators()
            case 'get_estimated_fee':
                return await this.getEstimatedFee(data?.params)
            default:
                return false
        }
    }

    async savePassword(password) {
        this.#password = password

        await this.refreshPassword()
    }

    async refreshPassword(command = null) {
        let skip = false

        if(command && command === 'fast_check_login') {
            skip = true
        }

        if(!this.#password || skip) return false

        // refresh password - extend its time
        clearTimeout(this.password_timer);
        if(this.#password) {
            this.password_timer = setTimeout(() => {
                this.#password = null;
            }, passwordTimeout)
        }
    }

    async newWalletScreen() {
        return await showPopup('new_wallet');
    }

    async newWallet(params) {
        const words = params?.words === 24 ? 24 : 12
        await cryptoWaitReady()

        const mnemonic = mnemonicGenerate(words);
        return mnemonic.split(' ')
    }

    async saveWallet(params) {
        let mnemonic = params?.mnemonic
        const password = params?.password
        const name = params?.name

        // convert mnemonic to string, space separated
        mnemonic = Object.entries(mnemonic).map(([key, value]) => `${value}`).join(' ')

        if(!mnemonicValidate(mnemonic)) {
            return false
        }

        const encrypted_data = await this.encryptWallet(mnemonic, password)
        await this.wallets_store.asyncSet('main', encrypted_data)

        // create main account & set as default
        await this.createAccount(name, mnemonic, 'main')
        await this.accounts_store.asyncSet('current', 'main')

        // import accounts with balance > 0
        this.importAccountsWithBalance(mnemonic, password).then()

        return true
    }

    async unlockWallet(params) {
        const password = params?.password

        const result = await this.decryptWallet(password)

        if(!result) return false

        await this.savePassword(password)

        return true
    }

    async lockWallet() {
        this.#password = null
        clearTimeout(this.password_timer)
    }

    async newAccount(params) {
        const password = params?.password
        const name = params?.name
        const next_id = await this.accounts_store.nextId()
        let derivation_path = params?.derivation_path.toLowerCase()

        if(!password) {
            return { error: 'Password is wrong!' }
        }

        if(!name) {
            return { error: 'Account Name is required.' }
        }

        if(derivation_path && derivation_path !== '') {
            if(!derivation_path.match(/^[\w-]+$/g)) {
                return { error: 'Invalid derivation path.' }
            }

            const account_exist = await this.accounts_store.asyncGet(derivation_path)
            if(account_exist) {
                return { error: 'Account already exists.' }
            }
        } else {
            derivation_path = next_id
        }

        const mnemonic = await this.decryptWallet(password, true)

        if(mnemonic) {
            const response = this.createAccount(name, mnemonic, derivation_path)
            if(response) await this.accounts_store.asyncSet('current', derivation_path)
            return response
        }

        return false
    }

    async saveNetwork(params) {
        let network_id = params?.network_id
        const network_name = params?.network_name
        const network_url = params?.network_url
        const switch_network = params?.switch_network

        if(!network_id) {
            network_id = await this.networks_store.nextId()
        }

        await this.networks_store.asyncSet(network_id, {
            name: network_name,
            url: network_url
        })

        if(switch_network) {
            await this.networks_store.asyncSet('current', network_id)
            await polkadotApi(true) // reload polkadot API
        }
    }

    async changeNetwork(params) {
        const network_id = params?.network_id

        await this.networks_store.asyncSet('current', network_id)
        await polkadotApi(true) // reload polkadot API
    }

    async getLastBlock() {
        const polkadot_api = await polkadotApi()

        const block = await polkadot_api.rpc.chain.getBlock()

        return block.toJSON().block
    }

    async getBalance() {
        const polkadot_api = await polkadotApi()
        const account = await this.accounts_store.current()

        const { nonce, data: balance } = await polkadot_api.query.system.account(account.address);

        return {
            free: new BigNumber(balance.free).toString(),
            reserved: new BigNumber(balance.reserved).toString(),
            frozen: new BigNumber(balance?.frozen || 0).toString(),
            total: new BigNumber(balance.free).plus(new BigNumber(balance.reserved)).plus(new BigNumber(balance?.frozen || 0)).toString(),
        }
    }

    async getAllBalances() {
        const current_network = await this.networks_store.current()
        const current_account = await this.accounts_store.current()

        const polkadot_api = await polkadotApi()

        if(!['mainnet', 'testnet'].includes(current_network.id)) return false;

        const url = current_network.api_endpoint + '/tokens-assets/ids?account=' + current_account.address;
        let result = await fetch(url, {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        result = await result.json()

        const balances = {
            tokens: [],
            assets: [],

            total: new BigNumber(0),
            tokens_total: new BigNumber(0)
        }

        for(const asset of result.assets) {
            let price = 0

            try {
                const data = (await polkadot_api.query.assets.account(asset, current_account.address)).toHuman()
                if(data) {
                    balances.assets.push({
                        asset_name: asset,
                        balance: parseInt(data.balance.replaceAll(',', '')),
                        price: price
                    })

                    balances.total = balances.total.plus(new BigNumber(humanToBalance(data.balance.replaceAll(',', ''))))
                }
            } catch (e) {
                console.log('error getting asset balance')
            }
        }

        // Add BBB on the list
        const { nonce, data: balance } = await polkadot_api.query.system.account(current_account.address);
        const bbb_balance = balance.toPrimitive()
        balances.tokens.push({
            token_name: 'BBB',
            free: new BigNumber(bbb_balance.free).toString(),
            reserved: new BigNumber(bbb_balance.reserved).toString(),
            frozen: new BigNumber(bbb_balance?.frozen || 0).toString(),
            total: new BigNumber(bbb_balance.free).plus(new BigNumber(bbb_balance.reserved)).plus(new BigNumber(bbb_balance?.frozen || 0)).toString(),
            price: bbbTokenPrice
        })
        balances.total = balances.total.plus(new BigNumber(bbb_balance.free)).plus(new BigNumber(bbb_balance.reserved)).plus(new BigNumber(bbb_balance?.frozen || 0))

        for(const token of result.tokens) {
            let price = 0
            if(token === 'USDT' || token === 'USDC') {
                price = 0.9898
            }

            try {
                const { free, reserved, frozen } = await polkadot_api.query.tokens.accounts(current_account.address, token);
                balances.tokens.push({
                    token_name: token,
                    free: new BigNumber(free),
                    reserved: new BigNumber(reserved),
                    frozen: new BigNumber(frozen),
                    total: new BigNumber(free).plus(new BigNumber(reserved)).plus(new BigNumber(frozen)).toString(),
                    price: price
                })

                balances.total = balances.total.plus(new BigNumber(free)).plus(new BigNumber(reserved)).plus(new BigNumber(frozen))
                balances.tokens_total = balances.tokens_total.plus(new BigNumber(free)).plus(new BigNumber(reserved)).plus(new BigNumber(frozen))
            } catch (e) {
                console.log('error getting token balance')
            }
        }

        balances.total = balances.total.toString()
        balances.tokens_total = balances.tokens_total.toString()

        return balances
    }

    async getVestingContract() {
        const polkadot_api = await polkadotApi()
        const current_account = await this.accounts_store.current()

        let contract = await polkadot_api.query.vestingContract.vestingContracts(current_account.address)
        contract = contract.toJSON()

        if(contract && contract.amount) {
            return contract
        }

        return false
    }

    async getBalanceByAddress(account_address) {
        const polkadot_api = await polkadotApi()

        if(!addressValid(account_address)) {
            return 0
        }

        const { nonce, data: balance } = await polkadot_api.query.system.account(account_address);

        return balance.free.toString()
    }

    async initTransactionsStore() {
        const current_network = await this.networks_store.current()
        const current_account = await this.accounts_store.current()

        this.transactions_store = new TransactionStore(current_network, current_account)
    }

    async getTransactions() {
        await this.initTransactionsStore()

        await this.transactions_store.asyncRemoveAll()
        await this.transactions_store.fetch()

        let transactions = await this.transactions_store.asyncAll()

        // Sort by date by default
        transactions.sort((a, b) => {
            return new Date(Date.parse(b.value.createdAt)) - new Date(Date.parse(a.value.createdAt));
        })

        return transactions
    }

    async initAssetsStore() {
        const current_network = await this.networks_store.current()
        const current_account = await this.accounts_store.current()

        this.assets_store = new AssetStore(current_network, current_account)
    }

    async getAssetTransactions() {
        await this.initAssetsStore()

        await this.assets_store.asyncRemoveAll()
        await this.assets_store.fetch()

        let assets = await this.assets_store.asyncAll()

        // Sort by date by default
        assets.sort((a, b) => {
            return new Date(Date.parse(b.value.createdAt)) - new Date(Date.parse(a.value.createdAt));
        })

        return assets
    }

    async initTokensStore() {
        const current_network = await this.networks_store.current()
        const current_account = await this.accounts_store.current()

        this.tokens_store = new TokenStore(current_network, current_account)
    }

    async getTokenTransactions() {
        await this.initTokensStore()

        await this.tokens_store.asyncRemoveAll()
        await this.tokens_store.fetch()

        let tokens = await this.tokens_store.asyncAll()

        // Sort by date by default
        tokens.sort((a, b) => {
            return new Date(Date.parse(b.value.createdAt)) - new Date(Date.parse(a.value.createdAt));
        })

        return tokens
    }

    async revealMnemonic(params) {
        const password = params?.password

        if(!password) return false

        return await this.decryptWallet(password, true)
    }

    async checkLogin() {
        return await this.decryptWallet(this.#password)
    }

    async fastCheckLogin() {
        return !!this.#password
    }

    async encryptWallet(mnemonic, password) {
        // get ascii value of first 2 chars
        const vb1 = password.charCodeAt(0);
        const vb2 = password.charCodeAt(1);

        // position to derive other 3 passwords
        const p = vb1*vb2;

        // derive the password used for encryption with an init vector (random string) and 10000 hashes with 3 different algorithms
        let randomstring = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for(let i = 0; i < 32; i++) {
            randomstring += characters.charAt(Math.floor(Math.random()*charactersLength));
        }
        let dpwd1 = '';
        let dpwd2 = '';
        let dpwd3 = '';
        let h = keccakAsU8a(password + randomstring);
        for(let i = 0; i < 100000; i++) {
            h = keccakAsU8a(h);
            if(i === p) {
                dpwd1 = h;
            }
            h = sha512AsU8a(h);
            if(i === p) {
                dpwd2 = h;
            }
            h = blake2AsU8a(h);
            if(i === p) {
                dpwd3 = h;
            }
        }

        // 3 Layers encryption
        // encrypt the secret words in AES256-CFB
        let ivf = '';
        for(let i = 0; i < 16; i++) {
            ivf += characters.charAt(Math.floor(Math.random()*charactersLength));
        }
        const ivaescfb = aesjs.utils.utf8.toBytes(ivf);
        const keyaescfb = dpwd1.slice(0, 32);
        const aesCfb = new aesjs.ModeOfOperation.cfb(keyaescfb, ivaescfb);
        const mnemonicbytes = aesjs.utils.utf8.toBytes(mnemonic);

        let encryptedaescfb = aesCfb.encrypt(mnemonicbytes);

        // encrypt the output of AES256-CFB in AES256-CTR
        let ivs = '';
        for(let i = 0; i < 16; i++) {
            ivs += characters.charAt(Math.floor(Math.random()*charactersLength));
        }

        const ivaesctr = aesjs.utils.utf8.toBytes(ivs);
        //const keyaes= aesjs.utils.utf8.toBytes(dpwd2.slice(0,32));
        const keyaesctr = dpwd2.slice(0, 32);
        let aesCtr = new aesjs.ModeOfOperation.ctr(keyaesctr, ivaesctr);
        let encryptedaesctr = aesCtr.encrypt(encryptedaescfb);

        // encrypt the output of AES256-CTR in AES256-OFB
        let ivso = '';
        for(let i = 0; i < 16; i++) {
            ivso += characters.charAt(Math.floor(Math.random()*charactersLength));
        }
        const ivaesofb = aesjs.utils.utf8.toBytes(ivso);
        const keyaesofb = dpwd3.slice(0, 32);
        let aesOfb = new aesjs.ModeOfOperation.ofb(keyaesofb, ivaesofb);
        let encryptedaesofb = aesOfb.encrypt(encryptedaesctr);
        let encryptedhex = aesjs.utils.hex.fromBytes(encryptedaesofb);

        // convert to Hex json
        return {
            "iv": randomstring,
            "ivaescfb": u8aToHex(ivaescfb),
            "ivaesctr": u8aToHex(ivaesctr),
            "ivaesofb": u8aToHex(ivaesofb),
            "encrypted": encryptedhex
        };
    }

    async decryptWallet(password, mnemonic_only = false) {
        if(password?.length < 2 || !password) {
            return false;
        }

        const wallet_data = await this.wallets_store.asyncGet('main')
        if(!wallet_data) {
            return false;
        }

        // get ascii value of first 2 chars
        const vb1 = password.charCodeAt(0);
        const vb2 = password.charCodeAt(1);

        // position to derive other 3 passwords
        const p = vb1*vb2;

        // derive the password used for encryption with an init vector (random string) and 10000 hashes with 3 different algorithms
        const enc = wallet_data;
        let randomstring = enc.iv;
        let dpwd1 = '';
        let dpwd2 = '';
        let dpwd3 = '';
        let h = keccakAsU8a(password + randomstring);
        for(let i = 0; i < 100000; i++) {
            h = keccakAsU8a(h);
            if(i === p) {
                dpwd1 = h;
            }
            h = sha512AsU8a(h);
            if(i === p) {
                dpwd2 = h;
            }
            h = blake2AsU8a(h);
            if(i === p) {
                dpwd3 = h;
            }
        }

        // decrypt AES-OFB
        const ivaesofb = hexToU8a(enc.ivaesofb);
        const keyaesofb = dpwd3.slice(0, 32);
        let aesOfb = new aesjs.ModeOfOperation.ofb(keyaesofb, ivaesofb);
        const encryptedhex = enc.encrypted;
        const encryptedaesofb = aesjs.utils.hex.toBytes(encryptedhex);
        let encryptedaesctr = aesOfb.decrypt(encryptedaesofb);

        // decrypt AES-CTR
        const ivaesctr = hexToU8a(enc.ivaesctr);
        const keyaesctr = dpwd2.slice(0, 32);
        let aesCtr = new aesjs.ModeOfOperation.ctr(keyaesctr, ivaesctr);
        let encryptedaescfb = aesCtr.decrypt(encryptedaesctr);

        // decrypt AES-CFB
        const ivaescfb = hexToU8a(enc.ivaescfb);
        const keyaescfb = dpwd1.slice(0, 32);
        let aesCfb = new aesjs.ModeOfOperation.cfb(keyaescfb, ivaescfb);
        let decrypted = aesCfb.decrypt(encryptedaescfb);
        let decrypted_mnemonic = aesjs.utils.utf8.fromBytes(decrypted);

        if(!decrypted_mnemonic) {
            return false;
        } else {
            if(!mnemonicValidate(decrypted_mnemonic)) {
                return false;
            }

            if(mnemonic_only) {
                return decrypted_mnemonic;
            }

            return true;
        }
    }

    async createAccount(name, mnemonic, account_id) {
        await cryptoWaitReady()

        let uri_mnemonic = mnemonic
        if(account_id !== 'main') {
            uri_mnemonic += '//' + account_id
        }

        const keyring = new Keyring({
            type: 'sr25519'
        });

        const keypair = keyring.addFromUri(uri_mnemonic, {
            name: ''
        }, 'sr25519');

        await this.accounts_store.asyncSet(account_id, {
            "address": keypair.address,
            "name": name
        })

        await this.cache_store.remove('last_fetch_kyc')

        return account_id
    }

    async loadAccount(password, account_id, temp_load = false) {
        await cryptoWaitReady()

        let mnemonic = await this.decryptWallet(password, true)

        if(!mnemonic) {
            return false
        }

        const account = await this.accounts_store.asyncGet(account_id)
        if(account_id !== 'main' && account_id && (account || temp_load)) {
            mnemonic += '//' + account_id
        }

        const keyring = new Keyring({
            type: 'sr25519'
        });

        return keyring.addFromUri(mnemonic, { name: temp_load ? 'Account ' + account_id : account.name }, 'sr25519');
    }

    async importAccountsWithBalance(mnemonic, password) {
        for(let i = 0; i <= 100; i++) {
            const account_id = i
            const temp_account = await this.loadAccount(password, account_id.toString(), true)

            if(await this.getBalanceByAddress(temp_account.address) > 0) {
                // save this account
                await this.createAccount('Account ' + account_id, mnemonic, account_id.toString())
            } else {
                break
            }
        }
    }

    async signIn(message_id, params) {
        let data = {}

        const account = await this.loadAccount(params?.password, params?.account_id)
        if(account) {
            const dt = new Date()
            const timestamp = dt.getTime()
            const message = timestamp.toString() + "#" + params?.domain
            const signature = account.sign(stringToU8a(message))

            data = {
                message,
                signature: u8aToHex(signature),
                address: account.address
            }
        } else {
            return false
        }

        return data
    }

    async transfer(message_id, params) {
        const polkadot_api = await polkadotApi()

        let response = {}

        const account = await this.loadAccount(params?.password, params?.account_id)

        if(!account) {
            return false
        }

        const asset = params?.asset

        return new Promise(async(resolve) => {
            let transaction = null
            if(asset.is_token) {
                if(asset.name === 'bbb') {
                    transaction = polkadot_api.tx.balances.transfer(params?.recipient, humanToBalance(params?.amount))
                } else {
                    transaction = polkadot_api.tx.tokens.transfer(params?.recipient, asset.name, humanToBalance(params?.amount))
                }
            } else {
                transaction = polkadot_api.tx.assets.transfer(asset.name, params?.recipient, params?.amount)
            }

            await transaction
                .signAndSend(account, { nonce: -1 }, ({ status, events = [], dispatchError }) => {
                    if(dispatchError) {
                        // for module errors, we have the section indexed, lookup
                        const decoded = polkadot_api.registry.findMetaError(dispatchError.asModule)
                        const { docs, method, section } = decoded

                        if(dispatchError.isModule) {
                            response = {
                                success: false,
                                status: 'failed',
                                error: section + '.' + method + ' ' + docs.join(' '),
                                data: {
                                    section,
                                    method
                                }
                            }
                        } else {
                            // Other, CannotLookup, BadOrigin, no extra info
                            response = {
                                success: false,
                                status: 'failed',
                                error: dispatchError.toString()
                            }
                        }

                        resolve(response)
                    }

                    if(status.isInBlock) {
                        // return result after confirmation
                        resolve({
                            success: true,
                            data: {
                                block_hash: status?.asInBlock?.toHex()
                            }
                        })
                    }
                }).catch(err => {
                    resolve({
                        success: false,
                        status: 'failed',
                        error: err.message
                    })
                });
        });
    }

    async submitExtrinsic(message_id, params) {
        const polkadot_api = await polkadotApi()

        const pallet = params?.pallet
        const call = params?.call
        const call_parameters = params?.call_parameters
        let call_request = call_parameters ? JSON.parse(call_parameters) : []

        let response = {}

        const account = await this.loadAccount(params?.password, params?.account_id)

        if(!account) {
            return false
        }

        if(pallet === 'utility' && (call === 'batch' || call === 'batchAll' || call === 'forceBatch')) {
            try {
                call_request = []

                for(const extrinsic of JSON.parse(call_parameters)) {
                    call_request.push(await polkadot_api.tx[extrinsic[0]][extrinsic[1]](...extrinsic[2]))
                }

                call_request = [call_request]
            } catch (e) {
                return {
                    success: false,
                    status: 'failed',
                    error: e.message
                }
            }

        }

        return new Promise(async(resolve) => {
            if(!polkadot_api.tx[pallet]) {
                 response = {
                    success: false,
                    status: 'failed',
                    error: 'Pallet not found.'
                }
                return resolve(response)
            }
            if(!polkadot_api.tx[pallet][call]) {
                response = {
                    success: false,
                    status: 'failed',
                    error: 'Pallet call not found.'
                }
                return resolve(response)
            }

            try {
                await polkadot_api.tx[pallet][call](...call_request)
                    .signAndSend(account, { nonce: -1 }, ({ status, events = [], dispatchError }) => {
                        events.forEach((e) => {
                            const ex = e.toHuman()

                            // handle batch interrupted case
                            if((pallet === 'utility' && (call === 'batch' || call === 'batchAll' || call === 'forceBatch'))
                                && (ex.event.section === 'utility' && ex.event.method === 'BatchInterrupted')) {

                                const failedIndex = e.event.data[0];
                                const error = e.event.data[1];

                                console.log(`Batch failed at call index: ${failedIndex}`);

                                if (error) {
                                    const decoded = polkadot_api.registry.findMetaError(error.asModule);
                                    const { docs, method, section } = decoded;

                                    // console.log("Error Details:", error, decoded);

                                    if(error.isModule) {
                                        resolve({
                                            success: false,
                                            status: 'failed',
                                            error: section + '.' + method + ' - ' + docs.join(' '),
                                            data: {
                                                failedIndex: failedIndex.toString()
                                            }
                                        })
                                    }
                                }
                            }
                        })
                        if(dispatchError) {
                            // for module errors, we have the section indexed, lookup
                            const decoded = polkadot_api.registry.findMetaError(dispatchError.asModule)
                            const { docs, method, section } = decoded

                            if(dispatchError.isModule) {
                                response = {
                                    success: false,
                                    status: 'failed',
                                    error: section + '.' + method + ' - ' + docs.join(' '),
                                    data: {
                                        section,
                                        method
                                    }
                                }
                            } else {
                                // Other, CannotLookup, BadOrigin, no extra info
                                response = {
                                    success: false,
                                    status: 'failed',
                                    error: dispatchError.toString()
                                }
                            }

                            resolve(response)
                        }


                        if(status.isInBlock) {
                            resolve({
                                success: true,
                                data: {
                                    block_hash: status.asInBlock.toHex()
                                }
                            })
                        }
                    }).catch(err => {
                        resolve({
                            success: false,
                            status: 'failed',
                            error: err.message
                        })
                    });
            } catch (e) {
                resolve({
                    success: false,
                    status: 'failed',
                    error: e.message
                })
            }
        });
    }

    async changeSetting(params) {
        for(const [key, value] of Object.entries(params)) {
            await this.settings_store.asyncSet(key, value)
        }
    }

    async getCollators() {
        const polkadot_api = await polkadotApi()

        const candidates = await polkadot_api.query.parachainStaking.candidates()
        const invulnerables = await polkadot_api.query.parachainStaking.invulnerables()

        return (candidates.toHuman()).concat(invulnerables.toHuman())
    }

    async getEstimatedFee(params) {
        const polkadot_api = await polkadotApi()

        let info = await polkadot_api.tx[params?.pallet][params?.call](...params?.call_parameters).paymentInfo(params?.account_address)
        info = info.toJSON()

        return info.partialFee
    }
}

export default Extension