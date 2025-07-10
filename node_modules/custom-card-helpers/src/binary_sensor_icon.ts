import { HassEntity } from "home-assistant-js-websocket";

/** Return an icon representing a binary sensor state. */

export const binarySensorIcon = (state?: string, stateObj?: HassEntity) => {
  const is_off = state === "off";
  switch (stateObj?.attributes.device_class) {
    case "battery":
      return is_off ? "mdi:battery" : "mdi:battery-outline";
    case "battery_charging":
      return is_off ? "mdi:battery" : "mdi:battery-charging";
    case "cold":
      return is_off ? "mdi:thermometer" : "mdi:snowflake";
    case "connectivity":
      return is_off ? "mdi:server-network-off" : "mdi:server-network";
    case "door":
      return is_off ? "mdi:door-closed" : "mdi:door-open";
    case "garage_door":
      return is_off ? "mdi:garage" : "mdi:garage-open";
    case "power":
      return is_off ? "mdi:power-plug-off" : "mdi:power-plug";
    case "gas":
    case "problem":
    case "safety":
    case "tamper":
      return is_off ? "mdi:check-circle" : "mdi:alert-circle";
    case "smoke":
      return is_off ? "mdi:check-circle" : "mdi:smoke";
    case "heat":
      return is_off ? "mdi:thermometer" : "mdi:fire";
    case "light":
      return is_off ? "mdi:brightness-5" : "mdi:brightness-7";
    case "lock":
      return is_off ? "mdi:lock" : "mdi:lock-open";
    case "moisture":
      return is_off ? "mdi:water-off" : "mdi:water";
    case "motion":
      return is_off ? "mdi:walk" : "mdi:run";
    case "occupancy":
      return is_off ? "mdi:home-outline" : "mdi:home";
    case "opening":
      return is_off ? "mdi:square" : "mdi:square-outline";
    case "plug":
      return is_off ? "mdi:power-plug-off" : "mdi:power-plug";
    case "presence":
      return is_off ? "mdi:home-outline" : "mdi:home";
    case "running":
      return is_off ? "mdi:stop" : "mdi:play";
    case "sound":
      return is_off ? "mdi:music-note-off" : "mdi:music-note";
    case "update":
      return is_off ? "mdi:package" : "mdi:package-up";
    case "vibration":
      return is_off ? "mdi:crop-portrait" : "mdi:vibrate";
    case "window":
      return is_off ? "mdi:window-closed" : "mdi:window-open";
    default:
      return is_off ? "mdi:radiobox-blank" : "mdi:checkbox-marked-circle";
  }
};
