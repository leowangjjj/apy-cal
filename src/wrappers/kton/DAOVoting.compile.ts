import { CompilerConfig, compile as compileFunc } from '@ton/blueprint';
import { mkdir } from 'fs/promises';
import writeFileAtomic from 'write-file-atomic';
import path from 'path';

export const compile: CompilerConfig = {
    lang: 'func',
    preCompileHook: async () => {
        await compileFunc('DAOVoteKeeper');
        await compileFunc('DAOJettonWallet');
    },
    targets: ['contracts/auto/dao-vote-keeper-code.func',
              'contracts/auto/dao-jetton-wallet-code.func',
              'contracts/jetton_dao/contracts/voting.func'],
    postCompileHook: async (code) => {
        const auto = path.join(__dirname, '..', 'contracts', 'auto');
        await mkdir(auto, { recursive: true });
        await writeFileAtomic(path.join(auto, 'dao-voting-code.func'), `cell voting_code() asm "B{${code.toBoc().toString('hex')}} B>boc PUSHREF";`);
    }
};
