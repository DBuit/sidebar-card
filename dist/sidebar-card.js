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
const e=new WeakMap,t=t=>"function"==typeof t&&e.has(t),n=void 0!==window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(e,t,n=null)=>{for(;t!==n;){const n=t.nextSibling;e.removeChild(t),t=n}},o={},s={},r=`{{lit-${String(Math.random()).slice(2)}}}`,a=`\x3c!--${r}--\x3e`,l=new RegExp(`${r}|${a}`);class c{constructor(e,t){this.parts=[],this.element=t;const n=[],i=[],o=document.createTreeWalker(t.content,133,null,!1);let s=0,a=-1,c=0;const{strings:h,values:{length:m}}=e;for(;c<m;){const e=o.nextNode();if(null!==e){if(a++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:n}=t;let i=0;for(let e=0;e<n;e++)d(t[e].name,"$lit$")&&i++;for(;i-- >0;){const t=h[c],n=p.exec(t)[2],i=n.toLowerCase()+"$lit$",o=e.getAttribute(i);e.removeAttribute(i);const s=o.split(l);this.parts.push({type:"attribute",index:a,name:n,strings:s}),c+=s.length-1}}"TEMPLATE"===e.tagName&&(i.push(e),o.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(r)>=0){const i=e.parentNode,o=t.split(l),s=o.length-1;for(let t=0;t<s;t++){let n,s=o[t];if(""===s)n=u();else{const e=p.exec(s);null!==e&&d(e[2],"$lit$")&&(s=s.slice(0,e.index)+e[1]+e[2].slice(0,-"$lit$".length)+e[3]),n=document.createTextNode(s)}i.insertBefore(n,e),this.parts.push({type:"node",index:++a})}""===o[s]?(i.insertBefore(u(),e),n.push(e)):e.data=o[s],c+=s}}else if(8===e.nodeType)if(e.data===r){const t=e.parentNode;null!==e.previousSibling&&a!==s||(a++,t.insertBefore(u(),e)),s=a,this.parts.push({type:"node",index:a}),null===e.nextSibling?e.data="":(n.push(e),a--),c++}else{let t=-1;for(;-1!==(t=e.data.indexOf(r,t+1));)this.parts.push({type:"node",index:-1}),c++}}else o.currentNode=i.pop()}for(const e of n)e.parentNode.removeChild(e)}}const d=(e,t)=>{const n=e.length-t.length;return n>=0&&e.slice(n)===t},h=e=>-1!==e.index,u=()=>document.createComment(""),p=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
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
class m{constructor(e,t,n){this.__parts=[],this.template=e,this.processor=t,this.options=n}update(e){let t=0;for(const n of this.__parts)void 0!==n&&n.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=n?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),t=[],i=this.template.parts,o=document.createTreeWalker(e,133,null,!1);let s,r=0,a=0,l=o.nextNode();for(;r<i.length;)if(s=i[r],h(s)){for(;a<s.index;)a++,"TEMPLATE"===l.nodeName&&(t.push(l),o.currentNode=l.content),null===(l=o.nextNode())&&(o.currentNode=t.pop(),l=o.nextNode());if("node"===s.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(l.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(l,s.name,s.strings,this.options));r++}else this.__parts.push(void 0),r++;return n&&(document.adoptNode(e),customElements.upgrade(e)),e}}
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
 */const f=` ${r} `;class g{constructor(e,t,n,i){this.strings=e,this.values=t,this.type=n,this.processor=i}getHTML(){const e=this.strings.length-1;let t="",n=!1;for(let i=0;i<e;i++){const e=this.strings[i],o=e.lastIndexOf("\x3c!--");n=(o>-1||n)&&-1===e.indexOf("--\x3e",o+1);const s=p.exec(e);t+=null===s?e+(n?f:a):e.substr(0,s.index)+s[1]+s[2]+"$lit$"+s[3]+r}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");return e.innerHTML=this.getHTML(),e}}
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
 */const y=e=>null===e||!("object"==typeof e||"function"==typeof e),_=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class S{constructor(e,t,n){this.dirty=!0,this.element=e,this.name=t,this.strings=n,this.parts=[];for(let e=0;e<n.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new b(this)}_getValue(){const e=this.strings,t=e.length-1;let n="";for(let i=0;i<t;i++){n+=e[i];const t=this.parts[i];if(void 0!==t){const e=t.value;if(y(e)||!_(e))n+="string"==typeof e?e:String(e);else for(const t of e)n+="string"==typeof t?t:String(t)}}return n+=e[t],n}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class b{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===o||y(e)&&e===this.value||(this.value=e,t(e)||(this.committer.dirty=!0))}commit(){for(;t(this.value);){const e=this.value;this.value=o,e(this)}this.value!==o&&this.committer.commit()}}class v{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild(u()),this.endNode=e.appendChild(u())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=u()),e.__insert(this.endNode=u())}insertAfterPart(e){e.__insert(this.startNode=u()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){for(;t(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=o,e(this)}const e=this.__pendingValue;e!==o&&(y(e)?e!==this.value&&this.__commitText(e):e instanceof g?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):_(e)?this.__commitIterable(e):e===s?(this.value=s,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,n="string"==typeof(e=null==e?"":e)?e:String(e);t===this.endNode.previousSibling&&3===t.nodeType?t.data=n:this.__commitNode(document.createTextNode(n)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof m&&this.value.template===t)this.value.update(e.values);else{const n=new m(t,e.processor,this.options),i=n._clone();n.update(e.values),this.__commitNode(i),this.value=n}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let n,i=0;for(const o of e)n=t[i],void 0===n&&(n=new v(this.options),t.push(n),0===i?n.appendIntoPart(this):n.insertAfterPart(t[i-1])),n.setValue(o),n.commit(),i++;i<t.length&&(t.length=i,this.clear(n&&n.endNode))}clear(e=this.startNode){i(this.startNode.parentNode,e.nextSibling,this.endNode)}}class w{constructor(e,t,n){if(this.value=void 0,this.__pendingValue=void 0,2!==n.length||""!==n[0]||""!==n[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=n}setValue(e){this.__pendingValue=e}commit(){for(;t(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=o,e(this)}if(this.__pendingValue===o)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=o}}class x extends S{constructor(e,t,n){super(e,t,n),this.single=2===n.length&&""===n[0]&&""===n[1]}_createPart(){return new C(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class C extends b{}let k=!1;try{const e={get capture(){return k=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}class M{constructor(e,t,n){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=n,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;t(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=o,e(this)}if(this.__pendingValue===o)return;const e=this.__pendingValue,n=this.value,i=null==e||null!=n&&(e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive),s=null!=e&&(null==n||i);i&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),s&&(this.__options=N(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=o}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const N=e=>e&&(k?{capture:e.capture,passive:e.passive,once:e.once}:e.capture)
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
 */;const P=new class{handleAttributeExpressions(e,t,n,i){const o=t[0];if("."===o){return new x(e,t.slice(1),n).parts}return"@"===o?[new M(e,t.slice(1),i.eventContext)]:"?"===o?[new w(e,t.slice(1),n)]:new S(e,t,n).parts}handleTextExpression(e){return new v(e)}};
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
 */function E(e){let t=T.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},T.set(e.type,t));let n=t.stringsArray.get(e.strings);if(void 0!==n)return n;const i=e.strings.join(r);return n=t.keyString.get(i),void 0===n&&(n=new c(e,e.getTemplateElement()),t.keyString.set(i,n)),t.stringsArray.set(e.strings,n),n}const T=new Map,A=new WeakMap;
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
(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.1.2");const q=(e,...t)=>new g(e,t,"html",P)
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
 */;function R(e,t){const{element:{content:n},parts:i}=e,o=document.createTreeWalker(n,133,null,!1);let s=F(i),r=i[s],a=-1,l=0;const c=[];let d=null;for(;o.nextNode();){a++;const e=o.currentNode;for(e.previousSibling===d&&(d=null),t.has(e)&&(c.push(e),null===d&&(d=e)),null!==d&&l++;void 0!==r&&r.index===a;)r.index=null!==d?-1:r.index-l,s=F(i,s),r=i[s]}c.forEach(e=>e.parentNode.removeChild(e))}const D=e=>{let t=11===e.nodeType?0:1;const n=document.createTreeWalker(e,133,null,!1);for(;n.nextNode();)t++;return t},F=(e,t=-1)=>{for(let n=t+1;n<e.length;n++){const t=e[n];if(h(t))return n}return-1};
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
const $=(e,t)=>`${e}--${t}`;let V=!0;void 0===window.ShadyCSS?V=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),V=!1);const O=e=>t=>{const n=$(t.type,e);let i=T.get(n);void 0===i&&(i={stringsArray:new WeakMap,keyString:new Map},T.set(n,i));let o=i.stringsArray.get(t.strings);if(void 0!==o)return o;const s=t.strings.join(r);if(o=i.keyString.get(s),void 0===o){const n=t.getTemplateElement();V&&window.ShadyCSS.prepareTemplateDom(n,e),o=new c(t,n),i.keyString.set(s,o)}return i.stringsArray.set(t.strings,o),o},Y=["html","svg"],H=new Set,U=(e,t,n)=>{H.add(e);const i=n?n.element:document.createElement("template"),o=t.querySelectorAll("style"),{length:s}=o;if(0===s)return void window.ShadyCSS.prepareTemplateStyles(i,e);const r=document.createElement("style");for(let e=0;e<s;e++){const t=o[e];t.parentNode.removeChild(t),r.textContent+=t.textContent}(e=>{Y.forEach(t=>{const n=T.get($(t,e));void 0!==n&&n.keyString.forEach(e=>{const{element:{content:t}}=e,n=new Set;Array.from(t.querySelectorAll("style")).forEach(e=>{n.add(e)}),R(e,n)})})})(e);const a=i.content;n?function(e,t,n=null){const{element:{content:i},parts:o}=e;if(null==n)return void i.appendChild(t);const s=document.createTreeWalker(i,133,null,!1);let r=F(o),a=0,l=-1;for(;s.nextNode();){for(l++,s.currentNode===n&&(a=D(t),n.parentNode.insertBefore(t,n));-1!==r&&o[r].index===l;){if(a>0){for(;-1!==r;)o[r].index+=a,r=F(o,r);return}r=F(o,r)}}}(n,r,a.firstChild):a.insertBefore(r,a.firstChild),window.ShadyCSS.prepareTemplateStyles(i,e);const l=a.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==l)t.insertBefore(l.cloneNode(!0),t.firstChild);else if(n){a.insertBefore(r,a.firstChild);const e=new Set;e.add(r),R(n,e)}};window.JSCompiler_renameProperty=(e,t)=>e;const z={toAttribute(e,t){switch(t){case Boolean:return e?"":null;case Object:case Array:return null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){switch(t){case Boolean:return null!==e;case Number:return null===e?null:Number(e);case Object:case Array:return JSON.parse(e)}return e}},L=(e,t)=>t!==e&&(t==t||e==e),W={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:L},I=Promise.resolve(!0);class j extends HTMLElement{constructor(){super(),this._updateState=0,this._instanceProperties=void 0,this._updatePromise=I,this._hasConnectedResolver=void 0,this._changedProperties=new Map,this._reflectingProperties=void 0,this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,n)=>{const i=this._attributeNameForProperty(n,t);void 0!==i&&(this._attributeToPropertyMap.set(i,n),e.push(i))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;void 0!==e&&e.forEach((e,t)=>this._classProperties.set(t,e))}}static createProperty(e,t=W){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const n="symbol"==typeof e?Symbol():`__${e}`;Object.defineProperty(this.prototype,e,{get(){return this[n]},set(t){const i=this[e];this[n]=t,this._requestUpdate(e,i)},configurable:!0,enumerable:!0})}static finalize(){const e=Object.getPrototypeOf(this);if(e.hasOwnProperty("finalized")||e.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const e=this.properties,t=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const n of t)this.createProperty(n,e[n])}}static _attributeNameForProperty(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}static _valueHasChanged(e,t,n=L){return n(e,t)}static _propertyValueFromAttribute(e,t){const n=t.type,i=t.converter||z,o="function"==typeof i?i:i.fromAttribute;return o?o(e,n):e}static _propertyValueToAttribute(e,t){if(void 0===t.reflect)return;const n=t.type,i=t.converter;return(i&&i.toAttribute||z.toAttribute)(e,n)}initialize(){this._saveInstanceProperties(),this._requestUpdate()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this._updateState=32|this._updateState,this._hasConnectedResolver&&(this._hasConnectedResolver(),this._hasConnectedResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,n){t!==n&&this._attributeToProperty(e,n)}_propertyToAttribute(e,t,n=W){const i=this.constructor,o=i._attributeNameForProperty(e,n);if(void 0!==o){const e=i._propertyValueToAttribute(t,n);if(void 0===e)return;this._updateState=8|this._updateState,null==e?this.removeAttribute(o):this.setAttribute(o,e),this._updateState=-9&this._updateState}}_attributeToProperty(e,t){if(8&this._updateState)return;const n=this.constructor,i=n._attributeToPropertyMap.get(e);if(void 0!==i){const e=n._classProperties.get(i)||W;this._updateState=16|this._updateState,this[i]=n._propertyValueFromAttribute(t,e),this._updateState=-17&this._updateState}}_requestUpdate(e,t){let n=!0;if(void 0!==e){const i=this.constructor,o=i._classProperties.get(e)||W;i._valueHasChanged(this[e],t,o.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),!0!==o.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,o))):n=!1}!this._hasRequestedUpdate&&n&&this._enqueueUpdate()}requestUpdate(e,t){return this._requestUpdate(e,t),this.updateComplete}async _enqueueUpdate(){let e,t;this._updateState=4|this._updateState;const n=this._updatePromise;this._updatePromise=new Promise((n,i)=>{e=n,t=i});try{await n}catch(e){}this._hasConnected||await new Promise(e=>this._hasConnectedResolver=e);try{const e=this.performUpdate();null!=e&&await e}catch(e){t(e)}e(!this._hasRequestedUpdate)}get _hasConnected(){return 32&this._updateState}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{e=this.shouldUpdate(t),e&&this.update(t)}catch(t){throw e=!1,t}finally{this._markUpdated()}e&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((e,t)=>this._propertyToAttribute(t,this[t],e)),this._reflectingProperties=void 0)}updated(e){}firstUpdated(e){}}j.finalized=!0;
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
const B="adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,J=Symbol();class Z{constructor(e,t){if(t!==J)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return void 0===this._styleSheet&&(B?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const G=(e,...t)=>{const n=t.reduce((t,n,i)=>t+(e=>{if(e instanceof Z)return e.cssText;if("number"==typeof e)return e;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(n)+e[i+1],e[0]);return new Z(n,J)};
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
(window.litElementVersions||(window.litElementVersions=[])).push("2.2.1");const K=e=>e.flat?e.flat(1/0):function e(t,n=[]){for(let i=0,o=t.length;i<o;i++){const o=t[i];Array.isArray(o)?e(o,n):n.push(o)}return n}(e);class Q extends j{static finalize(){super.finalize.call(this),this._styles=this.hasOwnProperty(JSCompiler_renameProperty("styles",this))?this._getUniqueStyles():this._styles||[]}static _getUniqueStyles(){const e=this.styles,t=[];if(Array.isArray(e)){K(e).reduceRight((e,t)=>(e.add(t),e),new Set).forEach(e=>t.unshift(e))}else e&&t.push(e);return t}initialize(){super.initialize(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow({mode:"open"})}adoptStyles(){const e=this.constructor._styles;0!==e.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?B?this.renderRoot.adoptedStyleSheets=e.map(e=>e.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e=>e.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(e){super.update(e);const t=this.render();t instanceof g&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(e=>{const t=document.createElement("style");t.textContent=e.cssText,this.renderRoot.appendChild(t)}))}render(){}}function X(){return document.querySelector("hc-main")?document.querySelector("hc-main").hass:document.querySelector("home-assistant")?document.querySelector("home-assistant").hass:void 0}function ee(e,t,n=null){if((e=new Event(e,{bubbles:!0,cancelable:!1,composed:!0})).detail=t||{},n)n.dispatchEvent(e);else{var i=function(){var e=document.querySelector("hc-main");return e=e?(e=(e=(e=e&&e.shadowRoot)&&e.querySelector("hc-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-view"):(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=document.querySelector("home-assistant"))&&e.shadowRoot)&&e.querySelector("home-assistant-main"))&&e.shadowRoot)&&e.querySelector("app-drawer-layout partial-panel-resolver"))&&e.shadowRoot||e)&&e.querySelector("ha-panel-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-root"))&&e.shadowRoot)&&e.querySelector("ha-app-layout #view"))&&e.firstElementChild}();i&&i.dispatchEvent(e)}}Q.finalized=!0,Q.render=(e,t,n)=>{if(!n||"object"!=typeof n||!n.scopeName)throw new Error("The `scopeName` option is required.");const o=n.scopeName,s=A.has(t),r=V&&11===t.nodeType&&!!t.host,a=r&&!H.has(o),l=a?document.createDocumentFragment():t;if(((e,t,n)=>{let o=A.get(t);void 0===o&&(i(t,t.firstChild),A.set(t,o=new v(Object.assign({templateFactory:E},n))),o.appendInto(t)),o.setValue(e),o.commit()})(e,l,Object.assign({templateFactory:O(o)},n)),a){const e=A.get(l);A.delete(l);const n=e.value instanceof m?e.value.template:void 0;U(o,l,n),i(t,t.firstChild),t.appendChild(l),A.set(t,e)}!s&&r&&window.ShadyCSS.styleElement(t.host)};let te=window.cardHelpers;const ne=new Promise(async(e,t)=>{te&&e(),window.loadCardHelpers&&(te=await window.loadCardHelpers(),window.cardHelpers=te,e())});function ie(e,t){const n=document.createElement("hui-error-card");return n.setConfig({type:"error",error:e,origConfig:t}),n}function oe(e,t){if(!t||"object"!=typeof t||!t.type)return ie(`No ${e} type configured`,t);let n=t.type;if(n=n.startsWith("custom:")?n.substr("custom:".length):`hui-${n}-${e}`,customElements.get(n))return function(e,t){let n=document.createElement(e);try{n.setConfig(JSON.parse(JSON.stringify(t)))}catch(e){n=ie(e,t)}return ne.then(()=>{ee("ll-rebuild",{},n)}),n}(n,t);const i=ie(`Custom element doesn't exist: ${n}.`,t);i.style.display="None";const o=setTimeout(()=>{i.style.display=""},2e3);return customElements.whenDefined(n).then(()=>{clearTimeout(o),ee("ll-rebuild",{},i)}),i}let se=function(){if(window.fully&&"function"==typeof fully.getDeviceId)return fully.getDeviceId();if(!localStorage["lovelace-player-device-id"]){const e=()=>Math.floor(1e5*(1+Math.random())).toString(16).substring(1);localStorage["lovelace-player-device-id"]=`${e()}${e()}-${e()}${e()}`}return localStorage["lovelace-player-device-id"]}();var re={},ae=/d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,le="[^\\s]+",ce=/\[([^]*?)\]/gm,de=function(){};function he(e,t){for(var n=[],i=0,o=e.length;i<o;i++)n.push(e[i].substr(0,t));return n}function ue(e){return function(t,n,i){var o=i[e].indexOf(n.charAt(0).toUpperCase()+n.substr(1).toLowerCase());~o&&(t.month=o)}}function pe(e,t){for(e=String(e),t=t||2;e.length<t;)e="0"+e;return e}var me=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],fe=["January","February","March","April","May","June","July","August","September","October","November","December"],ge=he(fe,3),ye=he(me,3);re.i18n={dayNamesShort:ye,dayNames:me,monthNamesShort:ge,monthNames:fe,amPm:["am","pm"],DoFn:function(e){return e+["th","st","nd","rd"][e%10>3?0:(e-e%10!=10)*e%10]}};var _e={D:function(e){return e.getDate()},DD:function(e){return pe(e.getDate())},Do:function(e,t){return t.DoFn(e.getDate())},d:function(e){return e.getDay()},dd:function(e){return pe(e.getDay())},ddd:function(e,t){return t.dayNamesShort[e.getDay()]},dddd:function(e,t){return t.dayNames[e.getDay()]},M:function(e){return e.getMonth()+1},MM:function(e){return pe(e.getMonth()+1)},MMM:function(e,t){return t.monthNamesShort[e.getMonth()]},MMMM:function(e,t){return t.monthNames[e.getMonth()]},YY:function(e){return pe(String(e.getFullYear()),4).substr(2)},YYYY:function(e){return pe(e.getFullYear(),4)},h:function(e){return e.getHours()%12||12},hh:function(e){return pe(e.getHours()%12||12)},H:function(e){return e.getHours()},HH:function(e){return pe(e.getHours())},m:function(e){return e.getMinutes()},mm:function(e){return pe(e.getMinutes())},s:function(e){return e.getSeconds()},ss:function(e){return pe(e.getSeconds())},S:function(e){return Math.round(e.getMilliseconds()/100)},SS:function(e){return pe(Math.round(e.getMilliseconds()/10),2)},SSS:function(e){return pe(e.getMilliseconds(),3)},a:function(e,t){return e.getHours()<12?t.amPm[0]:t.amPm[1]},A:function(e,t){return e.getHours()<12?t.amPm[0].toUpperCase():t.amPm[1].toUpperCase()},ZZ:function(e){var t=e.getTimezoneOffset();return(t>0?"-":"+")+pe(100*Math.floor(Math.abs(t)/60)+Math.abs(t)%60,4)}},Se={D:["\\d\\d?",function(e,t){e.day=t}],Do:["\\d\\d?"+le,function(e,t){e.day=parseInt(t,10)}],M:["\\d\\d?",function(e,t){e.month=t-1}],YY:["\\d\\d?",function(e,t){var n=+(""+(new Date).getFullYear()).substr(0,2);e.year=""+(t>68?n-1:n)+t}],h:["\\d\\d?",function(e,t){e.hour=t}],m:["\\d\\d?",function(e,t){e.minute=t}],s:["\\d\\d?",function(e,t){e.second=t}],YYYY:["\\d{4}",function(e,t){e.year=t}],S:["\\d",function(e,t){e.millisecond=100*t}],SS:["\\d{2}",function(e,t){e.millisecond=10*t}],SSS:["\\d{3}",function(e,t){e.millisecond=t}],d:["\\d\\d?",de],ddd:[le,de],MMM:[le,ue("monthNamesShort")],MMMM:[le,ue("monthNames")],a:[le,function(e,t,n){var i=t.toLowerCase();i===n.amPm[0]?e.isPm=!1:i===n.amPm[1]&&(e.isPm=!0)}],ZZ:["[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z",function(e,t){var n,i=(t+"").match(/([+-]|\d\d)/gi);i&&(n=60*i[1]+parseInt(i[2],10),e.timezoneOffset="+"===i[0]?n:-n)}]};Se.dd=Se.d,Se.dddd=Se.ddd,Se.DD=Se.D,Se.mm=Se.m,Se.hh=Se.H=Se.HH=Se.h,Se.MM=Se.M,Se.ss=Se.s,Se.A=Se.a,re.masks={default:"ddd MMM DD YYYY HH:mm:ss",shortDate:"M/D/YY",mediumDate:"MMM D, YYYY",longDate:"MMMM D, YYYY",fullDate:"dddd, MMMM D, YYYY",shortTime:"HH:mm",mediumTime:"HH:mm:ss",longTime:"HH:mm:ss.SSS"},re.format=function(e,t,n){var i=n||re.i18n;if("number"==typeof e&&(e=new Date(e)),"[object Date]"!==Object.prototype.toString.call(e)||isNaN(e.getTime()))throw new Error("Invalid Date in fecha.format");t=re.masks[t]||t||re.masks.default;var o=[];return(t=(t=t.replace(ce,(function(e,t){return o.push(t),"@@@"}))).replace(ae,(function(t){return t in _e?_e[t](e,i):t.slice(1,t.length-1)}))).replace(/@@@/g,(function(){return o.shift()}))},re.parse=function(e,t,n){var i=n||re.i18n;if("string"!=typeof t)throw new Error("Invalid format in fecha.parse");if(t=re.masks[t]||t,e.length>1e3)return null;var o={},s=[],r=[];t=t.replace(ce,(function(e,t){return r.push(t),"@@@"}));var a,l=(a=t,a.replace(/[|\\{()[^$+*?.-]/g,"\\$&")).replace(ae,(function(e){if(Se[e]){var t=Se[e];return s.push(t[1]),"("+t[0]+")"}return e}));l=l.replace(/@@@/g,(function(){return r.shift()}));var c=e.match(new RegExp(l,"i"));if(!c)return null;for(var d=1;d<c.length;d++)s[d-1](o,c[d],i);var h,u=new Date;return!0===o.isPm&&null!=o.hour&&12!=+o.hour?o.hour=+o.hour+12:!1===o.isPm&&12==+o.hour&&(o.hour=0),null!=o.timezoneOffset?(o.minute=+(o.minute||0)-+o.timezoneOffset,h=new Date(Date.UTC(o.year||u.getFullYear(),o.month||0,o.day||1,o.hour||0,o.minute||0,o.second||0,o.millisecond||0))):h=new Date(o.year||u.getFullYear(),o.month||0,o.day||1,o.hour||0,o.minute||0,o.second||0,o.millisecond||0),h};(function(){try{(new Date).toLocaleDateString("i")}catch(e){return"RangeError"===e.name}})(),function(){try{(new Date).toLocaleString("i")}catch(e){return"RangeError"===e.name}}(),function(){try{(new Date).toLocaleTimeString("i")}catch(e){return"RangeError"===e.name}}();var be=["closed","locked","off"],ve=function(e,t,n,i){i=i||{},n=null==n?{}:n;var o=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return o.detail=n,e.dispatchEvent(o),o},we=function(){var e=document.querySelector("home-assistant");if(e=(e=(e=(e=(e=(e=(e=(e=e&&e.shadowRoot)&&e.querySelector("home-assistant-main"))&&e.shadowRoot)&&e.querySelector("app-drawer-layout partial-panel-resolver"))&&e.shadowRoot||e)&&e.querySelector("ha-panel-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-root"))return e.shadowRoot},xe=function(e){ve(window,"haptic",e)};function Ce(e,t){let n=25,i=75,o=!1;e.width&&("number"==typeof e.width?(n=e.width,i=100-n):"object"==typeof e.width&&(n=e.desktop,i=100-n,o=!0));let s="\n    #customSidebarWrapper { \n      display:flex;\n      flex-direction:row;\n    }\n  ";return o?t<=e.breakpoints.mobile?s+="\n      #customSidebar {\n        width:"+e.width.mobile+"%;\n      } \n      #contentContainer {\n        width:"+(100-e.width.mobile)+"%;\n      }\n    ":t<=e.breakpoints.tablet?s+="\n        #customSidebar {\n          width:"+e.width.tablet+"%;\n        } \n        #contentContainer {\n          width:"+(100-e.width.tablet)+"%;\n        }\n      ":s+="\n        #customSidebar {\n          width:"+e.width.desktop+"%;\n        } \n        #contentContainer {\n          width:"+(100-e.width.desktop)+"%;\n        }\n      ":s+="\n      #customSidebar {\n        width:"+n+"%;\n      } \n      #contentContainer {\n        width:"+i+"%;\n      }\n    ",s}async function ke(e,t){t.type="custom:sidebar-card";const n=function(e){return te?te.createCardElement(e):oe("card",e)}(t);return n.hass=X(),e.appendChild(n),new Promise(e=>n.updateComplete?n.updateComplete.then(()=>e(n)):e(n))}customElements.define("sidebar-card",class extends Q{constructor(){super(),this.templateLines=[],this.clock=!1,this.digitalClock=!1,this.digitalClockWithSeconds=!1}static get properties(){return{hass:{},config:{},active:{}}}render(){const e=this.config.sidebarMenu,t="title"in this.config&&this.config.title;this.clock=!!this.config.clock&&this.config.clock,this.digitalClock=!!this.config.digitalClock&&this.config.digitalClock,this.digitalClockWithSeconds=!!this.config.digitalClockWithSeconds&&this.config.digitalClockWithSeconds;const n="style"in this.config;return q`
      ${n?q`
        <style>
          ${this.config.style}
        </style>
      `:q``}
      <div class="sidebar-inner">
        ${this.digitalClock?q`<h1 class="digitalClock${t?" with-title":""}${this.digitalClockWithSeconds?" with-seconds":""}"></h1>`:q``}
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
        ${t?q`<h1>${t}</h1>`:q``}
        
        ${e.length>0?q`
        <ul class="sidebarMenu">
          ${e.map(e=>q`<li @click="${e=>this._menuAction(e)}" data-path="${e.navigation_path?e.navigation_path:""}" data-menuitem="${JSON.stringify(e)}" data->${e.name}</li>`)}
        </ul>
        `:q``}

        ${this.config.template?q`
          <ul class="template">
            ${this.templateLines.map(e=>q`<li>${e}</li>`)}
          </ul>
        `:q``}
        
      </div>
    `}_runClock(){const e=new Date,t=e.getHours().toString(),n=(e.getHours()+11)%12+1,i=e.getMinutes(),o=e.getSeconds(),s=30*n,r=6*i,a=6*o;if(this.clock&&(this.shadowRoot.querySelector(".hour").style.transform=`rotate(${s}deg)`,this.shadowRoot.querySelector(".minute").style.transform=`rotate(${r}deg)`,this.shadowRoot.querySelector(".second").style.transform=`rotate(${a}deg)`),this.digitalClock){const e=i.toString();var l=t.length<2?"0"+t+":":t+":";if(this.digitalClockWithSeconds){l+=e.length<2?"0"+e+":":e+":";const t=o.toString();l+=t.length<2?"0"+t:t}else l+=e.length<2?"0"+e:e;this.shadowRoot.querySelector(".digitalClock").textContent=l}}firstUpdated(){if(we().querySelectorAll("paper-tab").forEach(e=>{e.addEventListener("click",()=>{this._updateActiveMenu()})}),this.clock||this.digitalClock){const e=1e3,t=this;t._runClock(),setInterval((function(){t._runClock()}),e)}}updated(){}_updateActiveMenu(){this.shadowRoot.querySelectorAll("ul.sidebarMenu li").forEach(e=>{e.classList.remove("active")}),this.shadowRoot.querySelector('ul.sidebarMenu li[data-path="'+document.location.pathname+'"]').classList.add("active")}_menuAction(e){if(e.target.dataset&&e.target.dataset.menuitem){const t=JSON.parse(e.target.dataset.menuitem);this._customAction(t)}}_customAction(e){switch(e.action){case"more-info":(e.entity||e.camera_image)&&function(e,t=!1){const n=document.querySelector("hc-main")||document.querySelector("home-assistant");ee("hass-more-info",{entityId:e},n);const i=n._moreInfoEl;i.large=t}(e.entity?e.entity:e.camera_image);break;case"navigate":e.navigation_path&&function(e,t,n){void 0===n&&(n=!1),n?history.replaceState(null,"",t):history.pushState(null,"",t),ve(window,"location-changed",{replace:n})}(window,e.navigation_path);break;case"url":e.url_path&&window.open(e.url_path);break;case"toggle":e.entity&&(t=this.hass,n=e.entity,function(e,t,n){void 0===n&&(n=!0);var i,o=function(e){return e.substr(0,e.indexOf("."))}(t),s="group"===o?"homeassistant":o;switch(o){case"lock":i=n?"unlock":"lock";break;case"cover":i=n?"open_cover":"close_cover";break;default:i=n?"turn_on":"turn_off"}e.callService(s,i,{entity_id:t})}(t,n,be.includes(t.states[n].state)),xe("success"));break;case"call-service":{if(!e.service)return void xe("failure");const[t,n]=e.service.split(".",2);this.hass.callService(t,n,e.service_data),xe("success")}}var t,n}setConfig(e){if(!e.sidebarMenu)throw new Error("You need to define sidebarMenu");this.config=e,this.config.template&&function(e,t,n){e||(e=X().connection);let i={user:X().user.name,browser:se,hash:location.hash.substr(1)||" ",...n.variables},o=n.template,s=n.entity_ids;e.subscribeMessage(e=>{let n=e.result;n=n.replace(/_\([^)]*\)/g,e=>X().localize(e.substring(2,e.length-1))||e),t(n)},{type:"render_template",template:o,variables:i,entity_ids:s})}(null,e=>{var t=e.match(/<li>(.*?)<\/li>/gs).map((function(e){return e.replace(/<\/?li>/g,"")}));this.templateLines=t,this.requestUpdate()},{template:this.config.template,variables:{config:this.config},entity_ids:this.config.entity_ids})}getCardSize(){return 1}static get styles(){return G`
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
          line-height:18px;
          font-weight:300;
          white-space: normal;
          display:block;
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
          line-height:18px;
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
    `}}),async function(){let e=function(){var e=document.querySelector("home-assistant");if(e=(e=(e=(e=(e=(e=(e=(e=e&&e.shadowRoot)&&e.querySelector("home-assistant-main"))&&e.shadowRoot)&&e.querySelector("app-drawer-layout partial-panel-resolver"))&&e.shadowRoot||e)&&e.querySelector("ha-panel-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-root")){var t=e.lovelace;return t.current_view=e.___curView,t}return null}();if(e.config.sidebar){const n=e.config.sidebar;if(!n.width||n.width&&"number"==typeof n.width&&n.width>0&&n.width<100||n.width&&"object"==typeof n.width){let e=we();n.hideTopMenu&&!0===n.hideTopMenu&&(e.querySelector("ch-header").style.display="none"),n.breakpoints?n.breakpoints&&(n.breakpoints.mobile||(n.breakpoints.mobile=768),n.breakpoints.tablet||(n.breakpoints.tablet=1024)):n.breakpoints={tablet:1024,mobile:768};let i=e.querySelector("ha-app-layout"),o=Ce(n,document.body.clientWidth),s=document.createElement("style");s.setAttribute("id","customSidebarStyle"),i.shadowRoot.appendChild(s),s.type="text/css",s.styleSheet?s.styleSheet.cssText=o:s.appendChild(document.createTextNode(o));let r=i.shadowRoot.querySelector("#contentContainer");var t=document.createElement("div");t.setAttribute("id","customSidebarWrapper"),r.parentNode.insertBefore(t,r);let a=document.createElement("div");a.setAttribute("id","customSidebar"),t.appendChild(a),t.appendChild(r),await ke(a,n),function(e,t){let n=we();window.addEventListener("resize",(function(){const i=document.body.clientWidth;e.shadowRoot.querySelector("#customSidebarStyle").textContent=Ce(t,i),t.hideTopMenu&&!0===t.hideTopMenu&&t.showTopMenuOnMobile&&!0===t.showTopMenuOnMobile&&i<=t.breakpoints.mobile?n.querySelector("ch-header").style.display="flex":t.hideTopMenu&&!0===t.hideTopMenu&&(n.querySelector("ch-header").style.display="none")}),!0)}(i,n)}else console.log("Error sidebar in width config!")}else console.log("No sidebar in config found!")}();
