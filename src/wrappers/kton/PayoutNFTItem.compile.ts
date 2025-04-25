import { CompilerConfig } from '@ton/blueprint';
import { readFile, mkdir } from 'fs/promises';
import writeFileAtomic from 'write-file-atomic';
import path from 'path';
import { getGitHead } from '../utils';

export const compile: CompilerConfig = {
    lang: 'func',
    preCompileHook: async () => {
        const head = await getGitHead();

        const auto = path.join(__dirname, '..', 'contracts', 'auto');
        await mkdir(auto, { recursive: true });
        await writeFileAtomic(path.join(auto, 'git-hash.func'), `const int git_hash = 0x${head.trim()};`);
    },
    targets: ['contracts/versioning.func',
              'contracts/payout_nft/nft-item.func'],
    postCompileHook: async (code) => {
        const auto = path.join(__dirname, '..', 'contracts', 'auto');
        await mkdir(auto, { recursive: true });
        await writeFileAtomic(path.join(auto, 'payout-nft-item-code.func'), `cell nft_item_code() asm "B{${code.toBoc().toString('hex')}} B>boc PUSHREF";`);
    }
};
