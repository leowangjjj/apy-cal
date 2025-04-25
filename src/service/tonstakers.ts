import { Address } from "@ton/core";
import { getTonClient } from "../utils/getTonClient";
import { Pool } from "../wrappers/kton/Pool";


export async function getTonStakersPool() {
    const client = getTonClient();
    const pool = await client.open(new Pool(Address.parse(import.meta.env.VITE_TONSTAKERS_CONTRACT_ADDRESS!)));
    const data = await pool.getFullData();
    console.log(data)
    return data;
}