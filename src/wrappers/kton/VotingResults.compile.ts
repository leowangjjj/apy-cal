import { CompilerConfig, compile as compileFunc } from '@ton/blueprint';
import { mkdir } from 'fs/promises';
import writeFileAtomic from 'write-file-atomic';
import path from 'path';

export const compile: CompilerConfig = {
    lang: 'func',
    targets: ['contracts/jetton_dao/contracts/voting-results.func'],
    postCompileHook: async (code) => {
        const auto = path.join(__dirname, '..', 'contracts', 'auto');
        await mkdir(auto, { recursive: true });
        await writeFileAtomic(path.join(auto, 'voting-results-code.func'), `cell voting_results_code() asm "B{${code.toBoc().toString('hex')}} B>boc PUSHREF";`);
    }
};
