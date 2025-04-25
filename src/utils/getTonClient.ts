import { ToncoreAdapter } from '@tonx/adapter';
import { TonClient } from '@ton/ton';

export function getTonClient() {
    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: import.meta.env.VITE_TON_CLIENT_API_KEY,
    });
    console.log(client)
    return client;
}