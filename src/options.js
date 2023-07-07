import { html, css, LitElement } from './vendor/lit.js';

import config from './shared/config.js';

const componentTags = config.COMPONENT_JIRA_WHITEBOARD_MAP;

export class Options extends LitElement {
  static properties = {
    _tagData: { state: true },
  };

  static styles = css`
    select {
      display: block;
    }

    textarea {
      min-height: 100px;
      width: 100%;
    }
  `;

  constructor() {
    super();
    this._tagData = '';
  }

  onChange = function (e) {
    this._tagData = componentTags[e.target.value].join('\n');
    console.log(this._tagData);
  };

  render() {
    return html`<h2>Options</h2>
      <h3>Whiteboard Tags</h3>

      <select
        id="component"
        @change=${{ handleEvent: (e) => this.onChange(e) }}
      >
        <option>Choose a component to edit whiteboard tags</option>
        ${Object.keys(componentTags).map(
          (key) => html`<option value="${key}">${key}</option>`,
        )}
      </select>

      <textarea>${this._tagData}</textarea>

      <p>Add a component (this should match the select string)</p>

      <input type="text" value="" />
      <button type="submit">Add Component</button>

      <hr />
      <button id="save">Save Settings</button> `;
  }
}

customElements.define('ext-options', Options);
