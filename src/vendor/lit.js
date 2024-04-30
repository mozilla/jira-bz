// node_modules/@lit/reactive-element/css-tag.js
var t = window;
var e =
  t.ShadowRoot &&
  (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) &&
  'adoptedStyleSheets' in Document.prototype &&
  'replace' in CSSStyleSheet.prototype;
var s = Symbol();
var n = /* @__PURE__ */ new WeakMap();
var o = class {
  constructor(t3, e4, n5) {
    if (((this._$cssResult$ = true), n5 !== s))
      throw Error(
        'CSSResult is not constructable. Use `unsafeCSS` or `css` instead.',
      );
    (this.cssText = t3), (this.t = e4);
  }
  get styleSheet() {
    let t3 = this.o;
    const s5 = this.t;
    if (e && void 0 === t3) {
      const e4 = void 0 !== s5 && 1 === s5.length;
      e4 && (t3 = n.get(s5)),
        void 0 === t3 &&
          ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText),
          e4 && n.set(s5, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t3) => new o('string' == typeof t3 ? t3 : t3 + '', void 0, s);
var i = (t3, ...e4) => {
  const n5 =
    1 === t3.length
      ? t3[0]
      : e4.reduce(
          (e5, s5, n6) =>
            e5 +
            ((t4) => {
              if (true === t4._$cssResult$) return t4.cssText;
              if ('number' == typeof t4) return t4;
              throw Error(
                "Value passed to 'css' function must be a 'css' function result: " +
                  t4 +
                  ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.",
              );
            })(s5) +
            t3[n6 + 1],
          t3[0],
        );
  return new o(n5, t3, s);
};
var S = (s5, n5) => {
  e
    ? (s5.adoptedStyleSheets = n5.map((t3) =>
        t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet,
      ))
    : n5.forEach((e4) => {
        const n6 = document.createElement('style'),
          o6 = t.litNonce;
        void 0 !== o6 && n6.setAttribute('nonce', o6),
          (n6.textContent = e4.cssText),
          s5.appendChild(n6);
      });
};
var c = e
  ? (t3) => t3
  : (t3) =>
      t3 instanceof CSSStyleSheet
        ? ((t4) => {
            let e4 = '';
            for (const s5 of t4.cssRules) e4 += s5.cssText;
            return r(e4);
          })(t3)
        : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var s2;
var e2 = window;
var r2 = e2.trustedTypes;
var h = r2 ? r2.emptyScript : '';
var o2 = e2.reactiveElementPolyfillSupport;
var n2 = {
  toAttribute(t3, i3) {
    switch (i3) {
      case Boolean:
        t3 = t3 ? h : null;
        break;
      case Object:
      case Array:
        t3 = null == t3 ? t3 : JSON.stringify(t3);
    }
    return t3;
  },
  fromAttribute(t3, i3) {
    let s5 = t3;
    switch (i3) {
      case Boolean:
        s5 = null !== t3;
        break;
      case Number:
        s5 = null === t3 ? null : Number(t3);
        break;
      case Object:
      case Array:
        try {
          s5 = JSON.parse(t3);
        } catch (t4) {
          s5 = null;
        }
    }
    return s5;
  },
};
var a = (t3, i3) => i3 !== t3 && (i3 == i3 || t3 == t3);
var l = {
  attribute: true,
  type: String,
  converter: n2,
  reflect: false,
  hasChanged: a,
};
var d = 'finalized';
var u = class extends HTMLElement {
  constructor() {
    super(),
      (this._$Ei = /* @__PURE__ */ new Map()),
      (this.isUpdatePending = false),
      (this.hasUpdated = false),
      (this._$El = null),
      this.u();
  }
  static addInitializer(t3) {
    var i3;
    this.finalize(),
      (null !== (i3 = this.h) && void 0 !== i3 ? i3 : (this.h = [])).push(t3);
  }
  static get observedAttributes() {
    this.finalize();
    const t3 = [];
    return (
      this.elementProperties.forEach((i3, s5) => {
        const e4 = this._$Ep(s5, i3);
        void 0 !== e4 && (this._$Ev.set(e4, s5), t3.push(e4));
      }),
      t3
    );
  }
  static createProperty(t3, i3 = l) {
    if (
      (i3.state && (i3.attribute = false),
      this.finalize(),
      this.elementProperties.set(t3, i3),
      !i3.noAccessor && !this.prototype.hasOwnProperty(t3))
    ) {
      const s5 = 'symbol' == typeof t3 ? Symbol() : '__' + t3,
        e4 = this.getPropertyDescriptor(t3, s5, i3);
      void 0 !== e4 && Object.defineProperty(this.prototype, t3, e4);
    }
  }
  static getPropertyDescriptor(t3, i3, s5) {
    return {
      get() {
        return this[i3];
      },
      set(e4) {
        const r5 = this[t3];
        (this[i3] = e4), this.requestUpdate(t3, r5, s5);
      },
      configurable: true,
      enumerable: true,
    };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) || l;
  }
  static finalize() {
    if (this.hasOwnProperty(d)) return false;
    this[d] = true;
    const t3 = Object.getPrototypeOf(this);
    if (
      (t3.finalize(),
      void 0 !== t3.h && (this.h = [...t3.h]),
      (this.elementProperties = new Map(t3.elementProperties)),
      (this._$Ev = /* @__PURE__ */ new Map()),
      this.hasOwnProperty('properties'))
    ) {
      const t4 = this.properties,
        i3 = [
          ...Object.getOwnPropertyNames(t4),
          ...Object.getOwnPropertySymbols(t4),
        ];
      for (const s5 of i3) this.createProperty(s5, t4[s5]);
    }
    return (this.elementStyles = this.finalizeStyles(this.styles)), true;
  }
  static finalizeStyles(i3) {
    const s5 = [];
    if (Array.isArray(i3)) {
      const e4 = new Set(i3.flat(1 / 0).reverse());
      for (const i4 of e4) s5.unshift(c(i4));
    } else void 0 !== i3 && s5.push(c(i3));
    return s5;
  }
  static _$Ep(t3, i3) {
    const s5 = i3.attribute;
    return false === s5
      ? void 0
      : 'string' == typeof s5
      ? s5
      : 'string' == typeof t3
      ? t3.toLowerCase()
      : void 0;
  }
  u() {
    var t3;
    (this._$E_ = new Promise((t4) => (this.enableUpdating = t4))),
      (this._$AL = /* @__PURE__ */ new Map()),
      this._$Eg(),
      this.requestUpdate(),
      null === (t3 = this.constructor.h) ||
        void 0 === t3 ||
        t3.forEach((t4) => t4(this));
  }
  addController(t3) {
    var i3, s5;
    (null !== (i3 = this._$ES) && void 0 !== i3 ? i3 : (this._$ES = [])).push(
      t3,
    ),
      void 0 !== this.renderRoot &&
        this.isConnected &&
        (null === (s5 = t3.hostConnected) || void 0 === s5 || s5.call(t3));
  }
  removeController(t3) {
    var i3;
    null === (i3 = this._$ES) ||
      void 0 === i3 ||
      i3.splice(this._$ES.indexOf(t3) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((t3, i3) => {
      this.hasOwnProperty(i3) && (this._$Ei.set(i3, this[i3]), delete this[i3]);
    });
  }
  createRenderRoot() {
    var t3;
    const s5 =
      null !== (t3 = this.shadowRoot) && void 0 !== t3
        ? t3
        : this.attachShadow(this.constructor.shadowRootOptions);
    return S(s5, this.constructor.elementStyles), s5;
  }
  connectedCallback() {
    var t3;
    void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()),
      this.enableUpdating(true),
      null === (t3 = this._$ES) ||
        void 0 === t3 ||
        t3.forEach((t4) => {
          var i3;
          return null === (i3 = t4.hostConnected) || void 0 === i3
            ? void 0
            : i3.call(t4);
        });
  }
  enableUpdating(t3) {}
  disconnectedCallback() {
    var t3;
    null === (t3 = this._$ES) ||
      void 0 === t3 ||
      t3.forEach((t4) => {
        var i3;
        return null === (i3 = t4.hostDisconnected) || void 0 === i3
          ? void 0
          : i3.call(t4);
      });
  }
  attributeChangedCallback(t3, i3, s5) {
    this._$AK(t3, s5);
  }
  _$EO(t3, i3, s5 = l) {
    var e4;
    const r5 = this.constructor._$Ep(t3, s5);
    if (void 0 !== r5 && true === s5.reflect) {
      const h4 = (
        void 0 !==
        (null === (e4 = s5.converter) || void 0 === e4
          ? void 0
          : e4.toAttribute)
          ? s5.converter
          : n2
      ).toAttribute(i3, s5.type);
      (this._$El = t3),
        null == h4 ? this.removeAttribute(r5) : this.setAttribute(r5, h4),
        (this._$El = null);
    }
  }
  _$AK(t3, i3) {
    var s5;
    const e4 = this.constructor,
      r5 = e4._$Ev.get(t3);
    if (void 0 !== r5 && this._$El !== r5) {
      const t4 = e4.getPropertyOptions(r5),
        h4 =
          'function' == typeof t4.converter
            ? { fromAttribute: t4.converter }
            : void 0 !==
              (null === (s5 = t4.converter) || void 0 === s5
                ? void 0
                : s5.fromAttribute)
            ? t4.converter
            : n2;
      (this._$El = r5),
        (this[r5] = h4.fromAttribute(i3, t4.type)),
        (this._$El = null);
    }
  }
  requestUpdate(t3, i3, s5) {
    let e4 = true;
    void 0 !== t3 &&
      (((s5 = s5 || this.constructor.getPropertyOptions(t3)).hasChanged || a)(
        this[t3],
        i3,
      )
        ? (this._$AL.has(t3) || this._$AL.set(t3, i3),
          true === s5.reflect &&
            this._$El !== t3 &&
            (void 0 === this._$EC && (this._$EC = /* @__PURE__ */ new Map()),
            this._$EC.set(t3, s5)))
        : (e4 = false)),
      !this.isUpdatePending && e4 && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = true;
    try {
      await this._$E_;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && (await t3), !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t3;
    if (!this.isUpdatePending) return;
    this.hasUpdated,
      this._$Ei &&
        (this._$Ei.forEach((t4, i4) => (this[i4] = t4)), (this._$Ei = void 0));
    let i3 = false;
    const s5 = this._$AL;
    try {
      (i3 = this.shouldUpdate(s5)),
        i3
          ? (this.willUpdate(s5),
            null === (t3 = this._$ES) ||
              void 0 === t3 ||
              t3.forEach((t4) => {
                var i4;
                return null === (i4 = t4.hostUpdate) || void 0 === i4
                  ? void 0
                  : i4.call(t4);
              }),
            this.update(s5))
          : this._$Ek();
    } catch (t4) {
      throw ((i3 = false), this._$Ek(), t4);
    }
    i3 && this._$AE(s5);
  }
  willUpdate(t3) {}
  _$AE(t3) {
    var i3;
    null === (i3 = this._$ES) ||
      void 0 === i3 ||
      i3.forEach((t4) => {
        var i4;
        return null === (i4 = t4.hostUpdated) || void 0 === i4
          ? void 0
          : i4.call(t4);
      }),
      this.hasUpdated || ((this.hasUpdated = true), this.firstUpdated(t3)),
      this.updated(t3);
  }
  _$Ek() {
    (this._$AL = /* @__PURE__ */ new Map()), (this.isUpdatePending = false);
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    void 0 !== this._$EC &&
      (this._$EC.forEach((t4, i3) => this._$EO(i3, this[i3], t4)),
      (this._$EC = void 0)),
      this._$Ek();
  }
  updated(t3) {}
  firstUpdated(t3) {}
};
(u[d] = true),
  (u.elementProperties = /* @__PURE__ */ new Map()),
  (u.elementStyles = []),
  (u.shadowRootOptions = { mode: 'open' }),
  null == o2 || o2({ ReactiveElement: u }),
  (null !== (s2 = e2.reactiveElementVersions) && void 0 !== s2
    ? s2
    : (e2.reactiveElementVersions = [])
  ).push('1.6.2');

// node_modules/lit-html/lit-html.js
var t2;
var i2 = window;
var s3 = i2.trustedTypes;
var e3 = s3 ? s3.createPolicy('lit-html', { createHTML: (t3) => t3 }) : void 0;
var o3 = '$lit$';
var n3 = `lit$${(Math.random() + '').slice(9)}$`;
var l2 = '?' + n3;
var h2 = `<${l2}>`;
var r3 = document;
var u2 = () => r3.createComment('');
var d2 = (t3) =>
  null === t3 || ('object' != typeof t3 && 'function' != typeof t3);
var c2 = Array.isArray;
var v = (t3) =>
  c2(t3) || 'function' == typeof (null == t3 ? void 0 : t3[Symbol.iterator]);
var a2 = '[ 	\n\f\r]';
var f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p = RegExp(
  `>|${a2}(?:([^\\s"'>=/]+)(${a2}*=${a2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,
  'g',
);
var g = /'/g;
var $ = /"/g;
var y = /^(?:script|style|textarea|title)$/i;
var w =
  (t3) =>
  (i3, ...s5) => ({ _$litType$: t3, strings: i3, values: s5 });
var x = w(1);
var b = w(2);
var T = Symbol.for('lit-noChange');
var A = Symbol.for('lit-nothing');
var E = /* @__PURE__ */ new WeakMap();
var C = r3.createTreeWalker(r3, 129, null, false);
function P(t3, i3) {
  if (!Array.isArray(t3) || !t3.hasOwnProperty('raw'))
    throw Error('invalid template strings array');
  return void 0 !== e3 ? e3.createHTML(i3) : i3;
}
var V = (t3, i3) => {
  const s5 = t3.length - 1,
    e4 = [];
  let l4,
    r5 = 2 === i3 ? '<svg>' : '',
    u3 = f;
  for (let i4 = 0; i4 < s5; i4++) {
    const s6 = t3[i4];
    let d3,
      c3,
      v2 = -1,
      a3 = 0;
    for (
      ;
      a3 < s6.length && ((u3.lastIndex = a3), (c3 = u3.exec(s6)), null !== c3);

    )
      (a3 = u3.lastIndex),
        u3 === f
          ? '!--' === c3[1]
            ? (u3 = _)
            : void 0 !== c3[1]
            ? (u3 = m)
            : void 0 !== c3[2]
            ? (y.test(c3[2]) && (l4 = RegExp('</' + c3[2], 'g')), (u3 = p))
            : void 0 !== c3[3] && (u3 = p)
          : u3 === p
          ? '>' === c3[0]
            ? ((u3 = null != l4 ? l4 : f), (v2 = -1))
            : void 0 === c3[1]
            ? (v2 = -2)
            : ((v2 = u3.lastIndex - c3[2].length),
              (d3 = c3[1]),
              (u3 = void 0 === c3[3] ? p : '"' === c3[3] ? $ : g))
          : u3 === $ || u3 === g
          ? (u3 = p)
          : u3 === _ || u3 === m
          ? (u3 = f)
          : ((u3 = p), (l4 = void 0));
    const w2 = u3 === p && t3[i4 + 1].startsWith('/>') ? ' ' : '';
    r5 +=
      u3 === f
        ? s6 + h2
        : v2 >= 0
        ? (e4.push(d3), s6.slice(0, v2) + o3 + s6.slice(v2) + n3 + w2)
        : s6 + n3 + (-2 === v2 ? (e4.push(void 0), i4) : w2);
  }
  return [P(t3, r5 + (t3[s5] || '<?>') + (2 === i3 ? '</svg>' : '')), e4];
};
var N = class _N {
  constructor({ strings: t3, _$litType$: i3 }, e4) {
    let h4;
    this.parts = [];
    let r5 = 0,
      d3 = 0;
    const c3 = t3.length - 1,
      v2 = this.parts,
      [a3, f2] = V(t3, i3);
    if (
      ((this.el = _N.createElement(a3, e4)),
      (C.currentNode = this.el.content),
      2 === i3)
    ) {
      const t4 = this.el.content,
        i4 = t4.firstChild;
      i4.remove(), t4.append(...i4.childNodes);
    }
    for (; null !== (h4 = C.nextNode()) && v2.length < c3; ) {
      if (1 === h4.nodeType) {
        if (h4.hasAttributes()) {
          const t4 = [];
          for (const i4 of h4.getAttributeNames())
            if (i4.endsWith(o3) || i4.startsWith(n3)) {
              const s5 = f2[d3++];
              if ((t4.push(i4), void 0 !== s5)) {
                const t5 = h4.getAttribute(s5.toLowerCase() + o3).split(n3),
                  i5 = /([.?@])?(.*)/.exec(s5);
                v2.push({
                  type: 1,
                  index: r5,
                  name: i5[2],
                  strings: t5,
                  ctor:
                    '.' === i5[1]
                      ? H
                      : '?' === i5[1]
                      ? L
                      : '@' === i5[1]
                      ? z
                      : k,
                });
              } else v2.push({ type: 6, index: r5 });
            }
          for (const i4 of t4) h4.removeAttribute(i4);
        }
        if (y.test(h4.tagName)) {
          const t4 = h4.textContent.split(n3),
            i4 = t4.length - 1;
          if (i4 > 0) {
            h4.textContent = s3 ? s3.emptyScript : '';
            for (let s5 = 0; s5 < i4; s5++)
              h4.append(t4[s5], u2()),
                C.nextNode(),
                v2.push({ type: 2, index: ++r5 });
            h4.append(t4[i4], u2());
          }
        }
      } else if (8 === h4.nodeType)
        if (h4.data === l2) v2.push({ type: 2, index: r5 });
        else {
          let t4 = -1;
          for (; -1 !== (t4 = h4.data.indexOf(n3, t4 + 1)); )
            v2.push({ type: 7, index: r5 }), (t4 += n3.length - 1);
        }
      r5++;
    }
  }
  static createElement(t3, i3) {
    const s5 = r3.createElement('template');
    return (s5.innerHTML = t3), s5;
  }
};
function S2(t3, i3, s5 = t3, e4) {
  var o6, n5, l4, h4;
  if (i3 === T) return i3;
  let r5 =
    void 0 !== e4
      ? null === (o6 = s5._$Co) || void 0 === o6
        ? void 0
        : o6[e4]
      : s5._$Cl;
  const u3 = d2(i3) ? void 0 : i3._$litDirective$;
  return (
    (null == r5 ? void 0 : r5.constructor) !== u3 &&
      (null === (n5 = null == r5 ? void 0 : r5._$AO) ||
        void 0 === n5 ||
        n5.call(r5, false),
      void 0 === u3 ? (r5 = void 0) : ((r5 = new u3(t3)), r5._$AT(t3, s5, e4)),
      void 0 !== e4
        ? ((null !== (l4 = (h4 = s5)._$Co) && void 0 !== l4
            ? l4
            : (h4._$Co = []))[e4] = r5)
        : (s5._$Cl = r5)),
    void 0 !== r5 && (i3 = S2(t3, r5._$AS(t3, i3.values), r5, e4)),
    i3
  );
}
var M = class {
  constructor(t3, i3) {
    (this._$AV = []), (this._$AN = void 0), (this._$AD = t3), (this._$AM = i3);
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    var i3;
    const {
        el: { content: s5 },
        parts: e4,
      } = this._$AD,
      o6 = (
        null !== (i3 = null == t3 ? void 0 : t3.creationScope) && void 0 !== i3
          ? i3
          : r3
      ).importNode(s5, true);
    C.currentNode = o6;
    let n5 = C.nextNode(),
      l4 = 0,
      h4 = 0,
      u3 = e4[0];
    for (; void 0 !== u3; ) {
      if (l4 === u3.index) {
        let i4;
        2 === u3.type
          ? (i4 = new R(n5, n5.nextSibling, this, t3))
          : 1 === u3.type
          ? (i4 = new u3.ctor(n5, u3.name, u3.strings, this, t3))
          : 6 === u3.type && (i4 = new Z(n5, this, t3)),
          this._$AV.push(i4),
          (u3 = e4[++h4]);
      }
      l4 !== (null == u3 ? void 0 : u3.index) && ((n5 = C.nextNode()), l4++);
    }
    return (C.currentNode = r3), o6;
  }
  v(t3) {
    let i3 = 0;
    for (const s5 of this._$AV)
      void 0 !== s5 &&
        (void 0 !== s5.strings
          ? (s5._$AI(t3, s5, i3), (i3 += s5.strings.length - 2))
          : s5._$AI(t3[i3])),
        i3++;
  }
};
var R = class _R {
  constructor(t3, i3, s5, e4) {
    var o6;
    (this.type = 2),
      (this._$AH = A),
      (this._$AN = void 0),
      (this._$AA = t3),
      (this._$AB = i3),
      (this._$AM = s5),
      (this.options = e4),
      (this._$Cp =
        null === (o6 = null == e4 ? void 0 : e4.isConnected) ||
        void 0 === o6 ||
        o6);
  }
  get _$AU() {
    var t3, i3;
    return null !==
      (i3 = null === (t3 = this._$AM) || void 0 === t3 ? void 0 : t3._$AU) &&
      void 0 !== i3
      ? i3
      : this._$Cp;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i3 = this._$AM;
    return (
      void 0 !== i3 &&
        11 === (null == t3 ? void 0 : t3.nodeType) &&
        (t3 = i3.parentNode),
      t3
    );
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i3 = this) {
    (t3 = S2(this, t3, i3)),
      d2(t3)
        ? t3 === A || null == t3 || '' === t3
          ? (this._$AH !== A && this._$AR(), (this._$AH = A))
          : t3 !== this._$AH && t3 !== T && this._(t3)
        : void 0 !== t3._$litType$
        ? this.g(t3)
        : void 0 !== t3.nodeType
        ? this.$(t3)
        : v(t3)
        ? this.T(t3)
        : this._(t3);
  }
  k(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  $(t3) {
    this._$AH !== t3 && (this._$AR(), (this._$AH = this.k(t3)));
  }
  _(t3) {
    this._$AH !== A && d2(this._$AH)
      ? (this._$AA.nextSibling.data = t3)
      : this.$(r3.createTextNode(t3)),
      (this._$AH = t3);
  }
  g(t3) {
    var i3;
    const { values: s5, _$litType$: e4 } = t3,
      o6 =
        'number' == typeof e4
          ? this._$AC(t3)
          : (void 0 === e4.el &&
              (e4.el = N.createElement(P(e4.h, e4.h[0]), this.options)),
            e4);
    if ((null === (i3 = this._$AH) || void 0 === i3 ? void 0 : i3._$AD) === o6)
      this._$AH.v(s5);
    else {
      const t4 = new M(o6, this),
        i4 = t4.u(this.options);
      t4.v(s5), this.$(i4), (this._$AH = t4);
    }
  }
  _$AC(t3) {
    let i3 = E.get(t3.strings);
    return void 0 === i3 && E.set(t3.strings, (i3 = new N(t3))), i3;
  }
  T(t3) {
    c2(this._$AH) || ((this._$AH = []), this._$AR());
    const i3 = this._$AH;
    let s5,
      e4 = 0;
    for (const o6 of t3)
      e4 === i3.length
        ? i3.push((s5 = new _R(this.k(u2()), this.k(u2()), this, this.options)))
        : (s5 = i3[e4]),
        s5._$AI(o6),
        e4++;
    e4 < i3.length &&
      (this._$AR(s5 && s5._$AB.nextSibling, e4), (i3.length = e4));
  }
  _$AR(t3 = this._$AA.nextSibling, i3) {
    var s5;
    for (
      null === (s5 = this._$AP) ||
      void 0 === s5 ||
      s5.call(this, false, true, i3);
      t3 && t3 !== this._$AB;

    ) {
      const i4 = t3.nextSibling;
      t3.remove(), (t3 = i4);
    }
  }
  setConnected(t3) {
    var i3;
    void 0 === this._$AM &&
      ((this._$Cp = t3),
      null === (i3 = this._$AP) || void 0 === i3 || i3.call(this, t3));
  }
};
var k = class {
  constructor(t3, i3, s5, e4, o6) {
    (this.type = 1),
      (this._$AH = A),
      (this._$AN = void 0),
      (this.element = t3),
      (this.name = i3),
      (this._$AM = e4),
      (this.options = o6),
      s5.length > 2 || '' !== s5[0] || '' !== s5[1]
        ? ((this._$AH = Array(s5.length - 1).fill(new String())),
          (this.strings = s5))
        : (this._$AH = A);
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3, i3 = this, s5, e4) {
    const o6 = this.strings;
    let n5 = false;
    if (void 0 === o6)
      (t3 = S2(this, t3, i3, 0)),
        (n5 = !d2(t3) || (t3 !== this._$AH && t3 !== T)),
        n5 && (this._$AH = t3);
    else {
      const e5 = t3;
      let l4, h4;
      for (t3 = o6[0], l4 = 0; l4 < o6.length - 1; l4++)
        (h4 = S2(this, e5[s5 + l4], i3, l4)),
          h4 === T && (h4 = this._$AH[l4]),
          n5 || (n5 = !d2(h4) || h4 !== this._$AH[l4]),
          h4 === A
            ? (t3 = A)
            : t3 !== A && (t3 += (null != h4 ? h4 : '') + o6[l4 + 1]),
          (this._$AH[l4] = h4);
    }
    n5 && !e4 && this.j(t3);
  }
  j(t3) {
    t3 === A
      ? this.element.removeAttribute(this.name)
      : this.element.setAttribute(this.name, null != t3 ? t3 : '');
  }
};
var H = class extends k {
  constructor() {
    super(...arguments), (this.type = 3);
  }
  j(t3) {
    this.element[this.name] = t3 === A ? void 0 : t3;
  }
};
var I = s3 ? s3.emptyScript : '';
var L = class extends k {
  constructor() {
    super(...arguments), (this.type = 4);
  }
  j(t3) {
    t3 && t3 !== A
      ? this.element.setAttribute(this.name, I)
      : this.element.removeAttribute(this.name);
  }
};
var z = class extends k {
  constructor(t3, i3, s5, e4, o6) {
    super(t3, i3, s5, e4, o6), (this.type = 5);
  }
  _$AI(t3, i3 = this) {
    var s5;
    if (
      (t3 = null !== (s5 = S2(this, t3, i3, 0)) && void 0 !== s5 ? s5 : A) === T
    )
      return;
    const e4 = this._$AH,
      o6 =
        (t3 === A && e4 !== A) ||
        t3.capture !== e4.capture ||
        t3.once !== e4.once ||
        t3.passive !== e4.passive,
      n5 = t3 !== A && (e4 === A || o6);
    o6 && this.element.removeEventListener(this.name, this, e4),
      n5 && this.element.addEventListener(this.name, this, t3),
      (this._$AH = t3);
  }
  handleEvent(t3) {
    var i3, s5;
    'function' == typeof this._$AH
      ? this._$AH.call(
          null !==
            (s5 =
              null === (i3 = this.options) || void 0 === i3
                ? void 0
                : i3.host) && void 0 !== s5
            ? s5
            : this.element,
          t3,
        )
      : this._$AH.handleEvent(t3);
  }
};
var Z = class {
  constructor(t3, i3, s5) {
    (this.element = t3),
      (this.type = 6),
      (this._$AN = void 0),
      (this._$AM = i3),
      (this.options = s5);
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    S2(this, t3);
  }
};
var j = {
  O: o3,
  P: n3,
  A: l2,
  C: 1,
  M: V,
  L: M,
  D: v,
  R: S2,
  I: R,
  V: k,
  H: L,
  N: z,
  U: H,
  F: Z,
};
var B = i2.litHtmlPolyfillSupport;
null == B || B(N, R),
  (null !== (t2 = i2.litHtmlVersions) && void 0 !== t2
    ? t2
    : (i2.litHtmlVersions = [])
  ).push('2.7.5');
var D = (t3, i3, s5) => {
  var e4, o6;
  const n5 =
    null !== (e4 = null == s5 ? void 0 : s5.renderBefore) && void 0 !== e4
      ? e4
      : i3;
  let l4 = n5._$litPart$;
  if (void 0 === l4) {
    const t4 =
      null !== (o6 = null == s5 ? void 0 : s5.renderBefore) && void 0 !== o6
        ? o6
        : null;
    n5._$litPart$ = l4 = new R(
      i3.insertBefore(u2(), t4),
      t4,
      void 0,
      null != s5 ? s5 : {},
    );
  }
  return l4._$AI(t3), l4;
};

// node_modules/lit-element/lit-element.js
var l3;
var o4;
var r4 = u;
var s4 = class extends u {
  constructor() {
    super(...arguments),
      (this.renderOptions = { host: this }),
      (this._$Do = void 0);
  }
  createRenderRoot() {
    var t3, e4;
    const i3 = super.createRenderRoot();
    return (
      (null !== (t3 = (e4 = this.renderOptions).renderBefore) &&
        void 0 !== t3) ||
        (e4.renderBefore = i3.firstChild),
      i3
    );
  }
  update(t3) {
    const i3 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected),
      super.update(t3),
      (this._$Do = D(i3, this.renderRoot, this.renderOptions));
  }
  connectedCallback() {
    var t3;
    super.connectedCallback(),
      null === (t3 = this._$Do) || void 0 === t3 || t3.setConnected(true);
  }
  disconnectedCallback() {
    var t3;
    super.disconnectedCallback(),
      null === (t3 = this._$Do) || void 0 === t3 || t3.setConnected(false);
  }
  render() {
    return T;
  }
};
(s4.finalized = true),
  (s4._$litElement$ = true),
  null === (l3 = globalThis.litElementHydrateSupport) ||
    void 0 === l3 ||
    l3.call(globalThis, { LitElement: s4 });
var n4 = globalThis.litElementPolyfillSupport;
null == n4 || n4({ LitElement: s4 });
var h3 = {
  _$AK: (t3, e4, i3) => {
    t3._$AK(e4, i3);
  },
  _$AL: (t3) => t3._$AL,
};
(null !== (o4 = globalThis.litElementVersions) && void 0 !== o4
  ? o4
  : (globalThis.litElementVersions = [])
).push('3.3.2');

// node_modules/lit-html/is-server.js
var o5 = false;
export {
  o as CSSResult,
  s4 as LitElement,
  u as ReactiveElement,
  r4 as UpdatingElement,
  h3 as _$LE,
  j as _$LH,
  S as adoptStyles,
  i as css,
  n2 as defaultConverter,
  c as getCompatibleStyle,
  x as html,
  o5 as isServer,
  T as noChange,
  a as notEqual,
  A as nothing,
  D as render,
  e as supportsAdoptingStyleSheets,
  b as svg,
  r as unsafeCSS,
};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
