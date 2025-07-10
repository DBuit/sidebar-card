import { HomeAssistant, ActionConfig } from "./types";
import { fireEvent } from "./fire-event";
import { forwardHaptic } from "./haptic";
import { navigate } from "./navigate";
import { toggleEntity } from "./toggle-entity";

export const handleClick = (
  node: HTMLElement,
  hass: HomeAssistant,
  config: {
    entity?: string;
    camera_image?: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
    double_tap_action?: ActionConfig;
  },
  hold: boolean,
  dblClick: boolean
): void => {
  let actionConfig: ActionConfig | undefined;

  if (dblClick && config.double_tap_action) {
    actionConfig = config.double_tap_action;
  } else if (hold && config.hold_action) {
    actionConfig = config.hold_action;
  } else if (!hold && config.tap_action) {
    actionConfig = config.tap_action;
  }

  if (!actionConfig) {
    actionConfig = {
      action: "more-info"
    };
  }

  if (
    actionConfig.confirmation &&
    (!actionConfig.confirmation.exemptions ||
      !actionConfig.confirmation.exemptions.some(
        e => e.user === hass!.user!.id
      ))
  ) {
    if (
      !confirm(
        actionConfig.confirmation.text ||
          `Are you sure you want to ${actionConfig.action}?`
      )
    ) {
      return;
    }
  }

  switch (actionConfig.action) {
    case "more-info":
      if (actionConfig.entity || config.entity || config.camera_image) {
        fireEvent(node, "hass-more-info", {
          entityId: actionConfig.entity
            ? actionConfig.entity
            : config.entity
            ? config.entity
            : config.camera_image
        });
        if (actionConfig.haptic) forwardHaptic(actionConfig.haptic);
      }
      break;
    case "navigate":
      if (actionConfig.navigation_path) {
        navigate(node, actionConfig.navigation_path);
        if (actionConfig.haptic) forwardHaptic(actionConfig.haptic);
      }
      break;
    case "url":
      actionConfig.url_path && window.open(actionConfig.url_path);
      if (actionConfig.haptic) forwardHaptic(actionConfig.haptic);
      break;
    case "toggle":
      if (config.entity) {
        toggleEntity(hass, config.entity!);
        if (actionConfig.haptic) forwardHaptic(actionConfig.haptic);
      }
      break;
    case "call-service": {
      if (!actionConfig.service) {
        return;
      }
      const [domain, service] = actionConfig.service.split(".", 2);
      const serviceData = { ...actionConfig.service_data };
      if (serviceData.entity_id === "entity") {
        serviceData.entity_id = config.entity;
      }
      hass.callService(domain, service, serviceData, actionConfig.target);
      if (actionConfig.haptic) forwardHaptic(actionConfig.haptic);
      break;
    }
    case "fire-dom-event": {
      fireEvent(node, "ll-custom", actionConfig);
      if (actionConfig.haptic) forwardHaptic(actionConfig.haptic);
      break;
    }
  }
};
