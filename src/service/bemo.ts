import { Address } from "@ton/core";
import { getTonClient } from "../utils/getTonClient";
import { Financial } from "../wrappers/bemo/Financial";
import { NominatorProxy } from "../wrappers/bemo/NominatorProxy";
import { NominatorPool } from "../wrappers/bemo/NominatorPool";


export async function getBemoFinancial() {
    const client = getTonClient();
    const pool = await client.open(new Financial(Address.parse(import.meta.env.VITE_BEMO_CONTRACT_ADDRESS!)));
    console.log(pool)
    const data = await pool.getFinancialData();
    console.log(data)
    return data;
}

export async function getBemoNominatorProxy() {
    const client = getTonClient();
    const pool = await client.open(new NominatorProxy(Address.parse(import.meta.env.VITE_BEMO_NOMINATOR_PROXY_ADDRESS!)));
    console.log(pool)
    const data = await pool.getProxyData();
    console.log(data)
    return data;
}

export async function getBemoNominatorPool() {
    const client = getTonClient();
    const pool = await client.open(new NominatorPool(Address.parse(import.meta.env.VITE_BEMO_NOMINATOR_ADDRESS!)));
    console.log(pool)
    const data = await pool.getNominatorList();
    console.log(data)
    return data;
}