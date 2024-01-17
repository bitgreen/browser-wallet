import {AccountStore, databaseService} from "./index.js";
import { polkadot } from "@polkadot/types/extrinsic/signedExtensions/polkadot";

const getChainMetaData = async (polkadot_api, db) => {
    const now = new Date().getTime()
    const last_fetch = await db.stores.cache.asyncGet('last_fetch_metadata') || 0

    // One call per 24h
    if(now < (last_fetch + 1000 * 60 * 60 * 24)) return false

    let data = await polkadot_api.rpc.state.getMetadata()
    data = data.toJSON()

    for(const t of data.metadata.v14.lookup.types) {
        if(t.type.path[0] && t.type.path[0].match(/^pallet/i)
            && t.type.path[1]&& t.type.path[1] === 'pallet'
            && t.type.path[2] && t.type.path[2] === 'Call') {
            const pallet_name = t.type.path[0].replace('pallet_', '').replaceAll('_', '')

            // save all metadata for each pallet call
            for(const call of t.type.def.variant.variants) {
                db.stores.cache.set(`docs_${pallet_name}:${call.name.replaceAll('_', '')}`, {
                    docs: call.docs,
                    fields: call.fields
                })
            }
        }
    }

    db.stores.cache.set('last_fetch_metadata', now)
}

const getInflationAmount = async(polkadot_api, db) => {
    const now = new Date().getTime()

    const last_fetch = await db.stores.cache.asyncGet('last_fetch_inflation') || 0

    // One call per 12 hours
    if(now < (last_fetch + 1000 * 60 * 60 * 12)) return false

    const inflation_amount = await polkadot_api.query.parachainStaking.inflationAmountPerBlock()

    db.stores.cache.set('inflation_amount', inflation_amount.toString())

    db.stores.cache.set('last_fetch_inflation', now)
}

const getKycAddresses = async(polkadot_api, db) => {
    // return await db.stores.cache.asyncRemoveAll();
    const now = new Date().getTime()

    const last_fetch = await db.stores.cache.asyncGet('last_fetch_kyc') || 0

    // One call per 10 minutes
    if(now < (last_fetch + 1000 * 60 * 10)) return false

    const all_accounts = await db.stores.accounts.asyncAll()

    for(const account of all_accounts) {
        try {
            const kyc_data = await polkadot_api.query.kycPallet.members(account.value.address)

            const match = kyc_data.toString().match(/KYCLevel(\d+)/);
            const kycLevel = match ? match[1] : null;

            if(kycLevel) {
                db.stores.cache.set('kyc_' + account.value.address, kycLevel);
            } else {
                db.stores.cache.remove('kyc_' + account.value.address)
            }
        } catch {
            db.stores.cache.remove('kyc_' + account.value.address)
        }

    }

    db.stores.cache.set('last_fetch_kyc', now)
}

export {
    getChainMetaData,
    getInflationAmount,
    getKycAddresses
}

