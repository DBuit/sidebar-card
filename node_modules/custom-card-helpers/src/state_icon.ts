import { HassEntity } from "home-assistant-js-websocket";
import { computeDomain } from "./compute-domain";
import { DEFAULT_DOMAIN_ICON } from "./const";
import { binarySensorIcon } from "./binary_sensor_icon";
import { coverIcon } from "./cover_icon";
import { sensorIcon } from "./sensor_icon";
import { inputDateTimeIcon } from "./input_datetime_icon";
import { domainIcon } from "./domain_icons";

const domainIcons = {
  binary_sensor: binarySensorIcon,
  cover: coverIcon,
  sensor: sensorIcon,
  input_datetime: inputDateTimeIcon,
};

export const stateIcon = (state: HassEntity) => {
  if (!state) {
    return DEFAULT_DOMAIN_ICON;
  }
  if (state.attributes.icon) {
    return state.attributes.icon;
  }

  const domain = computeDomain(state.entity_id);

  if (domain in domainIcons) {
    return domainIcons[domain](state);
  }
  return domainIcon(domain, state.state);
};
