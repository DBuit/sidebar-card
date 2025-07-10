/** Return an icon representing a cover state. */
import { HassEntity } from "home-assistant-js-websocket";
import { domainIcon } from "./domain_icons";

export const coverIcon = (state: HassEntity): string => {
  const open = state.state !== "closed";
  switch (state.attributes.device_class) {
    case "garage":
      return open ? "mdi:garage-open" : "mdi:garage";
    case "door":
      return open ? "mdi:door-open" : "mdi:door-closed";
    case "shutter":
      return open ? "mdi:window-shutter-open" : "mdi:window-shutter";
    case "blind":
      return open ? "mdi:blinds-open" : "mdi:blinds";
    case "window":
      return open ? "mdi:window-open" : "mdi:window-closed";
    default:
      return domainIcon("cover", state.state);
  }
};
