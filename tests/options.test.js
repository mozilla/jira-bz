import { jest } from '@jest/globals';

import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/dom';
import { screen } from 'shadow-dom-testing-library';

import '../src/options.js';

const CLASSIFICATION_COMPONENTS = '3';
const PRODUCT_TOOLKIT = '30';
const COMPONENT_UI_WIDGETS = '487';

async function setClassificationSelect(classificationId) {
  const classificationSelect = await screen.findByShadowTestId(
    'classification',
    { shallow: true },
  );
  classificationSelect.value = classificationId;
  classificationSelect.dispatchEvent(new Event('change'));
  return classificationSelect;
}

async function setProductSelect(productId) {
  const productSelect = await screen.findByShadowTestId('product', {
    shallow: true,
  });
  productSelect.value = productId;
  productSelect.dispatchEvent(new Event('change'));
  return productSelect;
}

async function setComponentSelect(componentId) {
  const componentSelect = await screen.findByShadowTestId('component', {
    shallow: true,
  });
  componentSelect.value = componentId;
  componentSelect.dispatchEvent(new Event('change'));
  return componentSelect;
}

describe('Options', () => {
  let optionsElement;

  beforeEach(async () => {
    jest.resetModules();
    // Clear the doc in between tests.
    document.body.innerHTML = '';
    optionsElement = document.createElement('ext-options');
    document.body.appendChild(optionsElement);
    await optionsElement.updateComplete;
  });

  it('should render Classification, Product and Component Select Labels', async () => {
    expect(
      await screen.findByShadowLabelText('Classification', { shallow: true }),
    ).toBeInTheDocument();
    expect(
      await screen.findByShadowLabelText('Product', { shallow: true }),
    ).toBeInTheDocument();
    expect(
      await screen.findByShadowLabelText('Component', { shallow: true }),
    ).toBeInTheDocument();
  });

  it('should render Classification, Product and Component Selects', async () => {
    expect(
      await screen.findByShadowTestId('classification', { shallow: true }),
    ).toBeInTheDocument();
    expect(
      await screen.findByShadowTestId('product', { shallow: true }),
    ).toBeInTheDocument();
    expect(
      await screen.findByShadowTestId('component', { shallow: true }),
    ).toBeInTheDocument();
  });

  it('should update products by changing the classification', async () => {
    await setClassificationSelect(CLASSIFICATION_COMPONENTS);
    expect(await screen.findByShadowText(/Chat Core/)).toBeInTheDocument();
  });

  it('should update products and components by changing the classification and product', async () => {
    await setClassificationSelect(CLASSIFICATION_COMPONENTS);

    expect(await screen.findByShadowText(/Toolkit/)).toBeInTheDocument();

    await setProductSelect(PRODUCT_TOOLKIT);

    // Should be able to find the UI Widgets option
    expect(await screen.findByShadowText(/UI Widgets/)).toBeInTheDocument();
  });

  it('should request cache data for the relevant classification, product + component selection', async () => {
    await setClassificationSelect(CLASSIFICATION_COMPONENTS);
    expect(await screen.findByShadowText(/Toolkit/)).toBeInTheDocument();

    await setProductSelect(PRODUCT_TOOLKIT);
    // Should be able to find the UI Widgets option
    expect(await screen.findByShadowText(/UI Widgets/)).toBeInTheDocument();

    // Setup a response from the cache lookup.
    browser.storage.local.get.mockResolvedValue({
      tag_487: ['[project-whatever]'],
    });

    await setComponentSelect(COMPONENT_UI_WIDGETS);

    // mock browser.storage.local
    expect(browser.storage.local.get).toHaveBeenCalledWith('tag_487');
    expect(
      await screen.findByShadowDisplayValue('[project-whatever]'),
    ).toBeInTheDocument();
  });

  it('should store data to the cache when saved', async () => {
    await setClassificationSelect(CLASSIFICATION_COMPONENTS);
    expect(await screen.findByShadowText(/Toolkit/)).toBeInTheDocument();

    await setProductSelect(PRODUCT_TOOLKIT);
    // Should be able to find the UI Widgets option
    expect(await screen.findByShadowText(/UI Widgets/)).toBeInTheDocument();

    // Setup a response from the cache lookup.
    browser.storage.local.get.mockResolvedValue({
      tag_487: ['[project-whatever]'],
    });

    await setComponentSelect(COMPONENT_UI_WIDGETS);

    // mock browser.storage.local
    expect(browser.storage.local.get).toHaveBeenCalledWith('tag_487');
    expect(
      await screen.findByShadowDisplayValue('[project-whatever]'),
    ).toBeInTheDocument();

    const addButton = await screen.findByShadowText(/➕Add/);
    // Click the Add button to add a new input.
    addButton.dispatchEvent(new Event('click'));

    let newInputs;
    // Need to wait for the the second input to appear before we try to update its value.
    await waitFor(async () => {
      newInputs = await screen.findAllByShadowPlaceholderText(
        '[project-anything-else]',
      );
      expect(newInputs.length).toBe(2);
    });

    newInputs[1].value = '[project-something]';

    const saveButton = await screen.findByShadowText(/Save Whiteboard Tags/);
    saveButton.dispatchEvent(new Event('click'));

    expect(browser.storage.local.set).toHaveBeenCalledWith({
      tag_487: ['[project-whatever]', '[project-something]'],
    });
  });
});
