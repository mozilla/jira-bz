#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fix for __dirname not being available to es modules.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../');

import esbuild from 'esbuild';

async function main() {
  const productsByClassificationJSONPath = path.join(
    projectRoot,
    'src/data/productsByClassification.json',
  );

  const componentsByProductIdJSONPath = path.join(
    projectRoot,
    'src/data/componentsByProductID.json',
  );

  const componentsByProductNameJSONPath = path.join(
    projectRoot,
    'src/data/componentsByProductName.json',
  );

  await esbuild.build({
    entryPoints: [
      productsByClassificationJSONPath,
      componentsByProductIdJSONPath,
      componentsByProductNameJSONPath,
    ],
    bundle: true,
    format: 'esm',
    outdir: path.join(projectRoot, 'src/data'),
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
