import { fireEvent } from "./event";
import { selectTree } from "./helpers";

export async function moreInfo(entity, large=false) {
  const root = document.querySelector("hc-main") || document.querySelector("home-assistant");
  fireEvent("hass-more-info", {entityId: entity}, root);
  const el = await selectTree(root, "$ ha-more-info-dialog");
  if(el)
    el.large = large;
  return el;
}
