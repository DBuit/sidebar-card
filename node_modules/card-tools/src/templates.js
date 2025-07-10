import {hass} from './hass.js';
import {deviceID} from './deviceID.js';

export async function parseTemplate(hass, str, specialData = {}) {
  if (!hass) hass = hass();
  if (typeof(specialData === "string")) specialData = {};
    specialData = Object.assign({
      user: hass.user.name,
      browser: deviceID,
      hash: location.hash.substr(1) || ' ',
    },
    specialData);

    for (var k in specialData) {
      var re = new RegExp(`\\{${k}\\}`, "g");
      str = str.replace(re, specialData[k]);
    }

    return hass.callApi("POST", "template", {template: str});
};

export function hasTemplate(str) {
  if(String(str).includes("{%"))
    return true;
  if(String(str).includes("{{"))
    return true;
}

export function subscribeRenderTemplate(conn, onChange, params, stringify=true) {
  // params = {template, entity_ids, variables}
  if(!conn)
    conn = hass().connection;
  let variables = {
    user: hass().user.name,
    browser: deviceID,
    hash: location.hash.substr(1) || ' ',
    ...params.variables,
  };
  let template = params.template;
  let entity_ids = params.entity_ids;

  return conn.subscribeMessage(
    (msg) => {
      if(stringify) {
        let res = String(msg.result);
        // Localize "_(key)" if found in template results
        const localize_function = /_\([^)]*\)/g;
        res = res.replace(localize_function, (key) => hass().localize(key.substring(2, key.length-1)) || key);
        onChange(res);
      } else {
        onChange(msg.result);
      }
    },
    { type: "render_template",
      template,
      variables,
      entity_ids,
    }
  );
};
