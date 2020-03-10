/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const t=new WeakMap,e=e=>"function"==typeof e&&t.has(e),n=void 0!==window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(t,e,n=null)=>{for(;e!==n;){const n=e.nextSibling;t.removeChild(e),e=n}},o={},s={},r=`{{lit-${String(Math.random()).slice(2)}}}`,a=`\x3c!--${r}--\x3e`,l=new RegExp(`${r}|${a}`);class c{constructor(t,e){this.parts=[],this.element=e;const n=[],i=[],o=document.createTreeWalker(e.content,133,null,!1);let s=0,a=-1,c=0;const{strings:h,values:{length:m}}=t;for(;c<m;){const t=o.nextNode();if(null!==t){if(a++,1===t.nodeType){if(t.hasAttributes()){const e=t.attributes,{length:n}=e;let i=0;for(let t=0;t<n;t++)d(e[t].name,"$lit$")&&i++;for(;i-- >0;){const e=h[c],n=p.exec(e)[2],i=n.toLowerCase()+"$lit$",o=t.getAttribute(i);t.removeAttribute(i);const s=o.split(l);this.parts.push({type:"attribute",index:a,name:n,strings:s}),c+=s.length-1}}"TEMPLATE"===t.tagName&&(i.push(t),o.currentNode=t.content)}else if(3===t.nodeType){const e=t.data;if(e.indexOf(r)>=0){const i=t.parentNode,o=e.split(l),s=o.length-1;for(let e=0;e<s;e++){let n,s=o[e];if(""===s)n=u();else{const t=p.exec(s);null!==t&&d(t[2],"$lit$")&&(s=s.slice(0,t.index)+t[1]+t[2].slice(0,-"$lit$".length)+t[3]),n=document.createTextNode(s)}i.insertBefore(n,t),this.parts.push({type:"node",index:++a})}""===o[s]?(i.insertBefore(u(),t),n.push(t)):t.data=o[s],c+=s}}else if(8===t.nodeType)if(t.data===r){const e=t.parentNode;null!==t.previousSibling&&a!==s||(a++,e.insertBefore(u(),t)),s=a,this.parts.push({type:"node",index:a}),null===t.nextSibling?t.data="":(n.push(t),a--),c++}else{let e=-1;for(;-1!==(e=t.data.indexOf(r,e+1));)this.parts.push({type:"node",index:-1}),c++}}else o.currentNode=i.pop()}for(const t of n)t.parentNode.removeChild(t)}}const d=(t,e)=>{const n=t.length-e.length;return n>=0&&t.slice(n)===e},h=t=>-1!==t.index,u=()=>document.createComment(""),p=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class m{constructor(t,e,n){this.__parts=[],this.template=t,this.processor=e,this.options=n}update(t){let e=0;for(const n of this.__parts)void 0!==n&&n.setValue(t[e]),e++;for(const t of this.__parts)void 0!==t&&t.commit()}_clone(){const t=n?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),e=[],i=this.template.parts,o=document.createTreeWalker(t,133,null,!1);let s,r=0,a=0,l=o.nextNode();for(;r<i.length;)if(s=i[r],h(s)){for(;a<s.index;)a++,"TEMPLATE"===l.nodeName&&(e.push(l),o.currentNode=l.content),null===(l=o.nextNode())&&(o.currentNode=e.pop(),l=o.nextNode());if("node"===s.type){const t=this.processor.handleTextExpression(this.options);t.insertAfterNode(l.previousSibling),this.__parts.push(t)}else this.__parts.push(...this.processor.handleAttributeExpressions(l,s.name,s.strings,this.options));r++}else this.__parts.push(void 0),r++;return n&&(document.adoptNode(t),customElements.upgrade(t)),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const f=` ${r} `;class g{constructor(t,e,n,i){this.strings=t,this.values=e,this.type=n,this.processor=i}getHTML(){const t=this.strings.length-1;let e="",n=!1;for(let i=0;i<t;i++){const t=this.strings[i],o=t.lastIndexOf("\x3c!--");n=(o>-1||n)&&-1===t.indexOf("--\x3e",o+1);const s=p.exec(t);e+=null===s?t+(n?f:a):t.substr(0,s.index)+s[1]+s[2]+"$lit$"+s[3]+r}return e+=this.strings[t],e}getTemplateElement(){const t=document.createElement("template");return t.innerHTML=this.getHTML(),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const y=t=>null===t||!("object"==typeof t||"function"==typeof t),_=t=>Array.isArray(t)||!(!t||!t[Symbol.iterator]);class S{constructor(t,e,n){this.dirty=!0,this.element=t,this.name=e,this.strings=n,this.parts=[];for(let t=0;t<n.length-1;t++)this.parts[t]=this._createPart()}_createPart(){return new v(this)}_getValue(){const t=this.strings,e=t.length-1;let n="";for(let i=0;i<e;i++){n+=t[i];const e=this.parts[i];if(void 0!==e){const t=e.value;if(y(t)||!_(t))n+="string"==typeof t?t:String(t);else for(const e of t)n+="string"==typeof e?e:String(e)}}return n+=t[e],n}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class v{constructor(t){this.value=void 0,this.committer=t}setValue(t){t===o||y(t)&&t===this.value||(this.value=t,e(t)||(this.committer.dirty=!0))}commit(){for(;e(this.value);){const t=this.value;this.value=o,t(this)}this.value!==o&&this.committer.commit()}}class b{constructor(t){this.value=void 0,this.__pendingValue=void 0,this.options=t}appendInto(t){this.startNode=t.appendChild(u()),this.endNode=t.appendChild(u())}insertAfterNode(t){this.startNode=t,this.endNode=t.nextSibling}appendIntoPart(t){t.__insert(this.startNode=u()),t.__insert(this.endNode=u())}insertAfterPart(t){t.__insert(this.startNode=u()),this.endNode=t.endNode,t.endNode=this.startNode}setValue(t){this.__pendingValue=t}commit(){for(;e(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=o,t(this)}const t=this.__pendingValue;t!==o&&(y(t)?t!==this.value&&this.__commitText(t):t instanceof g?this.__commitTemplateResult(t):t instanceof Node?this.__commitNode(t):_(t)?this.__commitIterable(t):t===s?(this.value=s,this.clear()):this.__commitText(t))}__insert(t){this.endNode.parentNode.insertBefore(t,this.endNode)}__commitNode(t){this.value!==t&&(this.clear(),this.__insert(t),this.value=t)}__commitText(t){const e=this.startNode.nextSibling,n="string"==typeof(t=null==t?"":t)?t:String(t);e===this.endNode.previousSibling&&3===e.nodeType?e.data=n:this.__commitNode(document.createTextNode(n)),this.value=t}__commitTemplateResult(t){const e=this.options.templateFactory(t);if(this.value instanceof m&&this.value.template===e)this.value.update(t.values);else{const n=new m(e,t.processor,this.options),i=n._clone();n.update(t.values),this.__commitNode(i),this.value=n}}__commitIterable(t){Array.isArray(this.value)||(this.value=[],this.clear());const e=this.value;let n,i=0;for(const o of t)n=e[i],void 0===n&&(n=new b(this.options),e.push(n),0===i?n.appendIntoPart(this):n.insertAfterPart(e[i-1])),n.setValue(o),n.commit(),i++;i<e.length&&(e.length=i,this.clear(n&&n.endNode))}clear(t=this.startNode){i(this.startNode.parentNode,t.nextSibling,this.endNode)}}class w{constructor(t,e,n){if(this.value=void 0,this.__pendingValue=void 0,2!==n.length||""!==n[0]||""!==n[1])throw new Error("Boolean attributes can only contain a single expression");this.element=t,this.name=e,this.strings=n}setValue(t){this.__pendingValue=t}commit(){for(;e(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=o,t(this)}if(this.__pendingValue===o)return;const t=!!this.__pendingValue;this.value!==t&&(t?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=t),this.__pendingValue=o}}class x extends S{constructor(t,e,n){super(t,e,n),this.single=2===n.length&&""===n[0]&&""===n[1]}_createPart(){return new C(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class C extends v{}let k=!1;try{const t={get capture(){return k=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}class M{constructor(t,e,n){this.value=void 0,this.__pendingValue=void 0,this.element=t,this.eventName=e,this.eventContext=n,this.__boundHandleEvent=t=>this.handleEvent(t)}setValue(t){this.__pendingValue=t}commit(){for(;e(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=o,t(this)}if(this.__pendingValue===o)return;const t=this.__pendingValue,n=this.value,i=null==t||null!=n&&(t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive),s=null!=t&&(null==n||i);i&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),s&&(this.__options=N(t),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=t,this.__pendingValue=o}handleEvent(t){"function"==typeof this.value?this.value.call(this.eventContext||this.element,t):this.value.handleEvent(t)}}const N=t=>t&&(k?{capture:t.capture,passive:t.passive,once:t.once}:t.capture)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */;const P=new class{handleAttributeExpressions(t,e,n,i){const o=e[0];if("."===o){return new x(t,e.slice(1),n).parts}return"@"===o?[new M(t,e.slice(1),i.eventContext)]:"?"===o?[new w(t,e.slice(1),n)]:new S(t,e,n).parts}handleTextExpression(t){return new b(t)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */function E(t){let e=A.get(t.type);void 0===e&&(e={stringsArray:new WeakMap,keyString:new Map},A.set(t.type,e));let n=e.stringsArray.get(t.strings);if(void 0!==n)return n;const i=t.strings.join(r);return n=e.keyString.get(i),void 0===n&&(n=new c(t,t.getTemplateElement()),e.keyString.set(i,n)),e.stringsArray.set(t.strings,n),n}const A=new Map,T=new WeakMap;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.1.2");const q=(t,...e)=>new g(t,e,"html",P)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */;function R(t,e){const{element:{content:n},parts:i}=t,o=document.createTreeWalker(n,133,null,!1);let s=F(i),r=i[s],a=-1,l=0;const c=[];let d=null;for(;o.nextNode();){a++;const t=o.currentNode;for(t.previousSibling===d&&(d=null),e.has(t)&&(c.push(t),null===d&&(d=t)),null!==d&&l++;void 0!==r&&r.index===a;)r.index=null!==d?-1:r.index-l,s=F(i,s),r=i[s]}c.forEach(t=>t.parentNode.removeChild(t))}const D=t=>{let e=11===t.nodeType?0:1;const n=document.createTreeWalker(t,133,null,!1);for(;n.nextNode();)e++;return e},F=(t,e=-1)=>{for(let n=e+1;n<t.length;n++){const e=t[n];if(h(e))return n}return-1};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const $=(t,e)=>`${t}--${e}`;let V=!0;void 0===window.ShadyCSS?V=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),V=!1);const O=t=>e=>{const n=$(e.type,t);let i=A.get(n);void 0===i&&(i={stringsArray:new WeakMap,keyString:new Map},A.set(n,i));let o=i.stringsArray.get(e.strings);if(void 0!==o)return o;const s=e.strings.join(r);if(o=i.keyString.get(s),void 0===o){const n=e.getTemplateElement();V&&window.ShadyCSS.prepareTemplateDom(n,t),o=new c(e,n),i.keyString.set(s,o)}return i.stringsArray.set(e.strings,o),o},H=["html","svg"],Y=new Set,U=(t,e,n)=>{Y.add(t);const i=n?n.element:document.createElement("template"),o=e.querySelectorAll("style"),{length:s}=o;if(0===s)return void window.ShadyCSS.prepareTemplateStyles(i,t);const r=document.createElement("style");for(let t=0;t<s;t++){const e=o[t];e.parentNode.removeChild(e),r.textContent+=e.textContent}(t=>{H.forEach(e=>{const n=A.get($(e,t));void 0!==n&&n.keyString.forEach(t=>{const{element:{content:e}}=t,n=new Set;Array.from(e.querySelectorAll("style")).forEach(t=>{n.add(t)}),R(t,n)})})})(t);const a=i.content;n?function(t,e,n=null){const{element:{content:i},parts:o}=t;if(null==n)return void i.appendChild(e);const s=document.createTreeWalker(i,133,null,!1);let r=F(o),a=0,l=-1;for(;s.nextNode();){for(l++,s.currentNode===n&&(a=D(e),n.parentNode.insertBefore(e,n));-1!==r&&o[r].index===l;){if(a>0){for(;-1!==r;)o[r].index+=a,r=F(o,r);return}r=F(o,r)}}}(n,r,a.firstChild):a.insertBefore(r,a.firstChild),window.ShadyCSS.prepareTemplateStyles(i,t);const l=a.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==l)e.insertBefore(l.cloneNode(!0),e.firstChild);else if(n){a.insertBefore(r,a.firstChild);const t=new Set;t.add(r),R(n,t)}};window.JSCompiler_renameProperty=(t,e)=>t;const z={toAttribute(t,e){switch(e){case Boolean:return t?"":null;case Object:case Array:return null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){switch(e){case Boolean:return null!==t;case Number:return null===t?null:Number(t);case Object:case Array:return JSON.parse(t)}return t}},L=(t,e)=>e!==t&&(e==e||t==t),I={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:L},W=Promise.resolve(!0);class j extends HTMLElement{constructor(){super(),this._updateState=0,this._instanceProperties=void 0,this._updatePromise=W,this._hasConnectedResolver=void 0,this._changedProperties=new Map,this._reflectingProperties=void 0,this.initialize()}static get observedAttributes(){this.finalize();const t=[];return this._classProperties.forEach((e,n)=>{const i=this._attributeNameForProperty(n,e);void 0!==i&&(this._attributeToPropertyMap.set(i,n),t.push(i))}),t}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const t=Object.getPrototypeOf(this)._classProperties;void 0!==t&&t.forEach((t,e)=>this._classProperties.set(e,t))}}static createProperty(t,e=I){if(this._ensureClassProperties(),this._classProperties.set(t,e),e.noAccessor||this.prototype.hasOwnProperty(t))return;const n="symbol"==typeof t?Symbol():`__${t}`;Object.defineProperty(this.prototype,t,{get(){return this[n]},set(e){const i=this[t];this[n]=e,this._requestUpdate(t,i)},configurable:!0,enumerable:!0})}static finalize(){const t=Object.getPrototypeOf(this);if(t.hasOwnProperty("finalized")||t.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const t=this.properties,e=[...Object.getOwnPropertyNames(t),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(t):[]];for(const n of e)this.createProperty(n,t[n])}}static _attributeNameForProperty(t,e){const n=e.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof t?t.toLowerCase():void 0}static _valueHasChanged(t,e,n=L){return n(t,e)}static _propertyValueFromAttribute(t,e){const n=e.type,i=e.converter||z,o="function"==typeof i?i:i.fromAttribute;return o?o(t,n):t}static _propertyValueToAttribute(t,e){if(void 0===e.reflect)return;const n=e.type,i=e.converter;return(i&&i.toAttribute||z.toAttribute)(t,n)}initialize(){this._saveInstanceProperties(),this._requestUpdate()}_saveInstanceProperties(){this.constructor._classProperties.forEach((t,e)=>{if(this.hasOwnProperty(e)){const t=this[e];delete this[e],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(e,t)}})}_applyInstanceProperties(){this._instanceProperties.forEach((t,e)=>this[e]=t),this._instanceProperties=void 0}connectedCallback(){this._updateState=32|this._updateState,this._hasConnectedResolver&&(this._hasConnectedResolver(),this._hasConnectedResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(t,e,n){e!==n&&this._attributeToProperty(t,n)}_propertyToAttribute(t,e,n=I){const i=this.constructor,o=i._attributeNameForProperty(t,n);if(void 0!==o){const t=i._propertyValueToAttribute(e,n);if(void 0===t)return;this._updateState=8|this._updateState,null==t?this.removeAttribute(o):this.setAttribute(o,t),this._updateState=-9&this._updateState}}_attributeToProperty(t,e){if(8&this._updateState)return;const n=this.constructor,i=n._attributeToPropertyMap.get(t);if(void 0!==i){const t=n._classProperties.get(i)||I;this._updateState=16|this._updateState,this[i]=n._propertyValueFromAttribute(e,t),this._updateState=-17&this._updateState}}_requestUpdate(t,e){let n=!0;if(void 0!==t){const i=this.constructor,o=i._classProperties.get(t)||I;i._valueHasChanged(this[t],e,o.hasChanged)?(this._changedProperties.has(t)||this._changedProperties.set(t,e),!0!==o.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(t,o))):n=!1}!this._hasRequestedUpdate&&n&&this._enqueueUpdate()}requestUpdate(t,e){return this._requestUpdate(t,e),this.updateComplete}async _enqueueUpdate(){let t,e;this._updateState=4|this._updateState;const n=this._updatePromise;this._updatePromise=new Promise((n,i)=>{t=n,e=i});try{await n}catch(t){}this._hasConnected||await new Promise(t=>this._hasConnectedResolver=t);try{const t=this.performUpdate();null!=t&&await t}catch(t){e(t)}t(!this._hasRequestedUpdate)}get _hasConnected(){return 32&this._updateState}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){this._instanceProperties&&this._applyInstanceProperties();let t=!1;const e=this._changedProperties;try{t=this.shouldUpdate(e),t&&this.update(e)}catch(e){throw t=!1,e}finally{this._markUpdated()}t&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(e)),this.updated(e))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this._updatePromise}shouldUpdate(t){return!0}update(t){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((t,e)=>this._propertyToAttribute(e,this[e],t)),this._reflectingProperties=void 0)}updated(t){}firstUpdated(t){}}j.finalized=!0;
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const B="adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,J=Symbol();class Z{constructor(t,e){if(e!==J)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return void 0===this._styleSheet&&(B?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const G=(t,...e)=>{const n=e.reduce((e,n,i)=>e+(t=>{if(t instanceof Z)return t.cssText;if("number"==typeof t)return t;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${t}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(n)+t[i+1],t[0]);return new Z(n,J)};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litElementVersions||(window.litElementVersions=[])).push("2.2.1");const K=t=>t.flat?t.flat(1/0):function t(e,n=[]){for(let i=0,o=e.length;i<o;i++){const o=e[i];Array.isArray(o)?t(o,n):n.push(o)}return n}(t);class Q extends j{static finalize(){super.finalize.call(this),this._styles=this.hasOwnProperty(JSCompiler_renameProperty("styles",this))?this._getUniqueStyles():this._styles||[]}static _getUniqueStyles(){const t=this.styles,e=[];if(Array.isArray(t)){K(t).reduceRight((t,e)=>(t.add(e),t),new Set).forEach(t=>e.unshift(t))}else t&&e.push(t);return e}initialize(){super.initialize(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow({mode:"open"})}adoptStyles(){const t=this.constructor._styles;0!==t.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?B?this.renderRoot.adoptedStyleSheets=t.map(t=>t.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(t.map(t=>t.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(t){super.update(t);const e=this.render();e instanceof g&&this.constructor.render(e,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(t=>{const e=document.createElement("style");e.textContent=t.cssText,this.renderRoot.appendChild(e)}))}render(){}}function X(){return document.querySelector("hc-main")?document.querySelector("hc-main").hass:document.querySelector("home-assistant")?document.querySelector("home-assistant").hass:void 0}function tt(t,e,n=null){if((t=new Event(t,{bubbles:!0,cancelable:!1,composed:!0})).detail=e||{},n)n.dispatchEvent(t);else{var i=function(){var t=document.querySelector("hc-main");return t=t?(t=(t=(t=t&&t.shadowRoot)&&t.querySelector("hc-lovelace"))&&t.shadowRoot)&&t.querySelector("hui-view"):(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=document.querySelector("home-assistant"))&&t.shadowRoot)&&t.querySelector("home-assistant-main"))&&t.shadowRoot)&&t.querySelector("app-drawer-layout partial-panel-resolver"))&&t.shadowRoot||t)&&t.querySelector("ha-panel-lovelace"))&&t.shadowRoot)&&t.querySelector("hui-root"))&&t.shadowRoot)&&t.querySelector("ha-app-layout #view"))&&t.firstElementChild}();i&&i.dispatchEvent(t)}}Q.finalized=!0,Q.render=(t,e,n)=>{if(!n||"object"!=typeof n||!n.scopeName)throw new Error("The `scopeName` option is required.");const o=n.scopeName,s=T.has(e),r=V&&11===e.nodeType&&!!e.host,a=r&&!Y.has(o),l=a?document.createDocumentFragment():e;if(((t,e,n)=>{let o=T.get(e);void 0===o&&(i(e,e.firstChild),T.set(e,o=new b(Object.assign({templateFactory:E},n))),o.appendInto(e)),o.setValue(t),o.commit()})(t,l,Object.assign({templateFactory:O(o)},n)),a){const t=T.get(l);T.delete(l);const n=t.value instanceof m?t.value.template:void 0;U(o,l,n),i(e,e.firstChild),e.appendChild(l),T.set(e,t)}!s&&r&&window.ShadyCSS.styleElement(e.host)};let et=function(){if(window.fully&&"function"==typeof fully.getDeviceId)return fully.getDeviceId();if(!localStorage["lovelace-player-device-id"]){const t=()=>Math.floor(1e5*(1+Math.random())).toString(16).substring(1);localStorage["lovelace-player-device-id"]=`${t()}${t()}-${t()}${t()}`}return localStorage["lovelace-player-device-id"]}();var nt={},it=/d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,ot="[^\\s]+",st=/\[([^]*?)\]/gm,rt=function(){};function at(t,e){for(var n=[],i=0,o=t.length;i<o;i++)n.push(t[i].substr(0,e));return n}function lt(t){return function(e,n,i){var o=i[t].indexOf(n.charAt(0).toUpperCase()+n.substr(1).toLowerCase());~o&&(e.month=o)}}function ct(t,e){for(t=String(t),e=e||2;t.length<e;)t="0"+t;return t}var dt=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],ht=["January","February","March","April","May","June","July","August","September","October","November","December"],ut=at(ht,3),pt=at(dt,3);nt.i18n={dayNamesShort:pt,dayNames:dt,monthNamesShort:ut,monthNames:ht,amPm:["am","pm"],DoFn:function(t){return t+["th","st","nd","rd"][t%10>3?0:(t-t%10!=10)*t%10]}};var mt={D:function(t){return t.getDate()},DD:function(t){return ct(t.getDate())},Do:function(t,e){return e.DoFn(t.getDate())},d:function(t){return t.getDay()},dd:function(t){return ct(t.getDay())},ddd:function(t,e){return e.dayNamesShort[t.getDay()]},dddd:function(t,e){return e.dayNames[t.getDay()]},M:function(t){return t.getMonth()+1},MM:function(t){return ct(t.getMonth()+1)},MMM:function(t,e){return e.monthNamesShort[t.getMonth()]},MMMM:function(t,e){return e.monthNames[t.getMonth()]},YY:function(t){return ct(String(t.getFullYear()),4).substr(2)},YYYY:function(t){return ct(t.getFullYear(),4)},h:function(t){return t.getHours()%12||12},hh:function(t){return ct(t.getHours()%12||12)},H:function(t){return t.getHours()},HH:function(t){return ct(t.getHours())},m:function(t){return t.getMinutes()},mm:function(t){return ct(t.getMinutes())},s:function(t){return t.getSeconds()},ss:function(t){return ct(t.getSeconds())},S:function(t){return Math.round(t.getMilliseconds()/100)},SS:function(t){return ct(Math.round(t.getMilliseconds()/10),2)},SSS:function(t){return ct(t.getMilliseconds(),3)},a:function(t,e){return t.getHours()<12?e.amPm[0]:e.amPm[1]},A:function(t,e){return t.getHours()<12?e.amPm[0].toUpperCase():e.amPm[1].toUpperCase()},ZZ:function(t){var e=t.getTimezoneOffset();return(e>0?"-":"+")+ct(100*Math.floor(Math.abs(e)/60)+Math.abs(e)%60,4)}},ft={D:["\\d\\d?",function(t,e){t.day=e}],Do:["\\d\\d?"+ot,function(t,e){t.day=parseInt(e,10)}],M:["\\d\\d?",function(t,e){t.month=e-1}],YY:["\\d\\d?",function(t,e){var n=+(""+(new Date).getFullYear()).substr(0,2);t.year=""+(e>68?n-1:n)+e}],h:["\\d\\d?",function(t,e){t.hour=e}],m:["\\d\\d?",function(t,e){t.minute=e}],s:["\\d\\d?",function(t,e){t.second=e}],YYYY:["\\d{4}",function(t,e){t.year=e}],S:["\\d",function(t,e){t.millisecond=100*e}],SS:["\\d{2}",function(t,e){t.millisecond=10*e}],SSS:["\\d{3}",function(t,e){t.millisecond=e}],d:["\\d\\d?",rt],ddd:[ot,rt],MMM:[ot,lt("monthNamesShort")],MMMM:[ot,lt("monthNames")],a:[ot,function(t,e,n){var i=e.toLowerCase();i===n.amPm[0]?t.isPm=!1:i===n.amPm[1]&&(t.isPm=!0)}],ZZ:["[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z",function(t,e){var n,i=(e+"").match(/([+-]|\d\d)/gi);i&&(n=60*i[1]+parseInt(i[2],10),t.timezoneOffset="+"===i[0]?n:-n)}]};ft.dd=ft.d,ft.dddd=ft.ddd,ft.DD=ft.D,ft.mm=ft.m,ft.hh=ft.H=ft.HH=ft.h,ft.MM=ft.M,ft.ss=ft.s,ft.A=ft.a,nt.masks={default:"ddd MMM DD YYYY HH:mm:ss",shortDate:"M/D/YY",mediumDate:"MMM D, YYYY",longDate:"MMMM D, YYYY",fullDate:"dddd, MMMM D, YYYY",shortTime:"HH:mm",mediumTime:"HH:mm:ss",longTime:"HH:mm:ss.SSS"},nt.format=function(t,e,n){var i=n||nt.i18n;if("number"==typeof t&&(t=new Date(t)),"[object Date]"!==Object.prototype.toString.call(t)||isNaN(t.getTime()))throw new Error("Invalid Date in fecha.format");e=nt.masks[e]||e||nt.masks.default;var o=[];return(e=(e=e.replace(st,(function(t,e){return o.push(e),"@@@"}))).replace(it,(function(e){return e in mt?mt[e](t,i):e.slice(1,e.length-1)}))).replace(/@@@/g,(function(){return o.shift()}))},nt.parse=function(t,e,n){var i=n||nt.i18n;if("string"!=typeof e)throw new Error("Invalid format in fecha.parse");if(e=nt.masks[e]||e,t.length>1e3)return null;var o={},s=[],r=[];e=e.replace(st,(function(t,e){return r.push(e),"@@@"}));var a,l=(a=e,a.replace(/[|\\{()[^$+*?.-]/g,"\\$&")).replace(it,(function(t){if(ft[t]){var e=ft[t];return s.push(e[1]),"("+e[0]+")"}return t}));l=l.replace(/@@@/g,(function(){return r.shift()}));var c=t.match(new RegExp(l,"i"));if(!c)return null;for(var d=1;d<c.length;d++)s[d-1](o,c[d],i);var h,u=new Date;return!0===o.isPm&&null!=o.hour&&12!=+o.hour?o.hour=+o.hour+12:!1===o.isPm&&12==+o.hour&&(o.hour=0),null!=o.timezoneOffset?(o.minute=+(o.minute||0)-+o.timezoneOffset,h=new Date(Date.UTC(o.year||u.getFullYear(),o.month||0,o.day||1,o.hour||0,o.minute||0,o.second||0,o.millisecond||0))):h=new Date(o.year||u.getFullYear(),o.month||0,o.day||1,o.hour||0,o.minute||0,o.second||0,o.millisecond||0),h};(function(){try{(new Date).toLocaleDateString("i")}catch(t){return"RangeError"===t.name}})(),function(){try{(new Date).toLocaleString("i")}catch(t){return"RangeError"===t.name}}(),function(){try{(new Date).toLocaleTimeString("i")}catch(t){return"RangeError"===t.name}}();var gt=["closed","locked","off"],yt=function(t,e,n,i){i=i||{},n=null==n?{}:n;var o=new Event(e,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return o.detail=n,t.dispatchEvent(o),o},_t=function(){var t=document.querySelector("home-assistant");if(t=(t=(t=(t=(t=(t=(t=(t=t&&t.shadowRoot)&&t.querySelector("home-assistant-main"))&&t.shadowRoot)&&t.querySelector("app-drawer-layout partial-panel-resolver"))&&t.shadowRoot||t)&&t.querySelector("ha-panel-lovelace"))&&t.shadowRoot)&&t.querySelector("hui-root"))return t.shadowRoot},St=function(t){yt(window,"haptic",t)};function vt(t,e){let n=25,i=75,o=!1;t.width&&("number"==typeof t.width?(n=t.width,i=100-n):"object"==typeof t.width&&(n=t.desktop,i=100-n,o=!0));let s="\n    #customSidebarWrapper { \n      display:flex;\n      flex-direction:row;\n    }\n  ";return o?e<=t.breakpoints.mobile?s+="\n      #customSidebar {\n        width:"+t.width.mobile+"%;\n      } \n      #contentContainer {\n        width:"+(100-t.width.mobile)+"%;\n      }\n    ":e<=t.breakpoints.tablet?s+="\n        #customSidebar {\n          width:"+t.width.tablet+"%;\n        } \n        #contentContainer {\n          width:"+(100-t.width.tablet)+"%;\n        }\n      ":s+="\n        #customSidebar {\n          width:"+t.width.desktop+"%;\n        } \n        #contentContainer {\n          width:"+(100-t.width.desktop)+"%;\n        }\n      ":s+="\n      #customSidebar {\n        width:"+n+"%;\n      } \n      #contentContainer {\n        width:"+i+"%;\n      }\n    ",s}function bt(t,e){let n=_t();const i=document.body.clientWidth;t.shadowRoot.querySelector("#customSidebarStyle").textContent=vt(e,i);const o=n.querySelector("ch-header");o?console.log("Header found!"):console.log("Header not found!"),e.hideTopMenu&&!0===e.hideTopMenu&&e.showTopMenuOnMobile&&!0===e.showTopMenuOnMobile&&i<=e.breakpoints.mobile?(console.log("Action: Show header!"),o&&(o.style.display="flex")):e.hideTopMenu&&!0===e.hideTopMenu&&(console.log("Action: Hide header!"),o&&(o.style.display="none"))}customElements.define("sidebar-card",class extends Q{constructor(){super(),this.templateLines=[],this.clock=!1,this.digitalClock=!1,this.digitalClockWithSeconds=!1}static get properties(){return{hass:{},config:{},active:{}}}render(){const t=this.config.sidebarMenu,e="title"in this.config&&this.config.title;this.clock=!!this.config.clock&&this.config.clock,this.digitalClock=!!this.config.digitalClock&&this.config.digitalClock,this.digitalClockWithSeconds=!!this.config.digitalClockWithSeconds&&this.config.digitalClockWithSeconds;const n="style"in this.config;return q`
      ${n?q`
        <style>
          ${this.config.style}
        </style>
      `:q``}
      <div class="sidebar-inner">
        ${this.digitalClock?q`<h1 class="digitalClock${e?" with-title":""}${this.digitalClockWithSeconds?" with-seconds":""}"></h1>`:q``}
        ${this.clock?q`
          <div class="clock">
            <div class="wrap">
              <span class="hour"></span>
              <span class="minute"></span>
              <span class="second"></span>
              <span class="dot"></span>
            </div>
          </div>
        `:q``}
        ${e?q`<h1>${e}</h1>`:q``}
        
        ${t&&t.length>0?q`
        <ul class="sidebarMenu">
          ${t.map(t=>q`<li @click="${t=>this._menuAction(t)}" class="${t.state&&"off"!=this.hass.states[t.state].state&&"unavailable"!=this.hass.states[t.state].state?"active":""}" data-type="${t.action}" data-path="${t.navigation_path?t.navigation_path:""}" data-menuitem="${JSON.stringify(t)}">
              ${t.name}
              ${t.icon?q`<ha-icon icon="${t.icon}" />`:q``}
            </li>`)}
        </ul>
        `:q``}

        ${this.config.template?q`
          <ul class="template">
            ${this.templateLines.map(t=>q`<li>${t}</li>`)}
          </ul>
        `:q``}
        
      </div>
    `}_runClock(){const t=new Date,e=t.getHours().toString(),n=(t.getHours()+11)%12+1,i=t.getMinutes(),o=t.getSeconds(),s=30*n,r=6*i,a=6*o;if(this.clock&&(this.shadowRoot.querySelector(".hour").style.transform=`rotate(${s}deg)`,this.shadowRoot.querySelector(".minute").style.transform=`rotate(${r}deg)`,this.shadowRoot.querySelector(".second").style.transform=`rotate(${a}deg)`),this.digitalClock){const t=i.toString();var l=e.length<2?"0"+e+":":e+":";if(this.digitalClockWithSeconds){l+=t.length<2?"0"+t+":":t+":";const e=o.toString();l+=e.length<2?"0"+e:e}else l+=t.length<2?"0"+t:t;this.shadowRoot.querySelector(".digitalClock").textContent=l}}firstUpdated(){var t;if(t=this,document.querySelector("hc-main")?document.querySelector("hc-main").provideHass(t):document.querySelector("home-assistant")&&document.querySelector("home-assistant").provideHass(t),_t().querySelectorAll("paper-tab").forEach(t=>{t.addEventListener("click",()=>{this._updateActiveMenu()})}),this.clock||this.digitalClock){const t=1e3,e=this;e._runClock(),setInterval((function(){e._runClock()}),t)}}_updateActiveMenu(){this.shadowRoot.querySelectorAll('ul.sidebarMenu li[data-type="navigate"]').forEach(t=>{t.classList.remove("active")});let t=this.shadowRoot.querySelector('ul.sidebarMenu li[data-path="'+document.location.pathname+'"]');t&&t.classList.add("active")}_menuAction(t){if(t.target.dataset&&t.target.dataset.menuitem){const e=JSON.parse(t.target.dataset.menuitem);this._customAction(e)}}_customAction(t){switch(t.action){case"more-info":(t.entity||t.camera_image)&&function(t,e=!1){const n=document.querySelector("hc-main")||document.querySelector("home-assistant");tt("hass-more-info",{entityId:t},n);const i=n._moreInfoEl;i.large=e}(t.entity?t.entity:t.camera_image);break;case"navigate":t.navigation_path&&function(t,e,n){void 0===n&&(n=!1),n?history.replaceState(null,"",e):history.pushState(null,"",e),yt(window,"location-changed",{replace:n})}(window,t.navigation_path);break;case"url":t.url_path&&window.open(t.url_path);break;case"toggle":t.entity&&(e=this.hass,n=t.entity,function(t,e,n){void 0===n&&(n=!0);var i,o=function(t){return t.substr(0,t.indexOf("."))}(e),s="group"===o?"homeassistant":o;switch(o){case"lock":i=n?"unlock":"lock";break;case"cover":i=n?"open_cover":"close_cover";break;default:i=n?"turn_on":"turn_off"}t.callService(s,i,{entity_id:e})}(e,n,gt.includes(e.states[n].state)),St("success"));break;case"call-service":{if(!t.service)return void St("failure");const[e,n]=t.service.split(".",2);this.hass.callService(e,n,t.service_data),St("success")}}var e,n}setConfig(t){this.config=t,this.config.template&&function(t,e,n){t||(t=X().connection);let i={user:X().user.name,browser:et,hash:location.hash.substr(1)||" ",...n.variables},o=n.template,s=n.entity_ids;t.subscribeMessage(t=>{let n=t.result;n=n.replace(/_\([^)]*\)/g,t=>X().localize(t.substring(2,t.length-1))||t),e(n)},{type:"render_template",template:o,variables:i,entity_ids:s})}(null,t=>{var e=t.match(/<li>([^]*?)<\/li>/g).map((function(t){return t.replace(/<\/?li>/g,"")}));this.templateLines=e,this.requestUpdate()},{template:this.config.template,variables:{config:this.config},entity_ids:this.config.entity_ids})}getCardSize(){return 1}static get styles(){return G`
        :host {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          // --face-color: #FFF;
          // --face-border-color: #FFF;
          // --clock-hands-color: #000;
          // --clock-seconds-hand-color: #FF4B3E;
          // --clock-middle-background: #FFF;
          // --clock-middle-border: #000;
          // --sidebar-background: #FFF;
          // --sidebar-text-color: #000;
          background-color: var(--sidebar-background, #FFF);
        }
        .sidebar-inner {
          padding: 20px;
        }
        .sidebarMenu {
          list-style:none;
          margin: 20px 0;
          padding: 20px 0;
          border-top: 1px solid rgba(255,255,255,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.2);
          color: var(--sidebar-text-color, #000);
        }
        .sidebarMenu li {
          padding: 10px 20px;
          border-radius: 12px;
          color:inherit;
          font-size:18px;
          line-height: 24px;
          font-weight:300;
          white-space: normal;
          display:block;
          cursor:pointer;
        }
        .sidebarMenu li ha-icon {
          float:right;
        }
        .sidebarMenu li.active ha-icon {
          color: rgb(247, 217, 89);
        }
        .sidebarMenu li.active {
          background-color: rgba(0,0,0,0.2);
        }
        h1 {
          margin-top:0;
          margin-bottom: 20px;
          font-size: 32px;
          line-height: 32px;
          font-weight: 200;
          color: var(--sidebar-text-color, #000);
        }
        h1.digitalClock {
          font-size:60px;
          line-height: 60px;
        }
        h1.digitalClock.with-seconds {
          font-size: 48px;
          line-height:48px;
        }
        h1.digitalClock.with-title {
          margin-bottom:0;
        }
        .template {
          margin: 0;
          padding: 0;
          list-style:none;
          color: var(--sidebar-text-color, #000);
        }
        
        .template li {
          display:block;
          color:inherit;
          font-size:18px;
          line-height: 24px;
          font-weight:300;
          white-space: normal;
        }

        .clock {
          margin:20px 0;
          position:relative;
          padding-top: calc(100% - 10px);
          width: calc(100% - 10px);
          border-radius: 100%;
          background: var(--face-color, #FFF);
          font-family: "Montserrat";
          border: 5px solid var(--face-border-color, #FFF);
          box-shadow: inset 2px 3px 8px 0 rgba(0, 0, 0, 0.1);
        }
        
        .clock .wrap {
          overflow: hidden;
          position: absolute;
          top:0;
          left:0;
          width: 100%;
          height: 100%;
          border-radius: 100%;
        }
        
        .clock .minute,
        .clock .hour {
          position: absolute;
          height: 28%;
          width: 6px;
          margin: auto;
          top: -27%;
          left: 0;
          bottom: 0;
          right: 0;
          background: var(--clock-hands-color, #000);
          transform-origin: bottom center;
          transform: rotate(0deg);
          box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.4);
          z-index: 1;
        }
        
        .clock .minute {
          position: absolute;
          height: 41%;
          width: 4px;
          top: -38%;
          left: 0;
          box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.4);
          transform: rotate(90deg);
        }
        
        .clock .second {
          position: absolute;
          top: -48%;
          height: 48%;
          width: 2px;
          margin: auto;
          left: 0;
          bottom: 0;
          right: 0;
          border-radius: 4px;
          background: var(--clock-seconds-hand-color, #FF4B3E);
          transform-origin: bottom center;
          transform: rotate(180deg);
          z-index: 1;
        }
        
        .clock .dot {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 12px;
          height: 12px;
          border-radius: 100px;
          background: var(--clock-middle-background, #FFF);
          border: 2px solid var(--clock-middle-border, #000);
          border-radius: 100px;
          margin: auto;
          z-index: 1;
        }
    `}}),async function(){let t=function(){var t=document.querySelector("home-assistant");if(t=(t=(t=(t=(t=(t=(t=(t=t&&t.shadowRoot)&&t.querySelector("home-assistant-main"))&&t.shadowRoot)&&t.querySelector("app-drawer-layout partial-panel-resolver"))&&t.shadowRoot||t)&&t.querySelector("ha-panel-lovelace"))&&t.shadowRoot)&&t.querySelector("hui-root")){var e=t.lovelace;return e.current_view=t.___curView,e}return null}();if(t.config.sidebar){const n=Object.assign({},t.config.sidebar);if(!n.width||n.width&&"number"==typeof n.width&&n.width>0&&n.width<100||n.width&&"object"==typeof n.width){let t=_t();n.hideTopMenu&&!0===n.hideTopMenu&&(t.querySelector("ch-header").style.display="none"),n.breakpoints?n.breakpoints&&(n.breakpoints.mobile||(n.breakpoints.mobile=768),n.breakpoints.tablet||(n.breakpoints.tablet=1024)):n.breakpoints={tablet:1024,mobile:768};let i=t.querySelector("ha-app-layout"),o=vt(n,document.body.clientWidth),s=document.createElement("style");s.setAttribute("id","customSidebarStyle"),i.shadowRoot.appendChild(s),s.type="text/css",s.styleSheet?s.styleSheet.cssText=o:s.appendChild(document.createTextNode(o));let r=i.shadowRoot.querySelector("#contentContainer");var e=document.createElement("div");e.setAttribute("id","customSidebarWrapper"),r.parentNode.insertBefore(e,r);let a=document.createElement("div");a.setAttribute("id","customSidebar"),e.appendChild(a),e.appendChild(r),await async function(t,e){const n=document.createElement("sidebar-card");n.setConfig(e),n.hass=X(),t.appendChild(n)}(a,n),bt(i,n),function(t,e){window.addEventListener("resize",(function(){bt(t,e)}),!0)}(i,n)}else console.log("Error sidebar in width config!")}else console.log("No sidebar in config found!")}();
