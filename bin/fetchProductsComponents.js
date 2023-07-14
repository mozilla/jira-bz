#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Fix for __dirname not being available to es modules.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../');

const productAPIURL = 'https://bugzilla.mozilla.org/rest/classification/';
const componentAPIURL = 'https://bugzilla.mozilla.org/rest/product/';

export const classifications = [
  { name: 'Client Software', id: 2 },
  { name: 'Developer Infrastructure', id: 7 },
  { name: 'Components', id: 3 },
  { name: 'Server Software', id: 4 },
  { name: 'Other', id: 5 },
];

async function main() {
  const productFetches = [];

  // Iterate over the data in classifications and fetch the products
  classifications.forEach((item) => {
    productFetches.push(fetch(`${productAPIURL}${parseInt(item.id, 10)}`));
  });

  const productResults = await Promise.all(productFetches);

  const productData = {};
  const componentFetches = [];

  for await (const json of productResults.map((response) => response.json())) {
    const result = json.classifications[0];

    const products = result.products.map((prod) => ({
      id: prod.id,
      name: prod.name,
    }));

    productData[result.name] = {
      id: result.id,
      products,
    };

    for (const product of products) {
      componentFetches.push(
        fetch(`${componentAPIURL}${parseInt(product.id, 10)}`),
      );
    }
  }

  const componentResults = await Promise.all(componentFetches);

  const componentData = {};
  for await (const json of componentResults.map((response) =>
    response.json(),
  )) {
    const result = json.products[0];

    // Include only the fields needed.
    const components = result.components.map((comp) => ({
      id: comp.id,
      name: comp.name,
    }));

    componentData[result.name] = {
      id: result.id,
      components,
    };
  }

  // Write out a Products JSON file in src/data/
  try {
    await writeFile(
      path.join(projectRoot, 'src/data/products.json'),
      JSON.stringify(productData, null, 2),
    );
  } catch (err) {
    console.error(err);
  }

  // Write out a Components JSON file in src/data/
  try {
    await writeFile(
      path.join(projectRoot, 'src/data/components.json'),
      JSON.stringify(componentData, null, 2),
    );
  } catch (err) {
    console.error(err);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
