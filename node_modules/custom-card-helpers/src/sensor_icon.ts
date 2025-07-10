/** Return an icon representing a sensor state. */
import { HassEntity } from "home-assistant-js-websocket";
import { UNIT_C, UNIT_F } from "./const";
import { domainIcon } from "./domain_icons";

const fixedDeviceClassIcons = {
  humidity: "mdi:water-percent",
  illuminance: "mdi:brightness-5",
  temperature: "mdi:thermometer",
  pressure: "mdi:gauge",
  power: "mdi:flash",
  signal_strength: "mdi:wifi",
};

export const sensorIcon = (state: HassEntity) => {
  const dclass = state.attributes.device_class;

  if (dclass && dclass in fixedDeviceClassIcons) {
    return fixedDeviceClassIcons[dclass];
  }
  if (dclass === "battery") {
    const battery = Number(state.state);
    if (isNaN(battery)) {
      return "mdi:battery-unknown";
    }
    const batteryRound = Math.round(battery / 10) * 10;
    if (batteryRound >= 100) {
      return "mdi:battery";
    }
    if (batteryRound <= 0) {
      return "mdi:battery-alert";
    }
    // Will return one of the following icons: (listed so extractor picks up)
    // mdi:battery-10
    // mdi:battery-20
    // mdi:battery-30
    // mdi:battery-40
    // mdi:battery-50
    // mdi:battery-60
    // mdi:battery-70
    // mdi:battery-80
    // mdi:battery-90
    // We obscure 'hass' in iconname so this name does not get picked up
    return `${"hass"}:battery-${batteryRound}`;
  }

  const unit = state.attributes.unit_of_measurement;
  if (unit === UNIT_C || unit === UNIT_F) {
    return "mdi:thermometer";
  }
  return domainIcon("sensor");
};
