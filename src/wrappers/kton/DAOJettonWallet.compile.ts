import { CompilerConfig, compile as compileFunc } from '@ton/blueprint';
import { mkdir } from 'fs/promises';
import writeFileAtomic from 'write-file-atomic';
import path from 'path';

export const compile: CompilerConfig = {
    lang: 'func',
    preCompileHook: async () => {
        await compileFunc('DAOVoteKeeper');
    },
    targets: ['contracts/auto/dao-vote-keeper-code.func',
              'contracts/dao_params.func',
              'contracts/jetton_dao/contracts/jetton-wallet.func'],

    postCompileHook: async (code) => {
        const auto = path.join(__dirname, '..', 'contracts', 'auto');
        await mkdir(auto, { recursive: true });
        //await writeFileAtomic(path.join(auto, 'dao-jetton-wallet-code.func'), `cell jetton_wallet_code() asm "B{${code.toBoc().toString('hex')}} B>boc PUSHREF";`);
        await writeFileAtomic(path.join(auto, 'dao-jetton-wallet-code.func'), `cell jetton_wallet_code() asm "<b 2 8 u, 0x${code.hash().toString('hex')} 256 u, b>spec PUSHREF";`);
    }
};
