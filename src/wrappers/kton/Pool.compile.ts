import { CompilerConfig } from '@ton/blueprint';
import { readFile, mkdir } from 'fs/promises';
import writeFileAtomic from 'write-file-atomic';
import path from 'path';
import { Metadata } from "../PoolConstants";
import { getGitHead } from '../utils';

export const compile: CompilerConfig = {
    lang: 'func',
    preCompileHook: async () => {
        const head = await getGitHead();

        const auto = path.join(__dirname, '..', 'contracts', 'auto');
        await mkdir(auto, { recursive: true });
        await writeFileAtomic(path.join(auto, 'git-hash.func'), `const int git_hash = 0x${head.trim()};`);

        await writeFileAtomic(path.join(auto, 'metadata.func'),
          `
const slice NFT_URI = "${Metadata.NFT_URI}";
const slice NFT_IMAGE_URI = "${Metadata.NFT_IMAGE_URI}";
          `
          );
    },
    targets: ['contracts/versioning.func',
              'contracts/pool.func'],
};
