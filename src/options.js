import { html, css, LitElement } from './vendor/lit.js';

import componentsByProductID from './data/componentsByProductID.js';
import productsByClassification from './data/productsByClassification.js';

const defaultClassificationID = '2'; // Client Software
const defaultProductID = '21'; // Firefox

export const classifications = [
  { name: 'Client Software', id: '2' },
  // { name: 'Developer Infrastructure', id: 7 },
  { name: 'Components', id: '3' },
  // { name: 'Server Software', id: 4 },
  // { name: 'Other', id: 5 },
];

export class Options extends LitElement {
  static styles = css`
    h3 {
      margin-bottom: 0.25em;
    }

    label {
      display: inline-block;
      margin: 0.5em 0 0.25em;
      width: 50%;
      font-weight: bold;
    }

    select {
      border: 1px solid #ccc;
      display: block;
      min-width: 100%;
    }

    input {
      display: inline-block;
      flex: 1;
      width: 100%;
      padding: 2px;
    }

    input:invalid {
      outline: 2px solid red;
    }

    .addTag {
      float: right;
    }

    .tagActions {
      clear: both;
    }

    .row {
      display: flex;
    }

    .help {
      margin-top: 0;
      clear: left;
      color: #999;
    }

    .error {
      color: red;
    }

    select {
      max-width: 100%;
    }

    .selectWrapper {
      width: 50%;
      float: left;
      padding-bottom: 1em;
    }

    .components {
      width: 100%;
    }

    #save-tags {
      float: right;
      margin: 0.5em 0;
    }

    button {
      min-width: 7em;
    }
  `;

  static properties = {
    _classifications: { statue: true, type: Array },
    _products: { state: true, type: Array },
    _components: { state: true, type: Array },
    _selectedProductID: { state: true, type: String },
    _selectedComponentID: { state: true, type: String },
    _selectedClassificationID: { state: true, type: String },
    _tagList: { state: true, type: Array },
  };

  constructor() {
    super();
    this._classifications = classifications;
    this._products = productsByClassification[defaultClassificationID].products;
    this._components = componentsByProductID[defaultProductID].components;
    this._selectedClassificationID = defaultClassificationID;
    this._selectedProductID = defaultProductID;
    this._selectedComponentID = null;
    this._tagList = [];
  }

  async getTagsForComponentID(componentID) {
    let result;
    if (this.isValidID(componentID)) {
      const tagKey = `tag_${componentID}`;
      result = await browser.storage.local.get(tagKey);
      return result[tagKey] || [];
    }
  }

  isValidID(id) {
    return !isNaN(parseInt(id, 10));
  }

  onClassificationChange(e) {
    this._selectedClassificationID = this.isValidID(e.target.value)
      ? e.target.value
      : defaultClassificationID;
    this._products =
      productsByClassification[this._selectedClassificationID]?.products || [];
    this._selectedProductID = null;
    this._components = [];
    this._selectedComponentID = null;
    this._tagList = [];
  }

  onProductChange(e) {
    this._selectedProductID = this.isValidID(e.target.value)
      ? e.target.value
      : null;
    this._components =
      componentsByProductID[this._selectedProductID]?.components || [];
    this._selectedComponentID = null;
    this._tagList = [];
  }

  async onComponentChange(e) {
    const value = e.target.value;
    const tags = await this.getTagsForComponentID(value);
    this._tagList = tags && tags.length ? this.filterTags(tags) : [''];
    this._selectedComponentID = this.isValidID(value) ? value : null;
  }

  filterTags(tagList) {
    const tagRx = /^\[[a-z0-9-_.]+\]$/;
    return tagList.filter((tag) => tagRx.test(tag));
  }

  onTagsSave() {
    const tagInputs = [
      ...(this.renderRoot?.querySelectorAll('input.tag') || []),
    ];
    const tagValues = tagInputs.map((input) => input.value);

    // We're expecting these to be valid, invalid tags will be filtered out.
    const newComponentTags = this.filterTags(tagValues);
    const tagKey = `tag_${this._selectedComponentID}`;

    // Store the data locally.
    browser.storage.local.set({ [tagKey]: newComponentTags });
  }

  addEmptyTag() {
    this._tagList.push('');
    this.requestUpdate();
  }

  removeTag(idx) {
    this._tagList.splice(idx, 1);
    this.requestUpdate();
  }

  renderAddButton() {
    return html`<button class="addTag" @click=${this.addEmptyTag}>
      ➕Add
    </button>`;
  }

  renderRemoveButton(idx) {
    return html`<button
      class="removeTag"
      @click=${() => {
        this.removeTag(idx);
      }}
    >
      🗑️ Delete
    </button>`;
  }

  render() {
    const selectSize = 5;

    return html` <h2>Options</h2>
      <h3>Whiteboard Tags</h3>
      <p class="help">
        Pick a product and component to edit the available tags for
      </p>

      <div class="classifications selectWrapper">
        <label for="product">Classification</label>
        <select
          size=${selectSize}
          id="classification"
          @change=${this.onClassificationChange}
        >
          ${this._classifications.map(
            (classification) =>
              html`<option
                value="${classification.id}"
                ?selected=${classification.id ===
                this._selectedClassificationID}
              >
                ${classification.name}
              </option>`,
          )}
        </select>
      </div>

      <div class="products selectWrapper">
        <label for="product">Product</label>
        <select size=${selectSize} id="product" @change=${this.onProductChange}>
          ${this._products.map(
            (product) =>
              html`<option
                value="${product.id}"
                ?selected=${product.id === this._selectedProductID}
              >
                ${product.name}
              </option>`,
          )}
        </select>
      </div>

      <div class="components selectWrapper">
        <label for="component">Component</label>
        <select
          size="${selectSize}"
          id="component"
          @change=${this.onComponentChange}
        >
          ${!this._components.length
            ? html`<option>Choose a product</option>`
            : ''}
          ${this._components.map(
            (component) =>
              html`<option
                value="${component.id}"
                ?selected=${component.id === this._selectedComponentID}
              >
                ${component.name}
              </option>`,
          )}
        </select>
      </div>

      ${!this._tagList.length
        ? html`<p class="help">Please select a component</p>`
        : html`<p class="help">
            Add or Edit whiteboard tags for
            "<code>${this._selectedProduct}/${this._selectedComponent}</code>"
            below:
          </p>`}
      ${this._tagList.map(
        (tag, idx) => html`<div class="row">
            <input
              class="tag"
              placeholder="[project-anything-else]"
              type="text"
              value=${tag}
              pattern="\\u{005B}[a-z0-9-_.]+\\u{005D}"
            />
            ${this._tagList.length > 1 ? this.renderRemoveButton(idx) : ''}
          </div>
          ${idx === this._tagList.length - 1 ? this.renderAddButton() : ''}`,
      )}
      ${this._tagList.length
        ? html`<div class="tagActions">
            <button
              id="saveTags"
              ?disabled=${!this._selectedComponentID}
              @click=${this.onTagsSave}
            >
              Save Whiteboard Tags
            </button>
          </div>`
        : ''}`;
  }
}

customElements.define('ext-options', Options);
