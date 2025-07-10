import { HassEntity } from "home-assistant-js-websocket";
import { computeDomain } from "./compute-domain";

export function computeStateDomain(stateObj: HassEntity) {
  return computeDomain(stateObj.entity_id);
}
