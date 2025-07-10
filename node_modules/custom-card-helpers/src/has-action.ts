import { ActionConfig } from "./types";

export function hasAction(config?: ActionConfig): boolean {
  return config !== undefined && config.action !== "none";
}
