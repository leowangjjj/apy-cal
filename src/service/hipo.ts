import { Address } from "@ton/core";
import { getTonClient } from "../utils/getTonClient";
import { Treasury } from "../wrappers/hipo/Treasury";


export async function getHipoTreasury() {
    const client = getTonClient();
    const pool = await client.open(new Treasury(Address.parse(import.meta.env.VITE_HIPO_CONTRACT_ADDRESS!)));
    const data = await pool.getTreasuryState();
    console.log(data)
    return data;
}