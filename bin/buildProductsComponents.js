#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fix for __dirname not being available to es modules.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../');

import esbuild from 'esbuild';

async function main() {
  const componentsJSONPath = path.join(
    projectRoot,
    'src/data/componentsByProduct.json',
  );

  await esbuild.build({
    entryPoints: [componentsJSONPath],
    bundle: true,
    format: 'esm',
    outdir: path.join(projectRoot, 'src/data'),
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
