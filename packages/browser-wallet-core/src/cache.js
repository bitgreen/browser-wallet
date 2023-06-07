import { databaseService } from "./index.js";

const db = new databaseService()

const getChainMetaData = async (polkadot_api) => {
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

const getInflationAmount = async(polkadot_api) => {
    const now = new Date().getTime()

    const last_fetch = await db.stores.cache.asyncGet('last_fetch_inflation') || 0

    // One call per 12 hours
    if(now < (last_fetch + 1000 * 60 * 60 * 12)) return false

    const inflation_amount = await polkadot_api.query.parachainStaking.inflationAmountPerBlock()

    db.stores.cache.set('inflation_amount', inflation_amount.toString())

    db.stores.cache.set('last_fetch_inflation', now)
}

export {
    getChainMetaData,
    getInflationAmount
}

