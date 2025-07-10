import { LitElement, html } from "./lit-element.js";
import { createCard, createEntityRow, createElement } from "./lovelace-element.js";
import { provideHass } from "./hass.js";

const VERSION = 2;

class ThingMaker extends LitElement {
  static get version() {
    return VERSION;
  }

  static get properties() {
    return {
      'noHass': {type: Boolean },
    };
  }
  setConfig(config) {
    this._config = config;
    if(!this.el) {
      this.el = this.create(config);
      if(this._hass) this.el.hass = this._hass;
      if(this.noHass) provideHass(this);
    } else {
      this.el.setConfig(config);
    }
  }
  set config(config) {
    this.setConfig(config);
  }
  set hass(hass) {
    this._hass = hass;
    if(this.el) this.el.hass = hass;
  }

  createRenderRoot() {
    return this;
  }
  render() {
    return html`${this.el}`;
  }
}


const redefineElement = function(element, newClass) {
  // Non-static properties of class
  const properties = Object.getOwnPropertyDescriptors(newClass.prototype);
  for(const [k,v] of Object.entries(properties)) {
    if(k === "constructor") continue;
    Object.defineProperty(element.prototype, k, v);
  }
  // Static properties of class
  const staticProperties = Object.getOwnPropertyDescriptors(newClass);
  for(const [k,v] of Object.entries(staticProperties)) {
    if(k === "prototype") continue;
    Object.defineProperty(element, k, v);
  }
  const superclass = Object.getPrototypeOf(newClass);
  // Non-static properties of superclass
  const baseProperties = Object.getOwnPropertyDescriptors(superclass.prototype);
  for(const [k,v] of Object.entries(baseProperties)) {
    if(k === "constructor") continue;
    Object.defineProperty(Object.getPrototypeOf(element).prototype, k, v);
  }
  // Static properties of superclassk
  const staticBaseProperties = Object.getOwnPropertyDescriptors(superclass);
  for(const [k,v] of Object.entries(staticBaseProperties)) {
    if(k === "prototype") continue;
    Object.defineProperty(Object.getPrototypeOf(element), k, v);
  }
}

const cardMaker = customElements.get("card-maker");
if(!cardMaker || !cardMaker.version || cardMaker.version < VERSION) {
  class CardMaker extends ThingMaker {
    create(config) {
      return createCard(config);
    }
    getCardSize() {
      if(this.firstElementChild && this.firstElementChild.getCardSize)
        return this.firstElementChild.getCardSize();
      return 1;
    }
  }

  if(cardMaker) {
    redefineElement(cardMaker, CardMaker);
  } else {
    customElements.define("card-maker", CardMaker);
  }
}

const elementMaker = customElements.get("element-maker");
if(!elementMaker || !elementMaker.version || elementMaker.version < VERSION) {
  class ElementMaker extends ThingMaker {
    create(config) {
      return createElement(config);
    }
  }

  if(elementMaker) {
    redefineElement(elementMaker, ElementMaker);
  } else {
    customElements.define("element-maker", ElementMaker);
  }
}

const entityRowMaker = customElements.get("entity-row-maker");
if(!entityRowMaker || !entityRowMaker.version || entityRowMaker.version < VERSION) {
  class EntityRowMaker extends ThingMaker {
    create(config) {
      return createEntityRow(config);
    }
  }
  if(entityRowMaker) {
    redefineElement(entityRowMaker, EntityRowMaker);
  } else {
    customElements.define("entity-row-maker", EntityRowMaker);
  }
}
