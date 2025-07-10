import { PropertyValues } from "lit";

import { HomeAssistant } from "./types";

// Check if config or Entity changed
export function hasConfigOrEntityChanged(
  element: any,
  changedProps: PropertyValues,
  forceUpdate: Boolean,
): boolean {
  if (changedProps.has('config') || forceUpdate) {
    return true;
  }

  if (element.config!.entity) {
    const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
    if (oldHass) {
      return (
        oldHass.states[element.config!.entity]
        !== element.hass!.states[element.config!.entity]
      );
    }
    return true;
  } else {
    return false;
  }
}