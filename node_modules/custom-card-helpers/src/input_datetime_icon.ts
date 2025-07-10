/** Return an icon representing an input datetime state. */
import { domainIcon } from "./domain_icons";
import { HassEntity } from "home-assistant-js-websocket";

export const inputDateTimeIcon = (state: HassEntity): string => {
  if (!state.attributes.has_date) {
    return "mdi:clock";
  }
  if (!state.attributes.has_time) {
    return "mdi:calendar";
  }
  return domainIcon("input_datetime");
};
