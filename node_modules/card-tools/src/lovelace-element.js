import { fireEvent } from "./event";
import { load_lovelace } from "./hass";

export const CUSTOM_TYPE_PREFIX = "custom:";

export const DOMAINS_HIDE_MORE_INFO = [
  "input_number",
  "input_select",
  "input_text",
  "scene",
  "weblink",
];

let helpers = window.cardHelpers;
const helperPromise = new Promise(async (resolve, reject) => {
  if(helpers) resolve();

  const updateHelpers = async () => {
    helpers = await window.loadCardHelpers();
    window.cardHelpers = helpers;
    resolve();
  }

  if(window.loadCardHelpers) {
    updateHelpers();
  } else {
    // If loadCardHelpers didn't exist, force load lovelace and try once more.
    window.addEventListener("load", async () => {
      load_lovelace();
      if(window.loadCardHelpers) {
        updateHelpers();
      }
    });
  }
});

function errorElement(error, origConfig) {
  const cfg = {
    type: "error",
    error,
    origConfig,
  };
  const el = document.createElement("hui-error-card");
  customElements.whenDefined("hui-error-card").then(() => {
    const newel = document.createElement("hui-error-card");
    newel.setConfig(cfg);
    if(el.parentElement)
      el.parentElement.replaceChild(newel, el);
  });
  helperPromise.then(() => {
    fireEvent("ll-rebuild", {}, el);
  });
  return el;
}

function _createElement(tag, config) {
  let el = document.createElement(tag);
  try {
    el.setConfig(JSON.parse(JSON.stringify(config)));
  } catch (err) {
    el = errorElement(err, config);
  }
  helperPromise.then(() => {
    fireEvent("ll-rebuild", {}, el);
  });
  return el;
}

function createLovelaceElement(thing, config) {
  if(!config || typeof config !== "object" || !config.type)
    return errorElement(`No ${thing} type configured`, config);

  let tag = config.type;
  if(tag.startsWith(CUSTOM_TYPE_PREFIX))
    tag = tag.substr(CUSTOM_TYPE_PREFIX.length);
  else
    tag = `hui-${tag}-${thing}`;

  if(customElements.get(tag))
    return _createElement(tag, config);

  const el = errorElement(`Custom element doesn't exist: ${tag}.`, config);
  el.style.display = "None";

  const timer = setTimeout(() => {
    el.style.display = "";
  }, 2000);

  customElements.whenDefined(tag).then(() => {
    clearTimeout(timer);
    fireEvent("ll-rebuild", {}, el);
  });

  return el;
}

export function createCard(config) {
  if(helpers) return helpers.createCardElement(config);
  return createLovelaceElement('card', config);
}
export function createElement(config) {
  if(helpers) return helpers.createHuiElement(config);
  return createLovelaceElement('element', config);
}
export function createEntityRow(config) {
  if(helpers) return helpers.createRowElement(config);
  const SPECIAL_TYPES = new Set([
    "call-service",
    "cast",
    "conditional",
    "divider",
    "section",
    "select",
    "weblink",
  ]);
  const DEFAULT_ROWS = {
    alert: "toggle",
    automation: "toggle",
    climate: "climate",
    cover: "cover",
    fan: "toggle",
    group: "group",
    input_boolean: "toggle",
    input_number: "input-number",
    input_select: "input-select",
    input_text: "input-text",
    light: "toggle",
    lock: "lock",
    media_player: "media-player",
    remote: "toggle",
    scene: "scene",
    script: "script",
    sensor: "sensor",
    timer: "timer",
    switch: "toggle",
    vacuum: "toggle",
    water_heater: "climate",
    input_datetime: "input-datetime",
    none: undefined,
  };

  if(!config)
    return errorElement("Invalid configuration given.", config);
  if(typeof config === "string")
    config = {entity: config};
  if(typeof config !== "object" || (!config.entity && !config.type))
    return errorElement("Invalid configuration given.", config);

  const type = config.type || "default";
  if(SPECIAL_TYPES.has(type) || type.startsWith(CUSTOM_TYPE_PREFIX))
    return createLovelaceElement('row', config);

  const domain = config.entity ? config.entity.split(".", 1)[0]: "none";
  return createLovelaceElement('entity-row', {
    type: DEFAULT_ROWS[domain] || "text",
    ...config
  });
}
