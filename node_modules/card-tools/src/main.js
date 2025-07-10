import "./card-maker.js"
import { deviceID } from "./deviceID.js";
import { fireEvent } from "./event.js";
import { hass, provideHass, lovelace, lovelace_view } from "./hass.js";
import { LitElement, html, css } from "./lit-element.js";
import { bindActionHandler } from "./action.js";
import { createCard, createElement, createEntityRow } from "./lovelace-element.js";
import { moreInfo } from "./more-info.js";
import { popUp, closePopUp } from "./popup.js";
import { parseTemplate, subscribeRenderTemplate, hasTemplate } from "./templates.js";
import { hasOldTemplate, parseOldTemplate } from "./old-templates.js";
import { getData, areaByName, areaDevices, deviceByName, deviceEntities }  from "./devices";
import { registerCard } from "./editor";
import { yaml2json } from "./yaml";
import { selectTree } from "./helpers";

class CardTools {

  static checkVersion(v) { }

  static args() {}
  static logger() { }
  static get localize() { return hass().localize; }

  static get deviceID() { return deviceID; }

  static get fireEvent() { return fireEvent; }

  static get hass() { return hass(); }
  static get lovelace() { return lovelace(); }
  static get lovelace_view() { return lovelace_view; }
  static get provideHass() { return provideHass; }

  static get LitElement() { return LitElement; }
  static get LitHtml() { return html; }
  static get LitCSS() { return css; }

  static get longpress() { return bindActionHandler; }

  static get createCard() { return createCard; }
  static get createElement() { return createElement; }
  static get createEntityRow() { return createEntityRow; }

  static get moreInfo() { return moreInfo; }

  static get popUp() { return popUp; }
  static get closePopUp() { return closePopUp; }

  static get hasTemplate() { return (tpl) => hasTemplate(tpl) || hasOldTemplate(tpl); }
  static parseTemplate(hass, str, specialData = {}) {
    if (typeof(hass) === "string")
      return parseOldTemplate(hass, str);
    return parseTemplate(hass, str, specialData);
  }
  static get subscribeRenderTemplate() { return subscribeRenderTemplate; }

  static get getData() { return getData; }
  static get areaByName() { return areaByName; }
  static get areaDevices() { return areaDevices; }
  static get deviceByName() { return deviceByName; }
  static get deviceEntities() { return deviceEntities; }

  static get registerCard() { return registerCard; }

  static get yaml2json() { return yaml2json; }

  static get selectTree() { return selectTree; }
}

const pjson = require('../package.json');

if(!customElements.get("card-tools")) {
  customElements.define("card-tools", CardTools);
  window.cardTools = customElements.get('card-tools');
  console.info(`%cCARD-TOOLS ${pjson.version} IS INSTALLED
  %cDeviceID: ${customElements.get('card-tools').deviceID}`,
  "color: green; font-weight: bold",
  "");
}
